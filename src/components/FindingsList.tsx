import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search, ShieldCheck } from 'lucide-react';
import { CodeSnippet } from './CodeSnippet';
import { SeverityFilter } from './SeverityFilter';
import type { Finding, Severity } from '../engine/types';
import { useI18n } from '../i18n/I18nContext';

interface FindingsListProps {
  findings: Finding[];
}

const SEVERITY_ORDER: Severity[] = ['critical', 'medium', 'low'];
const SEVERITY_BORDER: Record<Severity, string> = {
  critical: 'border-red-500/30 hover:border-red-400/50',
  medium: 'border-amber-500/30 hover:border-amber-400/50',
  low: 'border-sky-500/30 hover:border-sky-400/50',
};
const SEVERITY_DOT: Record<Severity, string> = {
  critical: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]',
  medium: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]',
  low: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]',
};

function emptyActiveMap(value: boolean): Record<Severity, boolean> {
  return { critical: value, medium: value, low: value };
}

export function FindingsList({ findings }: FindingsListProps) {
  const { t } = useI18n();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
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

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (findings.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/3 px-4 py-6 text-sm text-slate-500">
        <ShieldCheck className="h-4 w-4 text-slate-600" />
        {t.findings.empty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SeverityFilter counts={counts} active={active} onToggle={toggleSeverity} />
        <label className="relative block sm:w-64">
          <span className="sr-only">{t.findings.search}</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.findings.searchPlaceholder}
            className="w-full rounded-lg border border-white/10 bg-slate-950/60 py-1.5 pl-8 pr-2 text-xs text-slate-200 transition-colors focus:border-emerald-400/60 focus:outline-hidden"
          />
        </label>
      </div>

      {visibleFindings.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/3 px-4 py-6 text-center text-sm text-slate-500">
          {t.findings.noMatch}
        </p>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence initial={false}>
            {visibleFindings.map((finding) => {
              const isOpen = openIds.has(finding.id);
              return (
                <motion.div
                  key={finding.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`overflow-hidden rounded-xl border bg-white/3 backdrop-blur-xs transition-colors ${SEVERITY_BORDER[finding.severity]}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleOpen(finding.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[finding.severity]}`} />
                      <span className="text-sm font-medium text-slate-100">{finding.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs uppercase tracking-wide text-slate-500 sm:inline">
                        {t.common.severity[finding.severity]} · {finding.sourceFile}
                        {finding.line ? `:${finding.line}` : ''}
                      </span>
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      </motion.span>
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 px-4 pb-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
                              {finding.category}
                            </span>
                            {finding.references?.map((reference) => {
                              const cwe = /^CWE-(\d+)$/.exec(reference);
                              const className =
                                'rounded-md border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 font-mono text-[11px] text-emerald-300/90';
                              return cwe ? (
                                <a
                                  key={reference}
                                  href={`https://cwe.mitre.org/data/definitions/${cwe[1]}.html`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`${className} hover:border-emerald-400/50`}
                                >
                                  {reference}
                                </a>
                              ) : (
                                <span key={reference} className={className}>
                                  {reference}
                                </span>
                              );
                            })}
                          </div>
                          <p className="text-sm text-slate-400">{finding.description}</p>
                          <CodeSnippet code={finding.fixSnippet} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
