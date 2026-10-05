import { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Card, PageHeader } from '../components/PageHeader';
import { ReferenceBadges, SeverityBadge } from '../components/SeverityBadge';
import { RULE_CATALOG, TARGET_LABELS, type RuleTarget } from '../engine/ruleCatalog';
import { useI18n } from '../i18n/I18nContext';

const TARGETS: Array<RuleTarget | 'all'> = [
  'all',
  'anyFile',
  'vercelJson',
  'packageJson',
  'dockerfile',
  'gitignore',
  'envFile',
  'dockerCompose',
  'nginxConf',
];

export function RulesPage() {
  const { t } = useI18n();
  const targetLabel = (value: RuleTarget) => (value === 'anyFile' ? t.rules.anyFile : TARGET_LABELS[value]);
  const [target, setTarget] = useState<RuleTarget | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return RULE_CATALOG.filter(
      (rule) =>
        (target === 'all' || rule.target === target) &&
        (normalized.length === 0 ||
          [rule.title, rule.id, ...rule.references].some((field) => field.toLowerCase().includes(normalized))),
    );
  }, [target, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        eyebrow={t.rules.eyebrow}
        title={t.rules.title}
        description={t.rules.description(RULE_CATALOG.length)}
      />
      {t.rules.englishNote && <p className="-mt-4 text-xs text-slate-500">{t.rules.englishNote}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {TARGETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTarget(value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                target === value
                  ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                  : 'border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {value === 'all' ? t.rules.all : targetLabel(value)}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-60">
          <span className="sr-only">{t.rules.search}</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.rules.searchPlaceholder}
            className="w-full rounded-lg border border-white/10 bg-slate-950/60 py-1.5 pl-8 pr-2 text-xs text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
          />
        </label>
      </div>

      <Card className="p-0">
        <div className="divide-y divide-white/5">
          {filtered.map((rule) => (
            <div key={`${rule.target}-${rule.id}`} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 sm:w-20 sm:shrink-0">
                <SeverityBadge severity={rule.severity} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-100">{rule.title}</p>
                <p className="font-mono text-[11px] text-slate-500">
                  {targetLabel(rule.target)} · {rule.id.replace(/-$/, '*')}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1">
                <ReferenceBadges references={rule.references} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-500">{t.rules.noMatch}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
