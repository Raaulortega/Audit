import { motion } from 'framer-motion';
import { Logo } from './Logo';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9 drop-shadow-[0_0_10px_rgba(52,211,153,0.45)]" />
          <div>
            <p className="text-sm font-bold leading-tight tracking-tight text-slate-100">Config Security Audit</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-400/80">
              Client-side · Zero backend
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
    </motion.header>
  );
}
