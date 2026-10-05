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
  references: string[];
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
    references: ['CWE-319', 'OWASP A05:2021'],
  },
  {
    key: 'content-security-policy',
    severity: 'critical',
    title: 'Missing Content-Security-Policy header',
    description: 'CSP restricts which sources scripts, styles, and other resources can load from, mitigating XSS.',
    fixSnippet: `{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'"
}`,
    references: ['CWE-693', 'OWASP A03:2021'],
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
    references: ['CWE-1021'],
  },
  {
    key: 'x-content-type-options',
    severity: 'medium',
    title: 'Missing X-Content-Type-Options header',
    description: 'Prevents browsers from MIME-sniffing a response away from its declared content type.',
    fixSnippet: `{
  "key": "X-Content-Type-Options",
  "value": "nosniff"
}`,
    references: ['CWE-693'],
  },
  {
    key: 'referrer-policy',
    severity: 'low',
    title: 'Missing Referrer-Policy header',
    description: 'Without it, full URLs (including tokens in query strings) can leak to third-party sites via the Referer header.',
    fixSnippet: `{
  "key": "Referrer-Policy",
  "value": "strict-origin-when-cross-origin"
}`,
    references: ['CWE-200'],
  },
  {
    key: 'permissions-policy',
    severity: 'low',
    title: 'Missing Permissions-Policy header',
    description: 'Restricts powerful browser features (camera, microphone, geolocation) so injected scripts cannot use them.',
    fixSnippet: `{
  "key": "Permissions-Policy",
  "value": "camera=(), microphone=(), geolocation=()"
}`,
    references: ['OWASP A05:2021'],
  },
];

const MIN_HSTS_MAX_AGE = 15_552_000; // 180 days

/** Rule metadata exposed to the rule catalog. */
export const VERCEL_HEADER_RULES = REQUIRED_HEADERS.map(({ key, severity, title, references }) => ({
  id: `vercel-${key}`,
  severity,
  title,
  references,
}));

/** Returns the source list of one CSP directive, or undefined when the directive is absent. */
function cspDirective(csp: string, name: string): string | undefined {
  const directive = csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith(`${name} `) || part.toLowerCase() === name);
  return directive?.slice(name.length).trim();
}

export function analyzeVercelConfig(content: string): Finding[] {
  const config = JSON.parse(content) as VercelConfig;
  const headers = new Map<string, string>();

  for (const block of config.headers ?? []) {
    for (const header of block.headers ?? []) {
      headers.set(header.key.toLowerCase(), String(header.value ?? ''));
    }
  }

  const findings: Finding[] = [];
  const base = { category: 'Security Headers', sourceFile: 'vercel.json' };

  for (const rule of REQUIRED_HEADERS) {
    if (!headers.has(rule.key)) {
      findings.push({
        ...base,
        id: `vercel-${rule.key}`,
        severity: rule.severity,
        title: rule.title,
        description: rule.description,
        fixSnippet: rule.fixSnippet,
        references: rule.references,
      });
    }
  }

  const csp = headers.get('content-security-policy');
  if (csp) {
    const severeWeaknesses: string[] = [];
    const minorWeaknesses: string[] = [];
    // Scripts are governed by script-src, falling back to default-src; style-src 'unsafe-inline' is far less risky.
    const scriptSources = cspDirective(csp, 'script-src') ?? cspDirective(csp, 'default-src') ?? '';
    if (/'unsafe-inline'/.test(scriptSources) && !/'nonce-|'sha(256|384|512)-|'strict-dynamic'/.test(scriptSources)) {
      severeWeaknesses.push("'unsafe-inline' scripts");
    }
    if (/'unsafe-eval'/.test(scriptSources)) severeWeaknesses.push("'unsafe-eval'");
    if (/(^|\s)(\*|https?:|data:)(\s|$)/.test(scriptSources)) severeWeaknesses.push('wildcard or scheme-only script source');
    if (!/object-src\s+'none'/.test(csp) && !/default-src\s+'none'/.test(csp)) minorWeaknesses.push("no object-src 'none'");
    if (!/frame-ancestors/.test(csp)) minorWeaknesses.push('no frame-ancestors');
    const weaknesses = [...severeWeaknesses, ...minorWeaknesses];
    if (weaknesses.length > 0) {
      findings.push({
        ...base,
        id: 'vercel-weak-csp',
        severity: severeWeaknesses.length > 0 ? 'medium' : 'low',
        title: 'Content-Security-Policy is permissive',
        description: `The policy has gaps that weaken XSS protection: ${weaknesses.join(', ')}.`,
        fixSnippet: `{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
}`,
        references: ['CWE-693', 'OWASP A03:2021'],
      });
    }
  }

  const hsts = headers.get('strict-transport-security');
  const maxAge = hsts === undefined ? null : Number(/max-age=(\d+)/i.exec(hsts)?.[1] ?? 0);
  if (maxAge !== null && maxAge < MIN_HSTS_MAX_AGE) {
    findings.push({
      ...base,
      id: 'vercel-short-hsts',
      severity: 'low',
      title: `HSTS max-age is too short (${maxAge}s)`,
      description: 'A short max-age lets the browser forget the HTTPS-only rule quickly, re-opening the downgrade window.',
      fixSnippet: `{
  "key": "Strict-Transport-Security",
  "value": "max-age=63072000; includeSubDomains; preload"
}`,
      references: ['CWE-319'],
    });
  }

  if (headers.get('access-control-allow-origin')?.trim() === '*') {
    const withCredentials = headers.get('access-control-allow-credentials')?.trim().toLowerCase() === 'true';
    findings.push({
      ...base,
      id: 'vercel-cors-wildcard',
      category: 'CORS',
      severity: withCredentials ? 'critical' : 'medium',
      title: withCredentials
        ? 'CORS allows any origin together with credentials'
        : 'Access-Control-Allow-Origin set to *',
      description: withCredentials
        ? 'Wildcard origin plus credentials signals a broken CORS setup: servers "fixing" it by reflecting the Origin header let any site make authenticated requests and read the response.'
        : 'Any website can read responses from these routes from a visitor’s browser.',
      fixSnippet: `{
  "key": "Access-Control-Allow-Origin",
  "value": "https://app.example.com"
}`,
      references: ['CWE-942', 'OWASP A05:2021'],
    });
  }

  const poweredBy = headers.get('x-powered-by');
  if (poweredBy !== undefined) {
    findings.push({
      ...base,
      id: 'vercel-x-powered-by',
      category: 'Information Disclosure',
      severity: 'low',
      title: `X-Powered-By header discloses "${poweredBy}"`,
      description: 'Advertising the server framework helps attackers fingerprint the stack and pick known exploits.',
      fixSnippet: '// Remove the X-Powered-By entry from "headers"',
      references: ['CWE-200'],
    });
  }

  return findings;
}
