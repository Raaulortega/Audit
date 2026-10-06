import { useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, ChevronRight, Info, Search, ShieldCheck, type LucideIcon } from 'lucide-react';
import { CodeSnippet } from './CodeSnippet';
import { SeverityFilter } from './SeverityFilter';
import { ReferenceBadges, SeverityBadge } from './SeverityBadge';
import type { Finding, Severity } from '../engine/types';
import { useI18n } from '../i18n/I18nContext';

interface FindingsListProps {
  findings: Finding[];
}

const SEVERITY_ORDER: Severity[] = ['critical', 'medium', 'low'];
const SEVERITY_ICON: Record<Severity, { Icon: LucideIcon; color: string }> = {
  critical: { Icon: AlertTriangle, color: 'text-critical' },
  medium: { Icon: AlertCircle, color: 'text-medium' },
  low: { Icon: Info, color: 'text-low' },
};

function emptyActiveMap(value: boolean): Record<Severity, boolean> {
  return { critical: value, medium: value, low: value };
}

/** Search field in the system style: magnifier, gray fill, no border. */
export function SearchField({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-label-3" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field h-11 pl-9 pr-3 text-callout lg:h-9 lg:text-subhead"
      />
    </label>
  );
}

/** Expandable finding rows: tap a row to see what is wrong and how to fix it. */
export function FindingRows({ findings, className = 'card' }: { findings: Finding[]; className?: string }) {
  const { t } = useI18n();
  const listId = useId();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ul className={`${className} divide-y divide-separator overflow-hidden`}>
      {findings.map((finding) => {
        const isOpen = openIds.has(finding.id);
        const { Icon, color } = SEVERITY_ICON[finding.severity];
        const panelId = `${listId}-${finding.id}`;
        return (
          <li key={finding.id}>
            <button
              type="button"
              onClick={() => toggleOpen(finding.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-fill/50"
            >
              <Icon className={`h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-subhead font-medium text-label">{finding.title}</span>
                <span className="mt-0.5 block truncate text-footnote text-label-2">
                  {t.common.severity[finding.severity]} · {finding.sourceFile}
                  {finding.line ? `:${finding.line}` : ''}
                </span>
              </span>
              <ChevronRight
                className={`h-4 w-4 shrink-0 text-label-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-4 pb-4 sm:pl-12">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SeverityBadge severity={finding.severity} />
                      <span className="rounded-md bg-fill px-1.5 py-0.5 text-caption2 text-label-2">{finding.category}</span>
                      {finding.references && <ReferenceBadges references={finding.references} />}
                    </div>
                    <p className="text-subhead text-label-2">{finding.description}</p>
                    <CodeSnippet code={finding.fixSnippet} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export function FindingsList({ findings }: FindingsListProps) {
  const { t } = useI18n();
  const [active, setActive] = useState<Record<Severity, boolean>>(() => emptyActiveMap(true));
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const result = { critical: 0, medium: 0, low: 0 };
    for (const finding of findings) result[finding.severity] += 1;
    return result;
  }, [findings]);

  const orderedFindings = useMemo(
    () => SEVERITY_ORDER.flatMap((severity) => findings.filter((finding) => finding.severity === severity)),
    [findings],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const visibleFindings = orderedFindings.filter(
    (finding) =>
      active[finding.severity] &&
      (normalizedQuery.length === 0 ||
        [finding.title, finding.category, finding.sourceFile, ...(finding.references ?? [])].some((field) =>
          field.toLowerCase().includes(normalizedQuery),
        )),
  );

  const toggleSeverity = (severity: Severity) => {
    setActive((prev) => ({ ...prev, [severity]: !prev[severity] }));
  };

  if (findings.length === 0) {
    return (
      <div className="card flex items-center gap-3 px-5 py-6 text-subhead text-label-2">
        <ShieldCheck className="h-5 w-5 text-tint" aria-hidden="true" />
        {t.findings.empty}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SeverityFilter counts={counts} active={active} onToggle={toggleSeverity} />
        <SearchField value={query} onChange={setQuery} label={t.findings.search} placeholder={t.findings.searchPlaceholder} />
      </div>

      {visibleFindings.length === 0 ? (
        <p className="card px-5 py-8 text-center text-subhead text-label-2">{t.findings.noMatch}</p>
      ) : (
        <FindingRows findings={visibleFindings} />
      )}
    </div>
  );
}
