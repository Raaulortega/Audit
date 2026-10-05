import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { en, type Messages } from './en';
import { es } from './es';
import { LANGUAGES, localizePath, splitLocalePath, type Language } from './paths';

export { LANGUAGES, type Language };

const MESSAGES: Record<Language, Messages> = { en, es };
const STORAGE_KEY = 'config-audit:lang';

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Turns a page path ("/scanner") into the URL for the current language ("/es/scanner"). */
  to: (path: string) => string;
  t: Messages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function messagesFor(lang: Language): Messages {
  return MESSAGES[lang];
}

/** Remembers an explicit language choice so later visits to the root open in that language. */
export function rememberLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable - the URL still carries the choice
  }
}

function readPreference(): Language | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'es' ? saved : null;
  } catch {
    return null;
  }
}

/**
 * The language comes from the URL ("/es/..." is Spanish), so every page has a
 * crawlable address per language. The saved choice only steers the first visit.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const { lang, path } = splitLocalePath(pathname);

  const setLang = useCallback(
    (next: Language) => {
      rememberLanguage(next);
      if (next !== lang) navigate(localizePath(path, next) + search + hash);
    },
    [lang, path, search, hash, navigate],
  );

  // First visit to an English URL by someone who prefers Spanish: send them to the Spanish page.
  // Crawlers have no saved choice and an English browser language, so they keep the URL they asked for.
  useEffect(() => {
    if (lang !== 'en') return;
    const preferred =
      readPreference() ?? (navigator.language.toLowerCase().startsWith('es') ? 'es' : null);
    if (preferred === 'es') navigate(localizePath(path, 'es') + search + hash, { replace: true });
    // Only on the initial load: later navigation follows the links the user clicks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = MESSAGES[lang].meta.htmlLang;
  }, [lang]);

  const to = useCallback((target: string) => localizePath(target, lang), [lang]);
  const value = useMemo(() => ({ lang, setLang, to, t: MESSAGES[lang] }), [lang, setLang, to]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}
