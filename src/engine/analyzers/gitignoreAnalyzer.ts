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

  return findings;
}
