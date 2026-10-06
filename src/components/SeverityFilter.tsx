import { useI18n } from '../i18n/I18nContext';
import type { Severity } from '../engine/types';
import { Chip } from './PageHeader';

interface SeverityFilterProps {
  counts: Record<Severity, number>;
  active: Record<Severity, boolean>;
  onToggle: (severity: Severity) => void;
}

const SEVERITY_ORDER: Severity[] = ['critical', 'medium', 'low'];
const DOT: Record<Severity, string> = {
  critical: 'bg-critical',
  medium: 'bg-medium',
  low: 'bg-low',
};

export function SeverityFilter({ counts, active, onToggle }: SeverityFilterProps) {
  const { t } = useI18n();
  return (
    <div className="scroll-row -mx-1 flex gap-2 overflow-x-auto px-1">
      {SEVERITY_ORDER.map((severity) => (
        <Chip key={severity} pressed={active[severity]} onClick={() => onToggle(severity)}>
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${DOT[severity]}`} />
          {t.common.severity[severity]}
          <span className="tabular-nums opacity-70">{counts[severity]}</span>
        </Chip>
      ))}
    </div>
  );
}
