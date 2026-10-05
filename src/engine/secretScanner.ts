import type { Finding, Severity } from './types';
import { splitLines } from './lineUtils';

interface SecretRule {
  id: string;
  name: string;
  severity: Severity;
  pattern: RegExp;
  /** Index of the capture group holding the secret itself; 0 = whole match. */
  secretGroup?: number;
  rotateHint: string;
}

const SECRET_RULES: SecretRule[] = [
  {
    id: 'private-key',
    name: 'Private key block',
    severity: 'critical',
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY(?: BLOCK)?-----/,
    rotateHint: 'Generate a new key pair and revoke the old public key wherever it is trusted.',
  },
  {
    id: 'aws-access-key',
    name: 'AWS access key ID',
    severity: 'critical',
    pattern: /\b((?:AKIA|ASIA)[0-9A-Z]{16})\b/,
    secretGroup: 1,
    rotateHint: 'Deactivate the key in IAM, create a new one and prefer short-lived role credentials.',
  },
  {
    id: 'aws-secret-key',
    name: 'AWS secret access key',
    severity: 'critical',
    pattern: /aws_?secret_?access_?key["']?\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})\b/i,
    secretGroup: 1,
    rotateHint: 'Deactivate the key pair in IAM and audit CloudTrail for usage.',
  },
  {
    id: 'github-token',
    name: 'GitHub token',
    severity: 'critical',
    pattern: /\b(gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})\b/,
    secretGroup: 1,
    rotateHint: 'Revoke the token under GitHub → Settings → Developer settings.',
  },
  {
    id: 'gitlab-token',
    name: 'GitLab personal access token',
    severity: 'critical',
    pattern: /\b(glpat-[A-Za-z0-9_-]{20,})\b/,
    secretGroup: 1,
    rotateHint: 'Revoke the token in GitLab → Preferences → Access Tokens.',
  },
  {
    id: 'slack-token',
    name: 'Slack token',
    severity: 'critical',
    pattern: /\b(xox[abposr]-[A-Za-z0-9-]{10,})\b/,
    secretGroup: 1,
    rotateHint: 'Revoke the token from the Slack app configuration page.',
  },
  {
    id: 'slack-webhook',
    name: 'Slack incoming webhook',
    severity: 'medium',
    pattern: /(https:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9_]+\/B[A-Za-z0-9_]+\/[A-Za-z0-9_]+)/,
    secretGroup: 1,
    rotateHint: 'Regenerate the webhook URL; anyone holding it can post to the channel.',
  },
  {
    id: 'stripe-live-key',
    name: 'Stripe live secret key',
    severity: 'critical',
    pattern: /\b((?:sk|rk)_live_[0-9a-zA-Z]{20,})\b/,
    secretGroup: 1,
    rotateHint: 'Roll the key in the Stripe dashboard → Developers → API keys.',
  },
  {
    id: 'google-api-key',
    name: 'Google API key',
    severity: 'medium',
    pattern: /\b(AIza[0-9A-Za-z_-]{35})(?![0-9A-Za-z_-])/,
    secretGroup: 1,
    rotateHint: 'Regenerate the key in Google Cloud Console and restrict it by referrer/API.',
  },
  {
    id: 'anthropic-api-key',
    name: 'Anthropic API key',
    severity: 'critical',
    pattern: /\b(sk-ant-[A-Za-z0-9_-]{32,})/,
    secretGroup: 1,
    rotateHint: 'Delete the key in the Anthropic Console and issue a new one.',
  },
  {
    id: 'openai-api-key',
    name: 'OpenAI API key',
    severity: 'critical',
    pattern: /\b(sk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{32,})/,
    secretGroup: 1,
    rotateHint: 'Revoke the key in the OpenAI dashboard and issue a new one.',
  },
  {
    id: 'npm-token',
    name: 'npm access token',
    severity: 'critical',
    pattern: /\b(npm_[A-Za-z0-9]{36})\b/,
    secretGroup: 1,
    rotateHint: 'Revoke with `npm token revoke <id>`; a leaked publish token enables supply-chain attacks.',
  },
  {
    id: 'sendgrid-key',
    name: 'SendGrid API key',
    severity: 'critical',
    pattern: /\b(SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43})/,
    secretGroup: 1,
    rotateHint: 'Delete the key in SendGrid → Settings → API Keys.',
  },
  {
    id: 'credentials-in-url',
    name: 'Credentials embedded in connection URL',
    severity: 'critical',
    pattern:
      /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|rediss?|amqps?|ftp|smtp|https?):\/\/[^:\s"'/@]+:([^@\s"'/]+)@/i,
    secretGroup: 1,
    rotateHint: 'Change the password and inject the URL from a secret manager or environment variable.',
  },
  {
    id: 'jwt',
    name: 'JSON Web Token',
    severity: 'medium',
    pattern: /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})/,
    secretGroup: 1,
    rotateHint: 'Treat the token as compromised until it expires; rotate the signing key if it is long-lived.',
  },
  {
    id: 'generic-secret',
    name: 'Hardcoded secret assignment',
    severity: 'medium',
    pattern:
      /\b[\w.-]*(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|private[_-]?key)[\w.-]*["']?\s*[:=]\s*["']?([^\s"',;#}]{8,})/i,
    secretGroup: 1,
    rotateHint: 'Rotate the value and load it at runtime from the environment or a secret manager.',
  },
];

const PLACEHOLDER_PATTERN =
  /^(?:\$|<|%|\{\{)|\$\{|process\.env|import\.meta\.env|os\.environ|getenv|example|placeholder|changeme|your[_-]|xxx|\*{3,}|redacted|dummy|sample|^(?:true|false|null|undefined|none)$/i;

/** Shannon entropy in bits per character; random secrets typically score above ~3. */
export function shannonEntropy(value: string): number {
  if (value.length === 0) return 0;
  const frequencies = new Map<string, number>();
  for (const char of value) frequencies.set(char, (frequencies.get(char) ?? 0) + 1);
  let entropy = 0;
  for (const count of frequencies.values()) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

/** Keeps a short prefix so the user can identify the secret without the report re-leaking it. */
export function maskSecret(secret: string): string {
  const visible = secret.length > 12 ? 4 : 2;
  return `${secret.slice(0, visible)}${'•'.repeat(8)}`;
}

function isLikelyRealGenericSecret(value: string): boolean {
  if (PLACEHOLDER_PATTERN.test(value)) return false;
  return shannonEntropy(value) >= 3;
}

export interface SecretMatch {
  ruleId: string;
  name: string;
  severity: Severity;
  rotateHint: string;
  /** 1-indexed line number. */
  line: number;
  /** Column range of the secret value within the line (0-indexed, end exclusive). */
  start: number;
  end: number;
  secret: string;
}

/** Public metadata of every secret rule, used by the rule catalog. */
export const SECRET_RULE_INFO = SECRET_RULES.map(({ id, name, severity, rotateHint }) => ({
  id: `secret-${id}`,
  name,
  severity,
  rotateHint,
}));

/** Locates secrets line by line, keeping the exact position of each value. */
export function findSecrets(content: string): SecretMatch[] {
  const matches: SecretMatch[] = [];

  splitLines(content).forEach((line, index) => {
    for (const rule of SECRET_RULES) {
      const match = rule.pattern.exec(line);
      if (!match) continue;
      const secret = match[rule.secretGroup ?? 0] ?? match[0];

      if (rule.id === 'credentials-in-url' && PLACEHOLDER_PATTERN.test(secret)) continue;
      if (rule.id === 'generic-secret' && !isLikelyRealGenericSecret(secret)) continue;

      const start = match.index + match[0].lastIndexOf(secret);
      matches.push({
        ruleId: `secret-${rule.id}`,
        name: rule.name,
        severity: rule.severity,
        rotateHint: rule.rotateHint,
        line: index + 1,
        start,
        end: start + secret.length,
        secret,
      });
      // One match per line is enough; specific rules are ordered before the generic one.
      break;
    }
  });

  return matches;
}

/** Replaces every detected secret with a labelled placeholder so the text can be shared safely. */
export function redactSecrets(content: string): string {
  const byLine = new Map(findSecrets(content).map((match) => [match.line, match]));
  return splitLines(content)
    .map((line, index) => {
      const match = byLine.get(index + 1);
      if (!match) return line;
      return `${line.slice(0, match.start)}[REDACTED:${match.ruleId.replace('secret-', '')}]${line.slice(match.end)}`;
    })
    .join('\n');
}

/**
 * Scans any text for credentials. Runs on every uploaded file regardless of type,
 * since secrets leak into Dockerfiles, compose files and JSON configs alike.
 */
export function scanSecrets(content: string): Finding[] {
  return findSecrets(content).map((match) => ({
    id: `${match.ruleId}-L${match.line}`,
    ruleId: match.ruleId,
    severity: match.severity,
    category: 'Hardcoded Secret',
    title: `${match.name} on line ${match.line}`,
    description: `Detected value "${maskSecret(match.secret)}". Anything committed to a repository or baked into an image must be treated as leaked: it survives in git history, CI logs and image layers.`,
    fixSnippet: `# 1. ${match.rotateHint}
# 2. Replace the literal with a runtime lookup:
#      const value = process.env.MY_SECRET;
# 3. Purge the old value from git history:
echo '<leaked-value>==>REMOVED' > replacements.txt
git filter-repo --replace-text replacements.txt`,
    sourceFile: '',
    line: match.line,
    references: ['CWE-798', 'OWASP A07:2021'],
  }));
}
