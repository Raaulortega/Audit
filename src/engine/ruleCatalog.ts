import type { FileType, Severity } from './types';
import { SECRET_RULE_INFO } from './secretScanner';
import { VERCEL_HEADER_RULES } from './analyzers/vercelAnalyzer';

export type RuleTarget = Exclude<FileType, 'unknown'> | 'anyFile';

export interface CatalogRule {
  /** Rule id, or id prefix (ending in "-") for rules parameterized by package/service/line. */
  id: string;
  target: RuleTarget;
  /** "varies" when the severity depends on context (e.g. CORS with credentials). */
  severity: Severity | 'varies';
  title: string;
  references: string[];
}

export const TARGET_LABELS: Record<RuleTarget, string> = {
  anyFile: 'Any file',
  vercelJson: 'vercel.json',
  packageJson: 'package.json',
  dockerfile: 'Dockerfile',
  gitignore: '.gitignore',
  envFile: '.env',
  dockerCompose: 'docker-compose.yml',
  nginxConf: 'nginx.conf',
};

type RuleTuple = [id: string, severity: CatalogRule['severity'], title: string, references: string[]];

const rules = (target: RuleTarget, tuples: RuleTuple[]): CatalogRule[] =>
  tuples.map(([id, severity, title, references]) => ({ id, target, severity, title, references }));

export const RULE_CATALOG: CatalogRule[] = [
  ...SECRET_RULE_INFO.map(({ id, name, severity }) => ({
    id,
    target: 'anyFile' as const,
    severity,
    title: `Hardcoded ${name.charAt(0).toLowerCase()}${name.slice(1)}`,
    references: ['CWE-798', 'OWASP A07:2021'],
  })),
  ...VERCEL_HEADER_RULES.map((rule) => ({ ...rule, target: 'vercelJson' as const })),
  ...rules('vercelJson', [
    ['vercel-weak-csp', 'varies', 'Permissive Content-Security-Policy', ['CWE-693', 'OWASP A03:2021']],
    ['vercel-short-hsts', 'low', 'HSTS max-age shorter than 180 days', ['CWE-319']],
    ['vercel-cors-wildcard', 'varies', 'Wildcard CORS origin', ['CWE-942', 'OWASP A05:2021']],
    ['vercel-x-powered-by', 'low', 'X-Powered-By discloses the stack', ['CWE-200']],
  ]),
  ...rules('packageJson', [
    ['pkg-vuln-', 'critical', 'Dependency below known-safe version', ['OWASP A06:2021']],
    ['pkg-compromised-', 'critical', 'Known compromised release (hijacked maintainer)', ['CWE-506', 'OWASP A08:2021']],
    ['pkg-malicious-', 'critical', 'Known malicious or typosquat package', ['CWE-506', 'OWASP A08:2021']],
    ['pkg-insecure-source-', 'critical', 'Dependency downloaded over plain HTTP', ['CWE-494', 'CWE-319']],
    ['pkg-non-registry-', 'medium', 'Dependency installed from git/URL', ['CWE-494', 'OWASP A08:2021']],
    ['pkg-unbounded-range-', 'medium', 'Unbounded version range', ['CWE-1357', 'OWASP A06:2021']],
    ['pkg-suspicious-', 'critical', 'Install hook downloads or evaluates code', ['CWE-506', 'CWE-829']],
    ['pkg-devtool-in-deps-', 'medium', 'Dev tool shipped in production dependencies', []],
    ['pkg-missing-audit-script', 'low', 'No audit script', []],
  ]),
  ...rules('dockerfile', [
    ['docker-root-user', 'critical', 'Container runs as root', ['CWE-250', 'CIS Docker 4.1']],
    ['docker-latest-tag', 'medium', 'Unpinned base image', ['CWE-1357', 'CWE-494']],
    ['docker-secret-env-', 'critical', 'Secret baked into image via ENV', ['CWE-538', 'CWE-798']],
    ['docker-secret-arg-', 'medium', 'Secret recorded in image history via ARG', ['CWE-538', 'CWE-798']],
    ['docker-add-remote-', 'medium', 'ADD from URL without checksum', ['CWE-494', 'OWASP A08:2021']],
    ['docker-curl-pipe-shell-', 'medium', 'Remote script piped into a shell', ['CWE-494', 'OWASP A08:2021']],
    ['docker-chmod-777-', 'medium', 'World-writable permissions', ['CWE-732']],
    ['docker-sudo-', 'low', 'sudo used in build', ['CWE-250']],
    ['docker-expose-ssh', 'medium', 'SSH port exposed', ['CWE-1327']],
    ['docker-copy-all', 'low', 'COPY . copies the whole build context', ['CWE-538']],
    ['docker-no-healthcheck', 'low', 'No HEALTHCHECK', ['CIS Docker 4.6']],
  ]),
  ...rules('gitignore', [
    ['gitignore-missing-env', 'critical', '.env files not ignored', ['CWE-538']],
    ['gitignore-missing-keys', 'medium', 'Private key files not ignored', ['CWE-538']],
    ['gitignore-env-negated', 'critical', 'Negation re-includes an env file', ['CWE-538', 'CWE-312']],
    ['gitignore-missing-sensitive', 'low', 'Credential files not ignored', ['CWE-538']],
    ['gitignore-missing-node-modules', 'low', 'node_modules not ignored', []],
  ]),
  ...rules('envFile', [
    ['env-client-exposed-', 'critical', 'Server secret behind a public prefix', ['CWE-200', 'OWASP A01:2021']],
    ['env-weak-credential-', 'critical', 'Default or weak credential', ['CWE-521', 'CWE-1392']],
    ['env-short-signing-secret-', 'medium', 'Signing secret shorter than 32 characters', ['CWE-326']],
    ['env-debug-', 'medium', 'Debug mode enabled', ['CWE-489', 'CWE-215']],
    ['env-tls-verification-disabled', 'critical', 'TLS certificate verification disabled', ['CWE-295']],
    ['env-db-ssl-disabled-', 'medium', 'TLS disabled for a connection', ['CWE-319']],
    ['env-plain-http-', 'low', 'Plain-HTTP endpoint', ['CWE-319']],
    ['env-cors-wildcard-', 'medium', 'Wildcard CORS origin', ['CWE-942']],
  ]),
  ...rules('dockerCompose', [
    ['compose-privileged-', 'critical', 'Privileged container', ['CWE-250', 'CIS Docker 5.4']],
    ['compose-docker-socket-', 'critical', 'Docker socket mounted', ['CWE-668', 'CIS Docker 5.31']],
    ['compose-sensitive-mount-', 'critical', 'Sensitive host path mounted', ['CWE-668', 'CIS Docker 5.5']],
    ['compose-host-', 'medium', 'Host namespace shared', ['CWE-653', 'CIS Docker 5.9']],
    ['compose-unconfined-', 'medium', 'Seccomp/AppArmor/SELinux disabled', ['CWE-693', 'CIS Docker 5.21']],
    ['compose-cap-', 'varies', 'Dangerous Linux capability added', ['CWE-250', 'CIS Docker 5.3']],
    ['compose-public-datastore-', 'varies', 'Database port published on all interfaces', ['CWE-668']],
    ['compose-weak-password-', 'critical', 'Default database password', ['CWE-1392', 'CWE-798']],
    ['compose-unpinned-image-', 'low', 'Unpinned service image', ['CWE-1357', 'CWE-494']],
  ]),
  ...rules('nginxConf', [
    ['nginx-weak-tls-', 'critical', 'Deprecated TLS protocol enabled', ['CWE-327', 'OWASP A02:2021']],
    ['nginx-weak-ciphers-', 'critical', 'Weak cipher suites allowed', ['CWE-327', 'OWASP A02:2021']],
    ['nginx-alias-traversal-', 'critical', 'Alias off-by-slash path traversal', ['CWE-22', 'OWASP A01:2021']],
    ['nginx-autoindex', 'medium', 'Directory listing enabled', ['CWE-548']],
    ['nginx-no-https-redirect', 'low', 'HTTP not redirected to HTTPS', ['CWE-319']],
    ['nginx-no-https', 'medium', 'Plain HTTP only', ['CWE-319', 'OWASP A02:2021']],
    ['nginx-cors-wildcard-', 'medium', 'Wildcard CORS origin', ['CWE-942']],
    ['nginx-missing-security-headers', 'varies', 'Missing security headers', ['OWASP A05:2021']],
    ['nginx-server-tokens', 'low', 'nginx version advertised', ['CWE-200']],
  ]),
];

/** Finds the catalog entry for a concrete rule id; the longest matching prefix wins. */
export function findCatalogRule(ruleId: string): CatalogRule | undefined {
  // Appending "-" lets "nginx-weak-tls" (line suffix stripped) match the "nginx-weak-tls-" prefix.
  const candidate = `${ruleId}-`;
  return RULE_CATALOG.filter((rule) => ruleId === rule.id || (rule.id.endsWith('-') && candidate.startsWith(rule.id))).sort(
    (a, b) => b.id.length - a.id.length,
  )[0];
}
