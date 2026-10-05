import type { FileType } from './types';

export function detectFileType(filename: string, content: string): FileType {
  const name = filename.trim().toLowerCase();
  const basename = name.split(/[\\/]/).pop() ?? name;

  if (name.endsWith('vercel.json')) return 'vercelJson';
  if (name.endsWith('package.json')) return 'packageJson';
  if (name.endsWith('dockerfile') || basename.startsWith('dockerfile.')) return 'dockerfile';
  if (name.endsWith('.gitignore')) return 'gitignore';
  if (/^(docker-)?compose(\.[\w-]+)?\.ya?ml$/.test(basename)) return 'dockerCompose';
  if (basename === '.env' || basename.startsWith('.env.') || basename.endsWith('.env')) return 'envFile';
  if (basename === 'nginx.conf' || (basename.endsWith('.conf') && looksLikeNginx(content))) return 'nginxConf';

  return detectFileTypeFromContent(content);
}

function detectFileTypeFromContent(content: string): FileType {
  const trimmed = content.trim();

  if (trimmed.startsWith('{')) {
    return detectJsonFileType(trimmed);
  }

  if (/^FROM\s+\S+/m.test(trimmed)) return 'dockerfile';

  if (/^services:\s*$/m.test(trimmed)) return 'dockerCompose';

  if (looksLikeNginx(trimmed)) return 'nginxConf';

  if (looksLikeEnvFile(trimmed)) return 'envFile';

  if (looksLikeGitignore(trimmed)) return 'gitignore';

  return 'unknown';
}

function looksLikeNginx(content: string): boolean {
  return /\bserver\s*\{/.test(content) && /\b(listen|server_name|location)\b/.test(content);
}

function looksLikeEnvFile(trimmed: string): boolean {
  const lines = trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
  return lines.length > 0 && lines.every((line) => /^(export\s+)?[A-Za-z_][A-Za-z0-9_.]*\s*=/.test(line));
}

function looksLikeGitignore(trimmed: string): boolean {
  if (trimmed.length === 0) return false;
  const lines = trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.every((line) => /^[#!]|^[\w*./_-]+\/?$/.test(line));
}

function detectJsonFileType(trimmed: string): FileType {
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if ('headers' in parsed || 'redirects' in parsed) return 'vercelJson';
    if ('dependencies' in parsed || 'scripts' in parsed) return 'packageJson';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}
