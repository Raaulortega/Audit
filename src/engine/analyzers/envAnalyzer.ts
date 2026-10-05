import type { Finding } from '../types';
import { splitLines } from '../lineUtils';

interface EnvEntry {
  key: string;
  value: string;
  line: number;
}

const CLIENT_EXPOSED_PREFIX = /^(NEXT_PUBLIC_|VITE_|REACT_APP_|EXPO_PUBLIC_|NUXT_PUBLIC_|PUBLIC_|GATSBY_)/;
const SERVER_ONLY_NAME = /SECRET|PRIVATE|PASSWORD|PASSWD|SERVICE_ROLE|DATABASE_URL|DB_PASS/;
const CREDENTIAL_NAME = /PASS(WORD|WD)?$|_PASS_|SECRET|TOKEN$|_KEY$|APIKEY/;
const SIGNING_SECRET_NAME = /JWT_SECRET|SESSION_SECRET|SECRET_KEY|APP_KEY|COOKIE_SECRET/;
const WEAK_VALUES = new Set([
  'password',
  'passw0rd',
  'admin',
  'root',
  'toor',
  'test',
  'secret',
  'changeme',
  'default',
  'qwerty',
  'letmein',
  'postgres',
  'mysql',
  '123456',
  '12345678',
  'admin123',
  'password123',
]);
const LOCAL_HOST = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|host\.docker\.internal)(:|\/|$)/i;

export function parseEnv(content: string): EnvEntry[] {
  const entries: EnvEntry[] = [];
  splitLines(content).forEach((raw, index) => {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_.]*)\s*=\s*(.*)$/.exec(raw);
    if (!match) return;
    let value = match[2].trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.lastIndexOf(quote) > 0) {
      value = value.slice(1, value.lastIndexOf(quote));
    } else {
      value = value.replace(/\s+#.*$/, '');
    }
    entries.push({ key: match[1], value, line: index + 1 });
  });
  return entries;
}

export function analyzeEnvFile(content: string): Finding[] {
  const findings: Finding[] = [];

  for (const { key, value, line } of parseEnv(content)) {
    const upperKey = key.toUpperCase();
    const lowerValue = value.toLowerCase();
    const base = { sourceFile: '.env', line };

    if (CLIENT_EXPOSED_PREFIX.test(upperKey) && SERVER_ONLY_NAME.test(upperKey) && value.length > 0) {
      findings.push({
        ...base,
        id: `env-client-exposed-${key}`,
        severity: 'critical',
        category: 'Secret Exposure',
        title: `${key} ships a server secret to the browser`,
        description:
          'Variables with a public prefix (NEXT_PUBLIC_, VITE_, REACT_APP_…) are inlined into the client bundle at build time. Anyone can read them from DevTools.',
        fixSnippet: `# Drop the public prefix and read it only on the server
${key.replace(CLIENT_EXPOSED_PREFIX, '')}=...`,
        references: ['CWE-200', 'OWASP A01:2021'],
      });
    }

    if (CREDENTIAL_NAME.test(upperKey) && WEAK_VALUES.has(lowerValue)) {
      findings.push({
        ...base,
        id: `env-weak-credential-${key}`,
        severity: 'critical',
        category: 'Weak Credential',
        title: `${key} uses a default/weak value`,
        description: `"${value}" appears in every credential-stuffing wordlist. Default passwords are among the first things attackers try.`,
        fixSnippet: `# Generate a strong random value
${key}=$(openssl rand -base64 32)`,
        references: ['CWE-521', 'CWE-1392', 'OWASP A07:2021'],
      });
    } else if (SIGNING_SECRET_NAME.test(upperKey) && value.length > 0 && value.length < 32) {
      findings.push({
        ...base,
        id: `env-short-signing-secret-${key}`,
        severity: 'medium',
        category: 'Weak Cryptography',
        title: `${key} is shorter than 32 characters`,
        description:
          'Short HMAC signing secrets can be brute-forced offline from a single signed token or cookie, letting attackers forge sessions.',
        fixSnippet: `${key}=$(openssl rand -hex 32)`,
        references: ['CWE-326', 'OWASP A02:2021'],
      });
    }

    if (/(^|_)DEBUG$/.test(upperKey) && /^(true|1|yes|on|\*)$/i.test(value)) {
      findings.push({
        ...base,
        id: `env-debug-${key}`,
        severity: 'medium',
        category: 'Debug Mode',
        title: `${key} enables debug mode`,
        description:
          'Debug mode often exposes stack traces, environment variables and interactive consoles (e.g. Werkzeug, Laravel Ignition) to anyone who can trigger an error.',
        fixSnippet: `${key}=false`,
        references: ['CWE-489', 'CWE-215'],
      });
    }

    if (upperKey === 'NODE_TLS_REJECT_UNAUTHORIZED' && value === '0') {
      findings.push({
        ...base,
        id: 'env-tls-verification-disabled',
        severity: 'critical',
        category: 'Insecure Transport',
        title: 'TLS certificate verification disabled',
        description:
          'NODE_TLS_REJECT_UNAUTHORIZED=0 makes every HTTPS request in the process accept any certificate, enabling trivial man-in-the-middle attacks.',
        fixSnippet: `# Remove the variable; if you need a private CA, trust it explicitly:
NODE_EXTRA_CA_CERTS=/path/to/ca.pem`,
        references: ['CWE-295', 'OWASP A02:2021'],
      });
    }

    if (/sslmode=disable|ssl=false|tls=false/i.test(value)) {
      findings.push({
        ...base,
        id: `env-db-ssl-disabled-${key}`,
        severity: 'medium',
        category: 'Insecure Transport',
        title: `${key} disables TLS for the connection`,
        description: 'Credentials and query data travel in cleartext between the app and the service.',
        fixSnippet: `${key}=...?sslmode=verify-full`,
        references: ['CWE-319'],
      });
    } else if (/^http:\/\//i.test(value) && !LOCAL_HOST.test(value)) {
      findings.push({
        ...base,
        id: `env-plain-http-${key}`,
        severity: 'low',
        category: 'Insecure Transport',
        title: `${key} points to a plain-HTTP endpoint`,
        description: 'Requests to non-local HTTP endpoints can be intercepted or modified in transit.',
        fixSnippet: `${key}=${value.replace(/^http:/i, 'https:')}`,
        references: ['CWE-319'],
      });
    }

    if (/CORS/.test(upperKey) && value === '*') {
      findings.push({
        ...base,
        id: `env-cors-wildcard-${key}`,
        severity: 'medium',
        category: 'CORS',
        title: `${key} allows every origin`,
        description: 'A wildcard CORS policy lets any website read responses from your API from a victim’s browser.',
        fixSnippet: `${key}=https://app.example.com`,
        references: ['CWE-942', 'OWASP A05:2021'],
      });
    }
  }

  return findings;
}
