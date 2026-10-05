import { describe, expect, it } from 'vitest';
import { maskSecret, scanSecrets, shannonEntropy } from './secretScanner';

// Fake credentials are assembled at runtime so repository secret scanners do not flag this file.
const fakeGithubToken = 'ghp_' + 'aB3dE5fG7hJ9kL1mN3pQ5rS7tU9vW1xY3zA5';
const fakeAwsKey = 'AKIA' + 'ABCDEFGHIJKLMNOP';
const fakeStripeKey = 'sk_' + 'live_' + '4eC39HqLyjWDarjtT1zdp7dc';

const ruleIds = (content: string) => scanSecrets(content).map((finding) => finding.id.replace(/-L\d+$/, ''));

describe('scanSecrets', () => {
  it('detects provider-specific tokens with line numbers', () => {
    const findings = scanSecrets(`const a = 1;\nconst token = "${fakeGithubToken}";\nAWS_KEY=${fakeAwsKey}`);
    expect(findings.map((f) => [f.id, f.line, f.severity])).toEqual([
      ['secret-github-token-L2', 2, 'critical'],
      ['secret-aws-access-key-L3', 3, 'critical'],
    ]);
  });

  it('detects private keys, Stripe live keys and credentials in URLs', () => {
    expect(ruleIds('-----BEGIN OPENSSH PRIVATE KEY-----')).toEqual(['secret-private-key']);
    expect(ruleIds(`STRIPE=${fakeStripeKey}`)).toEqual(['secret-stripe-live-key']);
    expect(ruleIds('url: mongodb+srv://admin:hunter2pass@cluster0.example.net/db')).toEqual([
      'secret-credentials-in-url',
    ]);
  });

  it('ignores placeholders and environment references', () => {
    expect(scanSecrets('password = process.env.DB_PASSWORD')).toEqual([]);
    expect(scanSecrets('api_key: ${API_KEY}')).toEqual([]);
    expect(scanSecrets('DATABASE_URL=postgres://user:${DB_PASS}@localhost/db')).toEqual([]);
    expect(scanSecrets('secret: <your-secret-here>')).toEqual([]);
  });

  it('flags high-entropy generic secrets but not low-entropy words', () => {
    expect(ruleIds('client_secret = "f8Kq2xZr9LmP4vTb"')).toEqual(['secret-generic-secret']);
    expect(scanSecrets('password: aaaaaaaaaa')).toEqual([]);
  });

  it('never includes the full secret in the finding text', () => {
    const [finding] = scanSecrets(`token=${fakeGithubToken}`);
    expect(JSON.stringify(finding)).not.toContain(fakeGithubToken);
    expect(finding.description).toContain(maskSecret(fakeGithubToken));
  });
});

describe('shannonEntropy', () => {
  it('is zero for repeated characters and higher for random strings', () => {
    expect(shannonEntropy('aaaa')).toBe(0);
    expect(shannonEntropy('f8Kq2xZr9LmP4vTb')).toBeGreaterThan(3.5);
  });
});
