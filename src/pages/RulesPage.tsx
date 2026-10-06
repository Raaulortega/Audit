import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Chip, PageHeader } from '../components/PageHeader';
import { SearchField } from '../components/FindingsList';
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
      {t.rules.englishNote && <p className="-mt-4 text-footnote text-label-2">{t.rules.englishNote}</p>}

      <div className="space-y-3">
        <SearchField value={query} onChange={setQuery} label={t.rules.search} placeholder={t.rules.searchPlaceholder} />
        <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {TARGETS.map((value) => (
            <Chip key={value} pressed={target === value} onClick={() => setTarget(value)}>
              {value === 'all' ? t.rules.all : <span className="font-mono">{targetLabel(value)}</span>}
            </Chip>
          ))}
        </div>
      </div>

      <ul className="card divide-y divide-separator overflow-hidden">
        {filtered.map((rule) => (
          <li key={`${rule.target}-${rule.id}`} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="sm:w-24 sm:shrink-0">
              <SeverityBadge severity={rule.severity} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-subhead text-label">{rule.title}</p>
              <p className="font-mono text-caption text-label-2">
                {targetLabel(rule.target)} · {rule.id.replace(/-$/, '*')}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-1">
              <ReferenceBadges references={rule.references} />
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="px-4 py-10 text-center text-subhead text-label-2">{t.rules.noMatch}</li>}
      </ul>
    </div>
  );
}
