import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight, LockKeyhole, ScanSearch } from 'lucide-react';
import { SectionHeader, buttonClass } from '../components/PageHeader';
import { NAV_GROUPS, NAV_ITEMS } from '../data/navigation';
import { RULE_CATALOG } from '../engine/ruleCatalog';
import { useAudit } from '../context/AuditContext';
import { useI18n } from '../i18n/I18nContext';

function Stat({ value, label, tone = 'text-label' }: { value: string | number; label: string; tone?: string }) {
  return (
    <div className="flex flex-col bg-surface px-3 py-4 text-center">
      <dd className={`font-rounded text-title1 font-semibold tabular-nums ${tone}`}>{value}</dd>
      <dt className="order-first text-footnote text-label-2">{label}</dt>
    </div>
  );
}

export function HomePage() {
  const { result, fileAnalyses, history } = useAudit();
  const { t, to } = useI18n();
  const hasScan = fileAnalyses.length > 0;
  const groups = NAV_GROUPS.map((group) => ({
    group,
    items: NAV_ITEMS.filter((navItem) => navItem.group === group && navItem.path !== '/'),
  }));

  return (
    <div className="space-y-10">
      <section className="pt-2 lg:pt-6">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-tint-soft px-3 py-1 text-footnote font-semibold text-tint">
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          {t.home.badge}
        </p>
        <h1 className="max-w-3xl font-display text-large-title font-bold tracking-tight text-label sm:text-[2.75rem] sm:leading-[1.1]">
          {t.home.title}
        </h1>
        <p className="mt-3 max-w-2xl text-body text-label-2">{t.home.intro(RULE_CATALOG.length)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={to('/scanner')} className={buttonClass('primary')}>
            <ScanSearch className="h-4 w-4" aria-hidden="true" />
            {t.home.startScan}
          </Link>
          <Link to={to('/rules')} className={buttonClass('secondary')}>
            {t.home.browseRules}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {(hasScan || history.length > 0) && (
        <dl className="card grid grid-cols-2 gap-px overflow-hidden bg-separator sm:grid-cols-4">
          <Stat value={hasScan ? result.score : '—'} label={t.home.stats.lastScore} />
          <Stat
            value={result.counts.critical}
            label={t.home.stats.critical}
            tone={hasScan && result.counts.critical > 0 ? 'text-critical' : 'text-label'}
          />
          <Stat value={fileAnalyses.length} label={t.home.stats.files} />
          <Stat value={history.length} label={t.home.stats.saved} />
        </dl>
      )}

      <section aria-labelledby="tools-title">
        <h2 id="tools-title" className="mb-4 text-title2 font-bold tracking-tight text-label">
          {t.home.whatYouCanDo}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {groups
            .filter(({ items }) => items.length > 0)
            .map(({ group, items }) => (
              <div key={group} className={group === 'Toolkit' ? 'lg:row-span-2' : ''}>
                <SectionHeader>{t.nav.groups[group]}</SectionHeader>
                <ul className="card divide-y divide-separator overflow-hidden">
                  {items.map(({ path, icon: Icon }) => (
                    <li key={path}>
                      <Link to={to(path)} className="group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-fill/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-tint-soft text-tint">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-callout font-semibold text-label">{t.nav.items[path].label}</span>
                          <span className="block text-footnote text-label-2">{t.nav.items[path].description}</span>
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-label-3 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-headline font-semibold text-label">{t.home.whyTitle}</h2>
        <p className="mt-2 max-w-3xl text-subhead leading-relaxed text-label-2">{t.home.whyBody}</p>
      </section>

      <section aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-4 text-title2 font-bold tracking-tight text-label">
          {t.faq.title}
        </h2>
        <div className="card divide-y divide-separator overflow-hidden">
          {t.faq.items.map(({ question, answer }) => (
            <details key={question} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-callout font-medium text-label hover:bg-fill/50 [&::-webkit-details-marker]:hidden">
                <h3>{question}</h3>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-label-3 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 pb-4 text-subhead leading-relaxed text-label-2">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
