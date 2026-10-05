import type { Finding } from '../types';
import {
  COMPROMISED_VERSIONS,
  DEV_ONLY_TOOLS,
  KNOWN_VULNERABLE_PACKAGES,
  MALICIOUS_PACKAGES,
} from '../knownVulnerablePackages';

const INSTALL_HOOKS = ['preinstall', 'install', 'postinstall', 'prepare'];
const SUSPICIOUS_SCRIPT = /\b(curl|wget|nc|ncat|powershell|iwr|Invoke-WebRequest)\b|base64\s+-d|\beval\b|node\s+-e|\|\s*(ba)?sh\b|https?:\/\//i;

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

  for (const [name, range] of Object.entries(allDeps)) {
    const compromised = COMPROMISED_VERSIONS[name];
    if (compromised?.versions.includes(normalizeVersion(range))) {
      findings.push({
        id: `pkg-compromised-${name}`,
        severity: 'critical',
        category: 'Supply Chain',
        title: `${name}@${range} is a known compromised release`,
        description: `${compromised.incident} Treat any machine that installed it as compromised and rotate its credentials.`,
        fixSnippet: `npm uninstall ${name} && npm install ${name}@latest
# then check package-lock.json no longer resolves the compromised version`,
        sourceFile: 'package.json',
        references: ['CWE-506', 'OWASP A08:2021'],
      });
    }

    if (MALICIOUS_PACKAGES.has(name)) {
      findings.push({
        id: `pkg-malicious-${name}`,
        severity: 'critical',
        category: 'Supply Chain',
        title: `"${name}" is a known malicious/typosquat package`,
        description:
          'This name was used to distribute malware imitating a popular package. Its install scripts typically exfiltrate environment variables and credentials.',
        fixSnippet: `npm uninstall ${name}
# install the legitimate package you intended instead, then rotate any secrets on this machine`,
        sourceFile: 'package.json',
        references: ['CWE-506', 'OWASP A08:2021'],
      });
    }

    const source = range.trim();
    if (/^http:\/\//i.test(source)) {
      findings.push({
        id: `pkg-insecure-source-${name}`,
        severity: 'critical',
        category: 'Supply Chain',
        title: `${name} is downloaded over plain HTTP`,
        description: 'Anyone on the network path can replace the tarball with arbitrary code that runs at install time.',
        fixSnippet: `"${name}": "<semver range from the npm registry>"`,
        sourceFile: 'package.json',
        references: ['CWE-494', 'CWE-319'],
      });
    } else if (/^(git(\+\w+)?:|github:|gitlab:|bitbucket:|https:\/\/)|^[\w-]+\/[\w.-]+(#.*)?$/i.test(source)) {
      findings.push({
        id: `pkg-non-registry-${name}`,
        severity: 'medium',
        category: 'Supply Chain',
        title: `${name} is installed from outside the npm registry`,
        description:
          'Git/URL dependencies bypass `npm audit`, are not immutable (a branch or tag can be moved) and skip registry malware scanning.',
        fixSnippet: `"${name}": "<published version>"
// or pin to a full commit SHA: "github:owner/repo#<40-char-sha>"`,
        sourceFile: 'package.json',
        references: ['CWE-494', 'OWASP A08:2021'],
      });
    } else if (['*', '', 'latest'].includes(source) || /^>=?\s*\d[^<]*$/.test(source) || /^x(\.x)*$/i.test(source)) {
      findings.push({
        id: `pkg-unbounded-range-${name}`,
        severity: 'medium',
        category: 'Supply Chain',
        title: `${name} uses an unbounded version range "${source || '(empty)'}"`,
        description:
          'Any future release, including a hijacked one, is installed automatically. Unbounded ranges are how compromised versions reach production.',
        fixSnippet: `"${name}": "^<current major>.<minor>.<patch>"`,
        sourceFile: 'package.json',
        references: ['CWE-1357', 'OWASP A06:2021'],
      });
    }
  }

  const scripts = pkg.scripts ?? {};
  for (const hook of INSTALL_HOOKS) {
    const command = scripts[hook];
    if (command && SUSPICIOUS_SCRIPT.test(command)) {
      findings.push({
        id: `pkg-suspicious-${hook}`,
        severity: 'critical',
        category: 'Supply Chain',
        title: `Suspicious "${hook}" script`,
        description: `Lifecycle scripts run automatically on \`npm install\`. This one downloads or evaluates code: "${command}". Install hooks are the most common malware delivery vector on npm.`,
        fixSnippet: `# Inspect the script, remove the remote download, and install with:
npm ci --ignore-scripts`,
        sourceFile: 'package.json',
        references: ['CWE-506', 'CWE-829'],
      });
    }
  }

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
