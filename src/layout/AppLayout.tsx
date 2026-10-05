import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Menu, X } from 'lucide-react';
import { AmbientBackground } from '../components/AmbientBackground';
import { Footer } from '../components/Footer';
import { LegalModal } from '../components/LegalModal';
import { CookieBanner } from '../components/CookieBanner';
import { Logo } from '../components/Logo';
import { NAV_GROUPS, NAV_ITEMS } from '../data/navigation';
import { LEGAL_CONTENT, type LegalModalType } from '../data/legalContent';
import { useAudit } from '../context/AuditContext';

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-3">
      <Logo className="h-9 w-9 drop-shadow-[0_0_10px_rgba(52,211,153,0.45)]" />
      <div>
        <p className="text-sm font-bold leading-tight tracking-tight text-slate-100">Config Security Audit</p>
        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-400/80">Client-side toolkit</p>
      </div>
    </NavLink>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const { fileAnalyses, history } = useAudit();
  const badges: Record<string, number> = { '/scanner': fileAnalyses.length, '/history': history.length };

  return (
    <nav className="space-y-6" aria-label="Main">
      {NAV_GROUPS.map((group) => (
        <div key={group}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">{group}</p>
          <ul className="space-y-1">
            {NAV_ITEMS.filter((item) => item.group === group).map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-emerald-400/10 text-emerald-300'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId={onNavigate ? 'nav-active-mobile' : 'nav-active'}
                          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-emerald-400"
                          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                        />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {badges[path] > 0 && (
                        <span className="rounded-full bg-white/10 px-1.5 text-[10px] font-semibold tabular-nums text-slate-300">
                          {badges[path]}
                        </span>
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

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading page" />
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openModal, setOpenModal] = useState<LegalModalType | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen text-slate-100">
      <AmbientBackground />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-slate-950/80 px-4 py-5 backdrop-blur-md lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <div className="mt-8 flex-1 overflow-y-auto">
          <Navigation />
        </div>
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-slate-400">
          <p className="flex items-center gap-1.5 font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            100% local
          </p>
          <p className="mt-1">Files and secrets never leave your browser. No backend, no telemetry.</p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-emerald-300"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-[61px] z-20 max-h-[calc(100vh-61px)] overflow-y-auto border-b border-white/10 bg-slate-950/95 px-4 py-5 backdrop-blur-xl lg:hidden"
          >
            <Navigation onNavigate={() => setMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
          <Suspense fallback={<PageFallback />}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        </main>
        <Footer onOpenModal={setOpenModal} />
      </div>

      <CookieBanner onLearnMore={() => setOpenModal('cookies')} />
      <LegalModal section={openModal ? LEGAL_CONTENT[openModal] : null} onClose={() => setOpenModal(null)} />
    </div>
  );
}
