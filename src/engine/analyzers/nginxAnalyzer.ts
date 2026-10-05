import type { Finding } from '../types';
import { findLine, splitLines } from '../lineUtils';

const WEAK_PROTOCOLS = ['SSLv2', 'SSLv3', 'TLSv1', 'TLSv1.1'];
const WEAK_CIPHER = /\b(RC4|DES|3DES|MD5|NULL|EXPORT|aNULL|eNULL)\b/;
const RECOMMENDED_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': '"max-age=63072000; includeSubDomains; preload"',
  'X-Content-Type-Options': '"nosniff"',
  'X-Frame-Options': '"DENY"',
  'Content-Security-Policy': `"default-src 'self'"`,
};

export function analyzeNginxConf(content: string): Finding[] {
  const lines = splitLines(content).map((line) => line.replace(/#.*$/, ''));
  const text = lines.join('\n');
  const findings: Finding[] = [];
  const base = { sourceFile: 'nginx.conf' };

  if (!/^\s*server_tokens\s+off\s*;/m.test(text)) {
    findings.push({
      ...base,
      id: 'nginx-server-tokens',
      severity: 'low',
      category: 'Information Disclosure',
      title: 'nginx version is advertised (server_tokens)',
      description: 'The Server header and error pages reveal the exact nginx version, helping attackers pick matching exploits.',
      fixSnippet: `http {
    server_tokens off;
}`,
      references: ['CWE-200'],
    });
  }

  const autoindexLine = findLine(lines, /^\s*autoindex\s+on\s*;/);
  if (autoindexLine) {
    findings.push({
      ...base,
      id: 'nginx-autoindex',
      severity: 'medium',
      category: 'Information Disclosure',
      title: 'Directory listing enabled (autoindex on)',
      description: 'Directory listings expose backups, source maps and other files that were never meant to be linked.',
      fixSnippet: 'autoindex off;',
      line: autoindexLine,
      references: ['CWE-548', 'OWASP A05:2021'],
    });
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const protocols = /^\s*ssl_protocols\s+([^;]+);/.exec(line)?.[1].trim().split(/\s+/) ?? [];
    const weak = protocols.filter((protocol) => WEAK_PROTOCOLS.includes(protocol));
    if (weak.length > 0) {
      findings.push({
        ...base,
        id: `nginx-weak-tls-L${lineNumber}`,
        severity: 'critical',
        category: 'Weak Cryptography',
        title: `Deprecated TLS protocols enabled: ${weak.join(', ')}`,
        description: 'SSLv3, TLS 1.0 and 1.1 are deprecated (RFC 8996) and exposed to POODLE/BEAST-class downgrade attacks.',
        fixSnippet: 'ssl_protocols TLSv1.2 TLSv1.3;',
        line: lineNumber,
        references: ['CWE-327', 'OWASP A02:2021'],
      });
    }

    const ciphers = /^\s*ssl_ciphers\s+["']?([^;"']+)/.exec(line)?.[1];
    if (ciphers && ciphers.split(':').some((cipher) => !cipher.startsWith('!') && WEAK_CIPHER.test(cipher))) {
      findings.push({
        ...base,
        id: `nginx-weak-ciphers-L${lineNumber}`,
        severity: 'critical',
        category: 'Weak Cryptography',
        title: 'Weak cipher suites allowed',
        description: 'RC4, DES, 3DES, MD5, NULL and EXPORT ciphers can be broken or downgraded by an active attacker.',
        fixSnippet: `ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
ssl_prefer_server_ciphers off;`,
        line: lineNumber,
        references: ['CWE-327', 'OWASP A02:2021'],
      });
    }

    if (/^\s*add_header\s+Access-Control-Allow-Origin\s+["']?\*["']?/i.test(line)) {
      findings.push({
        ...base,
        id: `nginx-cors-wildcard-L${lineNumber}`,
        severity: 'medium',
        category: 'CORS',
        title: 'Access-Control-Allow-Origin set to *',
        description: 'Any website can read responses from this location from a visitor’s browser.',
        fixSnippet: 'add_header Access-Control-Allow-Origin "https://app.example.com" always;',
        line: lineNumber,
        references: ['CWE-942'],
      });
    }
  });

  // Off-by-slash: `location /static { alias /var/www/static/; }` lets `/static../` escape the alias root.
  const aliasPattern = /location\s+([^\s{]+)\s*\{[^}]*?\balias\s+([^;\s]+)\s*;/g;
  for (const match of text.matchAll(aliasPattern)) {
    const [, location, aliasPath] = match;
    if (!location.endsWith('/') && aliasPath.endsWith('/') && !location.startsWith('~')) {
      const line = text.slice(0, match.index ?? 0).split('\n').length;
      findings.push({
        ...base,
        id: `nginx-alias-traversal-L${line}`,
        severity: 'critical',
        category: 'Path Traversal',
        title: `Alias traversal in "location ${location}"`,
        description: `The location lacks a trailing slash but the alias has one, so a request to "${location}../" resolves outside "${aliasPath}" and exposes parent directories (off-by-slash).`,
        fixSnippet: `location ${location}/ {
    alias ${aliasPath};
}`,
        line,
        references: ['CWE-22', 'OWASP A01:2021'],
      });
    }
  }

  const listens443 = /^\s*listen\s+[^;]*\b443\b/m.test(text);
  const listen80Line = findLine(lines, /^\s*listen\s+(?:\[::\]:)?80\b/);
  if (listen80Line && !listens443) {
    findings.push({
      ...base,
      id: 'nginx-no-https',
      severity: 'medium',
      category: 'Insecure Transport',
      title: 'Server only listens on plain HTTP',
      description: 'Traffic, cookies and credentials are sent in cleartext.',
      fixSnippet: `server {
    listen 443 ssl;
    http2 on;
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
}`,
      line: listen80Line,
      references: ['CWE-319', 'OWASP A02:2021'],
    });
  } else if (listen80Line && !/return\s+30[18]\s+https:\/\//.test(text)) {
    findings.push({
      ...base,
      id: 'nginx-no-https-redirect',
      severity: 'low',
      category: 'Insecure Transport',
      title: 'HTTP is not redirected to HTTPS',
      description: 'Users that type the bare domain stay on an unencrypted connection.',
      fixSnippet: `server {
    listen 80;
    return 301 https://$host$request_uri;
}`,
      line: listen80Line,
      references: ['CWE-319'],
    });
  }

  const missingHeaders = Object.keys(RECOMMENDED_HEADERS).filter(
    (header) => !new RegExp(`add_header\\s+${header}\\b`, 'i').test(text),
  );
  if (missingHeaders.length > 0) {
    findings.push({
      ...base,
      id: 'nginx-missing-security-headers',
      severity: listens443 && missingHeaders.includes('Strict-Transport-Security') ? 'medium' : 'low',
      category: 'Security Headers',
      title: `Missing security headers: ${missingHeaders.join(', ')}`,
      description:
        'Security headers harden the browser against XSS, clickjacking, MIME sniffing and protocol downgrade. Note: any add_header inside a nested block discards headers inherited from the parent.',
      fixSnippet: missingHeaders.map((header) => `add_header ${header} ${RECOMMENDED_HEADERS[header]} always;`).join('\n'),
      references: ['OWASP A05:2021'],
    });
  }

  return findings;
}
