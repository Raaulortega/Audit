export interface HeaderConfig {
  hsts: { enabled: boolean; maxAge: number; includeSubDomains: boolean; preload: boolean };
  csp: { enabled: boolean; directives: Record<string, string>; upgradeInsecureRequests: boolean };
  frameOptions: 'DENY' | 'SAMEORIGIN' | 'off';
  contentTypeOptions: boolean;
  referrerPolicy: string;
  permissionsPolicy: { enabled: boolean; blocked: string[] };
  coop: 'same-origin' | 'same-origin-allow-popups' | 'off';
  corp: 'same-origin' | 'same-site' | 'cross-origin' | 'off';
}

export interface HeaderEntry {
  key: string;
  value: string;
}

export const CSP_DIRECTIVES = [
  'default-src',
  'script-src',
  'style-src',
  'img-src',
  'font-src',
  'connect-src',
  'frame-src',
  'object-src',
  'base-uri',
  'form-action',
  'frame-ancestors',
] as const;

export const PERMISSIONS_FEATURES = [
  'camera',
  'microphone',
  'geolocation',
  'payment',
  'usb',
  'bluetooth',
  'serial',
  'magnetometer',
  'gyroscope',
  'accelerometer',
  'display-capture',
];

export const REFERRER_POLICIES = [
  'no-referrer',
  'strict-origin',
  'strict-origin-when-cross-origin',
  'same-origin',
  'origin',
  'unsafe-url',
  'off',
];

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  hsts: { enabled: true, maxAge: 63_072_000, includeSubDomains: true, preload: true },
  csp: {
    enabled: true,
    directives: {
      'default-src': "'self'",
      'script-src': "'self'",
      'style-src': "'self'",
      'img-src': "'self' data:",
      'font-src': "'self'",
      'connect-src': "'self'",
      'frame-src': '',
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
      'frame-ancestors': "'none'",
    },
    upgradeInsecureRequests: true,
  },
  frameOptions: 'DENY',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: { enabled: true, blocked: ['camera', 'microphone', 'geolocation', 'payment', 'usb'] },
  coop: 'same-origin',
  corp: 'same-origin',
};

export function buildCsp(csp: HeaderConfig['csp']): string {
  const parts = CSP_DIRECTIVES.filter((name) => csp.directives[name]?.trim()).map(
    (name) => `${name} ${csp.directives[name].trim()}`,
  );
  if (csp.upgradeInsecureRequests) parts.push('upgrade-insecure-requests');
  return parts.join('; ');
}

export function buildHeaders(config: HeaderConfig): HeaderEntry[] {
  const headers: HeaderEntry[] = [];

  if (config.hsts.enabled) {
    const parts = [`max-age=${config.hsts.maxAge}`];
    if (config.hsts.includeSubDomains) parts.push('includeSubDomains');
    if (config.hsts.preload) parts.push('preload');
    headers.push({ key: 'Strict-Transport-Security', value: parts.join('; ') });
  }
  if (config.csp.enabled) {
    const value = buildCsp(config.csp);
    if (value) headers.push({ key: 'Content-Security-Policy', value });
  }
  if (config.frameOptions !== 'off') headers.push({ key: 'X-Frame-Options', value: config.frameOptions });
  if (config.contentTypeOptions) headers.push({ key: 'X-Content-Type-Options', value: 'nosniff' });
  if (config.referrerPolicy !== 'off') headers.push({ key: 'Referrer-Policy', value: config.referrerPolicy });
  if (config.permissionsPolicy.enabled && config.permissionsPolicy.blocked.length > 0) {
    headers.push({
      key: 'Permissions-Policy',
      value: config.permissionsPolicy.blocked.map((feature) => `${feature}=()`).join(', '),
    });
  }
  if (config.coop !== 'off') headers.push({ key: 'Cross-Origin-Opener-Policy', value: config.coop });
  if (config.corp !== 'off') headers.push({ key: 'Cross-Origin-Resource-Policy', value: config.corp });

  return headers;
}

export function toVercelJson(headers: HeaderEntry[]): string {
  return JSON.stringify({ headers: [{ source: '/(.*)', headers }] }, null, 2);
}

export function toNginx(headers: HeaderEntry[]): string {
  return headers.map(({ key, value }) => `add_header ${key} "${value.replace(/"/g, '\\"')}" always;`).join('\n');
}

export function toNetlify(headers: HeaderEntry[]): string {
  return ['/*', ...headers.map(({ key, value }) => `  ${key}: ${value}`)].join('\n');
}

export function toApache(headers: HeaderEntry[]): string {
  return [
    '<IfModule mod_headers.c>',
    ...headers.map(({ key, value }) => `  Header always set ${key} "${value.replace(/"/g, '\\"')}"`),
    '</IfModule>',
  ].join('\n');
}

export function toExpress(headers: HeaderEntry[]): string {
  return [
    "app.disable('x-powered-by');",
    'app.use((req, res, next) => {',
    ...headers.map(({ key, value }) => `  res.setHeader('${key}', ${JSON.stringify(value)});`),
    '  next();',
    '});',
  ].join('\n');
}

export const HEADER_FORMATS = [
  { id: 'vercel', label: 'vercel.json', render: toVercelJson },
  { id: 'nginx', label: 'nginx', render: toNginx },
  { id: 'netlify', label: 'Netlify _headers', render: toNetlify },
  { id: 'apache', label: 'Apache', render: toApache },
  { id: 'express', label: 'Express', render: toExpress },
] as const;
