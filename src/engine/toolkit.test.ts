import { describe, expect, it } from 'vitest';
import { auditJwt, decodeJwt, isWeakSigningSecret, signHs256, verifyJwtSignature } from './jwt';
import { buildHeaders, DEFAULT_HEADER_CONFIG, toNginx, toVercelJson } from './headerBuilder';
import { analyzePassword, formatDuration, generateSecret, secretEntropyBits } from './passwordLab';
import { findCatalogRule, RULE_CATALOG } from './ruleCatalog';
import { compareScans, createSnapshot, parseSnapshots } from './history';
import { redactSecrets } from './secretScanner';
import type { AnalysisResult } from './types';

describe('jwt', () => {
  it('round-trips sign → decode → verify', async () => {
    const token = await signHs256({ sub: 'abc', role: 'user' }, 'correct horse battery staple');
    const decoded = decodeJwt(token);
    expect(decoded.payload).toMatchObject({ sub: 'abc', role: 'user' });
    expect(await verifyJwtSignature(decoded, 'correct horse battery staple')).toBe(true);
    expect(await verifyJwtSignature(decoded, 'wrong')).toBe(false);
  });

  it('rejects malformed tokens', () => {
    expect(() => decodeJwt('not-a-jwt')).toThrow();
  });

  it('flags alg none, missing exp and sensitive claims', () => {
    const b64url = (value: object) =>
      btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ sub: '1', password: 'x' })}.`;
    const ids = auditJwt(decodeJwt(token)).map((issue) => issue.id);
    expect(ids).toContain('jwt-alg-none');
    expect(ids).toContain('jwt-no-exp');
    expect(ids).toContain('jwt-sensitive-claims');
  });

  it('recognizes weak signing secrets', () => {
    expect(isWeakSigningSecret('secret')).toBe(true);
    expect(isWeakSigningSecret('short')).toBe(true);
    expect(isWeakSigningSecret('a-sufficiently-long-random-secret-value')).toBe(false);
  });
});

describe('headerBuilder', () => {
  it('builds the default header set and renders per platform', () => {
    const headers = buildHeaders(DEFAULT_HEADER_CONFIG);
    const keys = headers.map((header) => header.key);
    expect(keys).toContain('Strict-Transport-Security');
    expect(keys).toContain('Content-Security-Policy');
    expect(toNginx(headers)).toContain('add_header Strict-Transport-Security');
    expect(JSON.parse(toVercelJson(headers)).headers[0].source).toBe('/(.*)');
  });

  it('omits disabled headers', () => {
    const headers = buildHeaders({ ...DEFAULT_HEADER_CONFIG, contentTypeOptions: false, frameOptions: 'off' });
    const keys = headers.map((header) => header.key);
    expect(keys).not.toContain('X-Content-Type-Options');
    expect(keys).not.toContain('X-Frame-Options');
  });
});

describe('passwordLab', () => {
  it('rates breach-list passwords very weak and long random ones strong', () => {
    expect(analyzePassword('password123').score).toBe(0);
    expect(analyzePassword('7#qF!zP2vL@9mWx8').score).toBeGreaterThanOrEqual(3);
  });

  it('formats durations and generates secrets of the requested length', () => {
    expect(formatDuration(0.5)).toBe('instantly');
    expect(formatDuration(3600)).toBe('1 hour');
    expect(generateSecret('hex', 16)).toMatch(/^[0-9a-f]{16}$/);
    expect(secretEntropyBits('hex', 16)).toBe(64);
  });
});

describe('ruleCatalog', () => {
  it('resolves concrete and line-suffixed ids to their catalog entry', () => {
    expect(findCatalogRule('docker-root-user')?.target).toBe('dockerfile');
    expect(findCatalogRule('pkg-compromised-event-stream')?.severity).toBe('critical');
    expect(findCatalogRule('nginx-weak-tls')?.title).toContain('TLS');
    expect(findCatalogRule('does-not-exist')).toBeUndefined();
  });

  it('has references for every rule', () => {
    expect(RULE_CATALOG.every((rule) => Array.isArray(rule.references))).toBe(true);
  });
});

describe('history', () => {
  const make = (score: number, ruleIds: string[]): AnalysisResult => ({
    score,
    counts: { critical: 0, medium: 0, low: 0 },
    findings: ruleIds.map((ruleId) => ({
      id: ruleId,
      ruleId,
      severity: 'medium',
      category: 'x',
      title: ruleId,
      description: '',
      fixSnippet: '',
      sourceFile: 'a',
    })),
  });

  it('diffs two snapshots into fixed/introduced/unchanged', () => {
    const before = createSnapshot(make(60, ['r1', 'r2']), ['a'], 'before');
    const after = createSnapshot(make(80, ['r2', 'r3']), ['a'], 'after');
    const diff = compareScans(before, after);
    expect(diff.fixed.map((f) => f.ruleId)).toEqual(['r1']);
    expect(diff.introduced.map((f) => f.ruleId)).toEqual(['r3']);
    expect(diff.unchanged.map((f) => f.ruleId)).toEqual(['r2']);
    expect(diff.scoreDelta).toBe(20);
  });

  it('parseSnapshots tolerates corrupt data', () => {
    expect(parseSnapshots(null)).toEqual([]);
    expect(parseSnapshots('not json')).toEqual([]);
    expect(parseSnapshots('{"not":"array"}')).toEqual([]);
  });
});

describe('redactSecrets', () => {
  it('replaces detected secrets with a labelled placeholder', () => {
    const token = 'ghp_' + 'aB3dE5fG7hJ9kL1mN3pQ5rS7tU9vW1xY3zA5';
    const redacted = redactSecrets(`token=${token}`);
    expect(redacted).toBe('token=[REDACTED:github-token]');
    expect(redacted).not.toContain(token);
  });
});
