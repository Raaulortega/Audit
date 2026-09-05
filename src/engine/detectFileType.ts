import type { FileType } from './types';

export function detectFileType(filename: string, content: string): FileType {
  const name = filename.trim().toLowerCase();

  if (name.endsWith('vercel.json')) return 'vercelJson';
  if (name.endsWith('package.json')) return 'packageJson';
  if (name.endsWith('dockerfile')) return 'dockerfile';
  if (name.endsWith('.gitignore')) return 'gitignore';

  return detectFileTypeFromContent(content);
}

function detectFileTypeFromContent(content: string): FileType {
  const trimmed = content.trim();

  if (trimmed.startsWith('{')) {
    return detectJsonFileType(trimmed);
  }

  if (/^FROM\s+\S+/m.test(trimmed)) return 'dockerfile';

  if (/node_modules|\.env|\.DS_Store/.test(trimmed) && !trimmed.includes('{')) {
    return 'gitignore';
  }

  return 'unknown';
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
