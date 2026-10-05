import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ScanSearch, ShieldCheck } from 'lucide-react';
import { Card } from '../components/PageHeader';
import { Logo } from '../components/Logo';
import { NAV_ITEMS } from '../data/navigation';
import { RULE_CATALOG } from '../engine/ruleCatalog';
import { useAudit } from '../context/AuditContext';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-center backdrop-blur-xs">
      <p className="text-2xl font-bold tabular-nums text-emerald-300">{value}</p>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

export function HomePage() {
  const { result, fileAnalyses, history } = useAudit();
  const tools = NAV_ITEMS.filter((navItem) => navItem.path !== '/');
  const hasScan = fileAnalyses.length > 0;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/10 via-white/3 to-transparent p-8 backdrop-blur-xs sm:p-10">
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <Logo className="h-11 w-11 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              100% client-side
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            A security toolkit for your configs, secrets and tokens
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-400">
            Scan deployment files against {RULE_CATALOG.length}+ rules, hunt for leaked credentials, inspect JWTs, build
            hardened HTTP headers and generate strong secrets — all without anything leaving your browser.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/scanner"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-colors hover:bg-emerald-400"
            >
              <ScanSearch className="h-4 w-4" />
              Start a scan
            </Link>
            <Link
              to="/rules"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
            >
              Browse the rules
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {(hasScan || history.length > 0) && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={hasScan ? result.score : '—'} label="Last score" />
          <Stat value={result.counts.critical} label="Critical" />
          <Stat value={fileAnalyses.length} label="Files loaded" />
          <Stat value={history.length} label="Saved scans" />
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">What you can do</h2>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tools.map(({ path, label, description, icon: Icon }) => (
            <motion.div key={path} variants={item}>
              <Link to={path} className="group block h-full">
                <Card className="flex h-full flex-col transition-colors group-hover:border-emerald-400/40">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300">{label}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">{description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-400/80">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-xs">
        <h2 className="text-sm font-semibold text-slate-100">Why client-side?</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          Security tooling that uploads your configs and secrets to a server creates the exact risk it is meant to
          reduce. Everything here runs in your browser with the Web Crypto API — no backend, no network calls, no
          telemetry. You can disconnect from the internet and it still works.
        </p>
      </section>
    </div>
  );
}
