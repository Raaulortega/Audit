import type { Severity } from './types';

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  signingInput: string;
}

export interface JwtIssue {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  references: string[];
}

/**
 * Secrets that appear in tutorials, framework defaults and leaked-secret
 * wordlists. Any token signed with one of them can be forged by anyone.
 */
export const WEAK_JWT_SECRETS = [
  'secret',
  'Secret',
  'SECRET',
  'secret123',
  'secretkey',
  'secret-key',
  'secret_key',
  'mysecret',
  'my-secret',
  'my_secret',
  'supersecret',
  'super-secret',
  'topsecret',
  'jwt',
  'jwtsecret',
  'jwt-secret',
  'jwt_secret',
  'JWT_SECRET',
  'your-256-bit-secret',
  'your-secret-key',
  'your_jwt_secret',
  'changeme',
  'change-me',
  'changethis',
  'password',
  'password123',
  'passw0rd',
  'admin',
  'admin123',
  'test',
  'testing',
  'dev',
  'development',
  'default',
  'key',
  'private',
  'shhhhh',
  'shhhhhared-secret',
  'keyboard cat',
  'qwerty',
  '123456',
  '12345678',
  'abc123',
  'hello',
  'letmein',
  'token',
  'auth',
  'app-secret',
  'appsecret',
  'gsdf7e8f',
];

const HMAC_HASHES: Record<string, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };
const SENSITIVE_CLAIM = /pass(word)?|pwd|secret|ssn|social|credit|card|cvv|iban|api[_-]?key|private/i;
const MAX_ACCESS_TOKEN_LIFETIME = 24 * 60 * 60;

function base64UrlToBytes(segment: string): Uint8Array {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeSegment(segment: string, label: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment)));
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error(`The ${label} is not valid base64url-encoded JSON.`);
  }
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().replace(/^Bearer\s+/i, '').split('.');
  if (parts.length !== 3) {
    throw new Error(`A signed JWT has 3 dot-separated parts; this one has ${parts.length}.`);
  }
  const [headerPart, payloadPart, signature] = parts;
  return {
    header: decodeSegment(headerPart, 'header'),
    payload: decodeSegment(payloadPart, 'payload'),
    signature,
    signingInput: `${headerPart}.${payloadPart}`,
  };
}

function numericClaim(payload: Record<string, unknown>, claim: string): number | undefined {
  const value = payload[claim];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Static checks that need no key: algorithm, header injection vectors, lifetime and claims. */
export function auditJwt(token: DecodedJwt, nowSeconds = Math.floor(Date.now() / 1000)): JwtIssue[] {
  const issues: JwtIssue[] = [];
  const alg = typeof token.header.alg === 'string' ? token.header.alg : '';

  if (alg === '' || alg.toLowerCase() === 'none') {
    issues.push({
      id: 'jwt-alg-none',
      severity: 'critical',
      title: 'Unsigned token (alg "none")',
      description:
        'The token carries no signature. Libraries that accept "none" let anyone forge arbitrary claims, including admin roles.',
      references: ['CWE-347', 'OWASP A02:2021'],
    });
  } else if (alg in HMAC_HASHES) {
    issues.push({
      id: 'jwt-symmetric',
      severity: 'low',
      title: `Symmetric algorithm (${alg})`,
      description:
        'Every service that verifies this token also holds the key to forge it, and a weak secret can be brute-forced offline from this single token. Prefer RS256/ES256/EdDSA across trust boundaries.',
      references: ['CWE-326'],
    });
  }

  for (const header of ['jku', 'x5u', 'jwk']) {
    if (header in token.header) {
      issues.push({
        id: `jwt-header-${header}`,
        severity: 'medium',
        title: `Key supplied by the token itself ("${header}" header)`,
        description: `If the server trusts "${header}", an attacker can point it at their own key and sign any payload. Verify against a pinned key set only.`,
        references: ['CWE-345', 'CWE-347'],
      });
    }
  }

  const kid = token.header.kid;
  if (typeof kid === 'string' && /\.\.|[/\\'";]|\b(union|select)\b/i.test(kid)) {
    issues.push({
      id: 'jwt-kid-injection',
      severity: 'medium',
      title: 'Suspicious "kid" value',
      description:
        'The key ID contains path traversal or SQL metacharacters. Servers that look up keys by kid on disk or in a database are open to key confusion.',
      references: ['CWE-22', 'CWE-89'],
    });
  }

  const exp = numericClaim(token.payload, 'exp');
  const iat = numericClaim(token.payload, 'iat');
  const nbf = numericClaim(token.payload, 'nbf');

  if (exp === undefined) {
    issues.push({
      id: 'jwt-no-exp',
      severity: 'medium',
      title: 'No expiration ("exp" claim missing)',
      description: 'A stolen token stays valid forever unless the signing key is rotated.',
      references: ['CWE-613'],
    });
  } else {
    if (exp < nowSeconds) {
      issues.push({
        id: 'jwt-expired',
        severity: 'low',
        title: 'Token is expired',
        description: `It expired on ${new Date(exp * 1000).toISOString()}. Servers must reject it; if one still accepts it, expiry is not being checked.`,
        references: ['CWE-613'],
      });
    }
    const lifetime = exp - (iat ?? nbf ?? nowSeconds);
    if (lifetime > MAX_ACCESS_TOKEN_LIFETIME) {
      issues.push({
        id: 'jwt-long-lived',
        severity: 'low',
        title: `Long lifetime (${Math.round(lifetime / 3600)} hours)`,
        description: 'Access tokens should live minutes, not days. Use short-lived access tokens plus refresh tokens.',
        references: ['CWE-613'],
      });
    }
  }

  if ((nbf ?? 0) > nowSeconds + 60 || (iat ?? 0) > nowSeconds + 60) {
    issues.push({
      id: 'jwt-future-dated',
      severity: 'low',
      title: 'Issued or valid in the future',
      description: 'iat/nbf lie in the future. Expect clock-skew problems, or a token minted by a misconfigured issuer.',
      references: ['CWE-345'],
    });
  }

  if (!('aud' in token.payload)) {
    issues.push({
      id: 'jwt-no-aud',
      severity: 'low',
      title: 'No audience ("aud" claim missing)',
      description: 'Without an audience, a token issued for one service can be replayed against another that shares the key.',
      references: ['CWE-345'],
    });
  }

  const sensitiveClaims = Object.keys(token.payload).filter((claim) => SENSITIVE_CLAIM.test(claim));
  if (sensitiveClaims.length > 0) {
    issues.push({
      id: 'jwt-sensitive-claims',
      severity: 'medium',
      title: `Sensitive data in payload: ${sensitiveClaims.join(', ')}`,
      description:
        'JWT payloads are only base64-encoded, not encrypted. Anyone holding the token (browser storage, logs, proxies) can read them.',
      references: ['CWE-312', 'CWE-200'],
    });
  }

  return issues;
}

/** Verifies an HS256/384/512 signature with WebCrypto. Returns null for unsupported algorithms. */
export async function verifyJwtSignature(token: DecodedJwt, secret: string): Promise<boolean | null> {
  const hash = HMAC_HASHES[String(token.header.alg)];
  if (!hash) return null;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(token.signingInput)));
  return bytesToBase64Url(signature) === token.signature;
}

/** True when the signing secret is a well-known default/tutorial value anyone could guess. */
export function isWeakSigningSecret(secret: string): boolean {
  return WEAK_JWT_SECRETS.includes(secret) || secret.length < 16;
}

/** Builds a signed HS256 token; used by the demo button and the tests. */
export async function signHs256(payload: Record<string, unknown>, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const encode = (value: unknown) => bytesToBase64Url(encoder.encode(JSON.stringify(value)));
  const signingInput = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}`;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput)));
  return `${signingInput}.${bytesToBase64Url(signature)}`;
}
