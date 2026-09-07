import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { CodeSnippet } from './CodeSnippet';
import { SeverityFilter } from './SeverityFilter';
import type { Finding, Severity } from '../engine/types';

interface FindingsListProps {
  findings: Finding[];
}

const SEVERITY_ORDER: Severity[] = ['critical', 'medium', 'low'];
const SEVERITY_LABELS: Record<Severity, string> = { critical: 'Critical', medium: 'Medium', low: 'Low' };
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
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<Record<Severity, boolean>>(() => emptyActiveMap(true));

  const counts = useMemo(() => {
    const result = { critical: 0, medium: 0, low: 0 };
    for (const finding of findings) result[finding.severity] += 1;
    return result;
  }, [findings]);

  const orderedFindings = useMemo(
    () => SEVERITY_ORDER.flatMap((severity) => findings.filter((finding) => finding.severity === severity)),
    [findings],
  );
  const visibleFindings = orderedFindings.filter((finding) => active[finding.severity]);

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
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-slate-500">
        <ShieldCheck className="h-4 w-4 text-slate-600" />
        No findings yet. Add a configuration file to begin.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SeverityFilter counts={counts} active={active} onToggle={toggleSeverity} />

      {visibleFindings.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-slate-500">
          No findings match the selected filters.
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
                  className={`overflow-hidden rounded-xl border bg-white/[0.03] backdrop-blur-sm transition-colors ${SEVERITY_BORDER[finding.severity]}`}
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
                        {SEVERITY_LABELS[finding.severity]} · {finding.sourceFile}
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
