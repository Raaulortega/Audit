import type { Finding } from '../types';

export function analyzeGitignore(content: string): Finding[] {
  const lines = content.split('\n').map((line) => line.trim());
  const findings: Finding[] = [];

  const hasEnvRule = lines.some((line) => line.startsWith('.env'));
  if (!hasEnvRule) {
    findings.push({
      id: 'gitignore-missing-env',
      severity: 'critical',
      category: 'Secret Exposure',
      title: 'No .env exclusion rule',
      description: 'Without ignoring .env files, environment secrets can be committed to version control.',
      fixSnippet: `.env
.env.local
.env.*.local`,
      sourceFile: '.gitignore',
    });
  }

  const hasNodeModulesRule = lines.some((line) => line === 'node_modules' || line === 'node_modules/');
  if (!hasNodeModulesRule) {
    findings.push({
      id: 'gitignore-missing-node-modules',
      severity: 'low',
      category: 'Repository Hygiene',
      title: 'No node_modules exclusion rule',
      description: 'Committing node_modules bloats the repository and can introduce inconsistent installs.',
      fixSnippet: 'node_modules/',
      sourceFile: '.gitignore',
    });
  }

  const hasKeyRule = lines.some((line) => /\*\.(pem|key)$/.test(line));
  if (!hasKeyRule) {
    findings.push({
      id: 'gitignore-missing-keys',
      severity: 'medium',
      category: 'Secret Exposure',
      title: 'No *.pem/*.key exclusion rule',
      description: 'Private key files should never be tracked in version control.',
      fixSnippet: `*.pem
*.key`,
      sourceFile: '.gitignore',
    });
  }

  const reIncludedEnv = lines.findIndex((line) => /^!\.env(?!\.(example|sample|template|dist)\b)/.test(line));
  if (reIncludedEnv !== -1) {
    findings.push({
      id: 'gitignore-env-negated',
      severity: 'critical',
      category: 'Secret Exposure',
      title: `"${lines[reIncludedEnv]}" re-includes an env file`,
      description: 'A negation rule overrides earlier ignores, so this env file will be committed with whatever secrets it contains.',
      fixSnippet: `# Commit only a template without real values
!.env.example`,
      sourceFile: '.gitignore',
      line: reIncludedEnv + 1,
      references: ['CWE-538', 'CWE-312'],
    });
  }

  const missingSensitive = SENSITIVE_PATTERNS.filter(({ test }) => !lines.some((line) => test.test(line)));
  if (missingSensitive.length > 0) {
    findings.push({
      id: 'gitignore-missing-sensitive',
      severity: 'low',
      category: 'Secret Exposure',
      title: `No exclusion for ${missingSensitive.map(({ label }) => label).join(', ')}`,
      description:
        'These files commonly hold credentials (SSH keys, certificate bundles, registry tokens, cloud credentials, local databases) and are frequently leaked through public repositories.',
      fixSnippet: missingSensitive.map(({ rule }) => rule).join('\n'),
      sourceFile: '.gitignore',
      references: ['CWE-538'],
    });
  }

  return findings;
}

const SENSITIVE_PATTERNS = [
  { label: 'SSH keys', test: /id_(rsa|ed25519|ecdsa)|^\*?id_\*/, rule: 'id_rsa*\nid_ed25519*' },
  { label: 'certificate bundles', test: /\*\.(p12|pfx)$/, rule: '*.p12\n*.pfx' },
  { label: '.npmrc', test: /^\/?\.npmrc$/, rule: '.npmrc' },
  { label: 'cloud credentials', test: /credentials|\.aws\/?$|service-account/, rule: '.aws/\n*credentials*.json\nservice-account*.json' },
  { label: 'local databases', test: /\*\.(sqlite3?|db)$/, rule: '*.sqlite\n*.sqlite3\n*.db' },
];
