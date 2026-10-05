import { motion } from 'framer-motion';
import type { Severity } from '../engine/types';

interface SeverityFilterProps {
  counts: Record<Severity, number>;
  active: Record<Severity, boolean>;
  onToggle: (severity: Severity) => void;
}

const SEVERITY_ORDER: Severity[] = ['critical', 'medium', 'low'];
const SEVERITY_LABELS: Record<Severity, string> = { critical: 'Critical', medium: 'Medium', low: 'Low' };
const SEVERITY_ACTIVE_STYLES: Record<Severity, string> = {
  critical: 'border-red-400/60 bg-red-400/15 text-red-300 shadow-[0_0_16px_rgba(248,113,113,0.35)]',
  medium: 'border-amber-400/60 bg-amber-400/15 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.3)]',
  low: 'border-sky-400/60 bg-sky-400/15 text-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.3)]',
};

export function SeverityFilter({ counts, active, onToggle }: SeverityFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SEVERITY_ORDER.map((severity) => (
        <motion.button
          key={severity}
          type="button"
          onClick={() => onToggle(severity)}
          aria-pressed={active[severity]}
          whileTap={{ scale: 0.95 }}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            active[severity]
              ? SEVERITY_ACTIVE_STYLES[severity]
              : 'border-white/10 bg-white/3 text-slate-500 hover:text-slate-300'
          }`}
        >
          {SEVERITY_LABELS[severity]} · {counts[severity]}
        </motion.button>
      ))}
    </div>
  );
}
