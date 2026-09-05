import type { Finding } from '../types';
import { DEV_ONLY_TOOLS, KNOWN_VULNERABLE_PACKAGES } from '../knownVulnerablePackages';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

function normalizeVersion(range: string): string {
  return range.replace(/^[\^~>=<\s]+/, '').trim();
}

function isBelowMinVersion(declaredRange: string, minSafeVersion: string): boolean {
  if (declaredRange === '*' || declaredRange === 'latest') return false;

  const declaredParts = normalizeVersion(declaredRange).split('.').map(Number);
  const minParts = minSafeVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(declaredParts.length, minParts.length); i += 1) {
    const declaredPart = declaredParts[i] ?? 0;
    const minPart = minParts[i] ?? 0;
    if (declaredPart !== minPart) return declaredPart < minPart;
  }

  return false;
}

export function analyzePackageJson(content: string): Finding[] {
  const pkg = JSON.parse(content) as PackageJson;
  const findings: Finding[] = [];

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, range] of Object.entries(allDeps)) {
    const rule = KNOWN_VULNERABLE_PACKAGES[name];
    if (rule && isBelowMinVersion(range, rule.minSafeVersion)) {
      findings.push({
        id: `pkg-vuln-${name}`,
        severity: 'critical',
        category: 'Vulnerable Dependency',
        title: `${name}@${range} is below known-safe version`,
        description: rule.advisory,
        fixSnippet: `"${name}": "^${rule.minSafeVersion}"`,
        sourceFile: 'package.json',
      });
    }
  }

  const scripts = pkg.scripts ?? {};
  if (!scripts.audit && !scripts.security) {
    findings.push({
      id: 'pkg-missing-audit-script',
      severity: 'low',
      category: 'Missing Security Tooling',
      title: 'No audit/security script defined',
      description: 'Adding an audit script makes dependency vulnerability scanning a routine part of the workflow.',
      fixSnippet: `"scripts": {
  "audit": "npm audit --audit-level=moderate"
}`,
      sourceFile: 'package.json',
    });
  }

  for (const name of Object.keys(pkg.dependencies ?? {})) {
    if (DEV_ONLY_TOOLS.has(name)) {
      findings.push({
        id: `pkg-devtool-in-deps-${name}`,
        severity: 'medium',
        category: 'Misplaced Dependency',
        title: `${name} is a dev tool listed in dependencies`,
        description: `${name} is typically only needed during development and should not ship in production dependencies.`,
        fixSnippet: `"devDependencies": {
  "${name}": "${pkg.dependencies?.[name]}"
}`,
        sourceFile: 'package.json',
      });
    }
  }

  return findings;
}
