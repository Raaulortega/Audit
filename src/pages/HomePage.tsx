import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ScanSearch, ShieldCheck } from 'lucide-react';
import { Card } from '../components/PageHeader';
import { Logo } from '../components/Logo';
import { NAV_ITEMS } from '../data/navigation';
import { RULE_CATALOG } from '../engine/ruleCatalog';
import { useAudit } from '../context/AuditContext';
import { useI18n } from '../i18n/I18nContext';

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
  const { t, to } = useI18n();
  const tools = NAV_ITEMS.filter((navItem) => navItem.path !== '/');
  const hasScan = fileAnalyses.length > 0;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/10 via-white/3 to-transparent p-8 backdrop-blur-xs sm:p-10">
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <Logo className="h-11 w-11 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              {t.home.badge}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">{t.home.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-400">{t.home.intro(RULE_CATALOG.length)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={to('/scanner')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-colors hover:bg-emerald-400"
            >
              <ScanSearch className="h-4 w-4" />
              {t.home.startScan}
            </Link>
            <Link
              to={to('/rules')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
            >
              {t.home.browseRules}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {(hasScan || history.length > 0) && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={hasScan ? result.score : '—'} label={t.home.stats.lastScore} />
          <Stat value={result.counts.critical} label={t.home.stats.critical} />
          <Stat value={fileAnalyses.length} label={t.home.stats.files} />
          <Stat value={history.length} label={t.home.stats.saved} />
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{t.home.whatYouCanDo}</h2>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tools.map(({ path, icon: Icon }) => (
            <motion.div key={path} variants={item}>
              <Link to={to(path)} className="group block h-full">
                <Card className="flex h-full flex-col transition-colors group-hover:border-emerald-400/40">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300">
                    {t.nav.items[path].label}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">{t.nav.items[path].description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-400/80">
                    {t.common.open}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-xs">
        <h2 className="text-sm font-semibold text-slate-100">{t.home.whyTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{t.home.whyBody}</p>
      </section>

      <section aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t.faq.title}
        </h2>
        <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xs">
          {t.faq.items.map(({ question, answer }) => (
            <details key={question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-100 hover:text-emerald-300">
                <h3>{question}</h3>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
