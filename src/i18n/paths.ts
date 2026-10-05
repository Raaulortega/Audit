export type Language = 'en' | 'es';

export const LANGUAGES: Language[] = ['en', 'es'];
export const DEFAULT_LANGUAGE: Language = 'en';

/** Every page of the site, without language prefix. */
export const PAGE_PATHS = ['/', '/scanner', '/history', '/secrets', '/jwt', '/headers', '/passwords', '/rules'] as const;
export type PagePath = (typeof PAGE_PATHS)[number];

/** Pages that only show the visitor's own data; kept out of search results. */
export const NOINDEX_PATHS: ReadonlySet<string> = new Set(['/history']);

export function isPagePath(path: string): path is PagePath {
  return (PAGE_PATHS as readonly string[]).includes(path);
}

/** English lives at the root ("/scanner"), Spanish under "/es" ("/es/scanner"). */
export function localizePath(path: string, lang: Language): string {
  const clean = path === '' ? '/' : path;
  if (lang === DEFAULT_LANGUAGE) return clean;
  return clean === '/' ? '/es' : `/es${clean}`;
}

/** Splits "/es/scanner" into { lang: 'es', path: '/scanner' }. */
export function splitLocalePath(pathname: string): { lang: Language; path: string } {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (normalized === '/es') return { lang: 'es', path: '/' };
  if (normalized.startsWith('/es/')) return { lang: 'es', path: normalized.slice(3) };
  return { lang: 'en', path: normalized || '/' };
}
