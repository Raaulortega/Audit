import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { BookOpen, History, LayoutDashboard, Loader2, LockKeyhole, ScanSearch, Wrench, type LucideIcon } from 'lucide-react';
import { AmbientBackground } from '../components/AmbientBackground';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Footer } from '../components/Footer';
import { LegalModal } from '../components/LegalModal';
import { CookieBanner } from '../components/CookieBanner';
import { Logo } from '../components/Logo';
import { NAV_GROUPS, NAV_ITEMS } from '../data/navigation';
import type { LegalModalType } from '../data/legalContent';
import { useAudit } from '../context/AuditContext';
import { LANGUAGES, rememberLanguage, useI18n } from '../i18n/I18nContext';
import { localizePath, splitLocalePath } from '../i18n/paths';
import { Seo } from '../components/Seo';

const SPRING = { type: 'spring', stiffness: 500, damping: 40 } as const;
const TOOL_ITEMS = NAV_ITEMS.filter((item) => item.group === 'Toolkit');

function Brand({ showTagline = false }: { showTagline?: boolean }) {
  const { t, to } = useI18n();
  return (
    <NavLink to={to('/')} className="flex min-h-11 items-center gap-2.5 rounded-xl" aria-label={t.meta.title}>
      <Logo className="h-8 w-8 shrink-0" />
      <span className="min-w-0">
        <span className="block text-headline font-semibold tracking-tight text-label">LocalAudit</span>
        {showTagline && <span className="block truncate text-caption text-label-2">{t.brand.tagline}</span>}
      </span>
    </NavLink>
  );
}

function LanguageSwitch() {
  const { lang, t } = useI18n();
  const { pathname, search } = useLocation();
  const { path } = splitLocalePath(pathname);
  return (
    <div role="group" aria-label={t.language.label} className="inline-flex rounded-[10px] bg-fill p-0.5">
      {LANGUAGES.map((option) => (
        // Real links (not buttons) so crawlers can follow them to the other language version.
        <Link
          key={option}
          to={localizePath(path, option) + search}
          onClick={() => rememberLanguage(option)}
          hrefLang={option}
          lang={option}
          aria-current={lang === option ? 'true' : undefined}
          title={t.language[option]}
          className={`flex min-h-9 min-w-11 items-center justify-center rounded-[8px] px-2.5 text-footnote font-semibold uppercase transition-colors lg:min-h-7 lg:min-w-9 ${
            lang === option ? 'bg-surface-raised text-label shadow-[0_1px_3px_rgb(0_0_0/0.12)]' : 'text-label-2 hover:text-label'
          }`}
        >
          {option}
        </Link>
      ))}
    </div>
  );
}

/** Desktop sidebar: two levels at most, accent-colored glyphs, selection drawn as a gray pill. */
function SidebarNav() {
  const { fileAnalyses, history } = useAudit();
  const { t, to } = useI18n();
  const badges: Record<string, number> = { '/scanner': fileAnalyses.length, '/history': history.length };

  return (
    <nav className="space-y-5" aria-label={t.layout.mainNav}>
      {NAV_GROUPS.map((group) => (
        <div key={group}>
          <p className="mb-1 px-2.5 text-footnote font-semibold text-label-2">{t.nav.groups[group]}</p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.filter((item) => item.group === group).map(({ path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={to(path)}
                  end={path === '/'}
                  className={({ isActive }) =>
                    `relative flex min-h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-subhead transition-colors ${
                      isActive ? 'font-semibold text-label' : 'text-label hover:bg-fill'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span layoutId="sidebar-selection" transition={SPRING} className="absolute inset-0 rounded-[10px] bg-fill-strong" />
                      )}
                      <Icon className="relative h-[18px] w-[18px] shrink-0 text-tint" aria-hidden="true" />
                      <span className="relative flex-1 truncate">{t.nav.items[path].label}</span>
                      {badges[path] > 0 && (
                        <span className="relative text-footnote font-normal tabular-nums text-label-2">{badges[path]}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

interface Tab {
  key: 'overview' | 'scanner' | 'tools' | 'history' | 'rules';
  icon: LucideIcon;
  path?: string;
}

const TABS: Tab[] = [
  { key: 'overview', icon: LayoutDashboard, path: '/' },
  { key: 'scanner', icon: ScanSearch, path: '/scanner' },
  { key: 'tools', icon: Wrench },
  { key: 'history', icon: History, path: '/history' },
  { key: 'rules', icon: BookOpen, path: '/rules' },
];

/** Floating glass tab bar for compact widths. Tabs only navigate; Tools opens a sheet of the four tools. */
function TabBar({ onOpenTools, toolsOpen }: { onOpenTools: () => void; toolsOpen: boolean }) {
  const { t, to } = useI18n();
  const { pathname } = useLocation();
  const { path: current } = splitLocalePath(pathname);
  const { result, fileAnalyses } = useAudit();
  const critical = fileAnalyses.length > 0 ? result.counts.critical : 0;
  const onTool = TOOL_ITEMS.some((item) => item.path === current);

  return (
    <nav
      aria-label={t.layout.mainNav}
      className="glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-lg items-stretch rounded-full p-1 lg:hidden"
    >
      {TABS.map(({ key, icon: Icon, path }) => {
        const selected = path ? current === path : onTool || toolsOpen;
        const content = (
          <>
            {selected && <motion.span layoutId="tab-selection" transition={SPRING} className="absolute inset-0 rounded-full bg-fill-strong" />}
            <span className="relative">
              <Icon className="h-[22px] w-[22px]" strokeWidth={selected ? 2.4 : 2} aria-hidden="true" />
              {key === 'scanner' && critical > 0 && (
                <span className="absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-critical px-1 text-center text-caption2 font-bold leading-[18px] text-bg">
                  {critical}
                </span>
              )}
            </span>
            <span className="relative max-w-full truncate text-caption2 font-semibold">{t.layout.tabs[key]}</span>
          </>
        );
        const className = `relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 transition-colors ${
          selected ? 'text-tint' : 'text-label'
        }`;
        return path ? (
          <NavLink key={key} to={to(path)} end={path === '/'} className={className} aria-current={selected ? 'page' : undefined}>
            {content}
          </NavLink>
        ) : (
          <button key={key} type="button" onClick={onOpenTools} aria-haspopup="dialog" aria-expanded={toolsOpen} className={className}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}

function ToolsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, to } = useI18n();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end bg-black/30 lg:hidden"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tools-sheet-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="glass mx-2 mb-2 w-full rounded-[32px] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2"
          >
            <div aria-hidden="true" className="mx-auto mb-2 h-[5px] w-9 rounded-full bg-fill-strong" />
            <div className="mb-2 flex items-center justify-between px-2">
              <h2 id="tools-sheet-title" className="text-headline font-semibold text-label">
                {t.layout.toolsTitle}
              </h2>
              <button type="button" onClick={onClose} className="min-h-11 rounded-full px-3 text-callout font-semibold text-tint">
                {t.common.close}
              </button>
            </div>
            <ul className="divide-y divide-separator overflow-hidden rounded-[20px] bg-surface">
              {TOOL_ITEMS.map(({ path, icon: Icon }, index) => (
                <li key={path}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    to={to(path)}
                    onClick={onClose}
                    className="flex min-h-14 items-center gap-3 px-4 py-2.5 hover:bg-fill/60"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-tint-soft text-tint">
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-body font-medium text-label">{t.nav.items[path].label}</span>
                      <span className="block truncate text-footnote text-label-2">{t.nav.items[path].description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PageFallback() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-label-2">
      <Loader2 className="h-5 w-5 animate-spin" aria-label={t.layout.loadingPage} />
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();
  const { t } = useI18n();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [openModal, setOpenModal] = useState<LegalModalType | null>(null);
  // Stable callbacks: the sheets move focus in an effect keyed on them.
  const closeTools = useCallback(() => setToolsOpen(false), []);
  const closeModal = useCallback(() => setOpenModal(null), []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setToolsOpen(false);
  }, [location.pathname]);

  return (
    // reducedMotion="user": framer-motion drops transform and layout animation when Reduce Motion is on.
    <MotionConfig reducedMotion="user">
      <div className="relative isolate min-h-screen overflow-x-clip">
        <AmbientBackground />
        <Seo />

        <aside className="glass fixed bottom-3 left-3 top-3 z-30 hidden w-64 flex-col rounded-[26px] p-3 lg:flex">
          <div className="px-1.5 pb-4 pt-1">
            <Brand showTagline />
          </div>
          <div className="-mx-1 flex-1 overflow-y-auto px-1">
            <SidebarNav />
          </div>
          <div className="mt-3 space-y-3 border-t border-separator px-1.5 pt-3">
            <p className="flex items-start gap-2 text-caption text-label-2">
              <LockKeyhole className="mt-px h-3.5 w-3.5 shrink-0 text-tint" aria-hidden="true" />
              <span>
                <span className="font-semibold text-label">{t.brand.localTitle}.</span> {t.brand.localBody}
              </span>
            </p>
            <LanguageSwitch />
          </div>
        </aside>

        <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 rounded-none border-x-0 border-t-0 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-none lg:hidden">
          <Brand />
          <LanguageSwitch />
        </header>

        <div className="flex min-h-screen flex-col lg:pl-[17.5rem]">
          <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-6 sm:px-6 lg:pt-10">
            <ErrorBoundary resetKey={location.pathname}>
              <Suspense fallback={<PageFallback />}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <Outlet />
                </motion.div>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer onOpenModal={setOpenModal} />
        </div>

        <TabBar onOpenTools={() => setToolsOpen(true)} toolsOpen={toolsOpen} />
        <ToolsSheet open={toolsOpen} onClose={closeTools} />
        <CookieBanner onLearnMore={() => setOpenModal('cookies')} />
        <LegalModal type={openModal} onClose={closeModal} />
      </div>
    </MotionConfig>
  );
}
