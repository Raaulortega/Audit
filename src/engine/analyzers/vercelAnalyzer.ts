import type { Finding, Severity } from '../types';

interface VercelHeaderRule {
  key: string;
  value: string;
}

interface VercelHeaderBlock {
  source: string;
  headers: VercelHeaderRule[];
}

interface VercelConfig {
  headers?: VercelHeaderBlock[];
}

interface RequiredHeaderRule {
  key: string;
  severity: Severity;
  title: string;
  description: string;
  fixSnippet: string;
}

const REQUIRED_HEADERS: RequiredHeaderRule[] = [
  {
    key: 'strict-transport-security',
    severity: 'critical',
    title: 'Missing Strict-Transport-Security header',
    description: 'HSTS forces browsers to use HTTPS, preventing downgrade and SSL-stripping attacks.',
    fixSnippet: `{
  "key": "Strict-Transport-Security",
  "value": "max-age=63072000; includeSubDomains; preload"
}`,
  },
  {
    key: 'content-security-policy',
    severity: 'critical',
    title: 'Missing Content-Security-Policy header',
    description: "CSP restricts which sources scripts, styles, and other resources can load from, mitigating XSS.",
    fixSnippet: `{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'"
}`,
  },
  {
    key: 'x-frame-options',
    severity: 'medium',
    title: 'Missing X-Frame-Options header',
    description: 'Prevents the site from being embedded in an iframe, mitigating clickjacking attacks.',
    fixSnippet: `{
  "key": "X-Frame-Options",
  "value": "DENY"
}`,
  },
  {
    key: 'x-content-type-options',
    severity: 'medium',
    title: 'Missing X-Content-Type-Options header',
    description: "Prevents browsers from MIME-sniffing a response away from its declared content type.",
    fixSnippet: `{
  "key": "X-Content-Type-Options",
  "value": "nosniff"
}`,
  },
];

export function analyzeVercelConfig(content: string): Finding[] {
  const config = JSON.parse(content) as VercelConfig;
  const presentKeys = new Set<string>();

  for (const block of config.headers ?? []) {
    for (const header of block.headers ?? []) {
      presentKeys.add(header.key.toLowerCase());
    }
  }

  const findings: Finding[] = [];
  for (const rule of REQUIRED_HEADERS) {
    if (!presentKeys.has(rule.key)) {
      findings.push({
        id: `vercel-${rule.key}`,
        severity: rule.severity,
        category: 'Security Headers',
        title: rule.title,
        description: rule.description,
        fixSnippet: rule.fixSnippet,
        sourceFile: 'vercel.json',
      });
    }
  }

  return findings;
}
