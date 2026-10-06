import { useI18n } from '../i18n/I18nContext';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface SeverityBreakdownProps {
  counts: { critical: number; medium: number; low: number };
}

export function SeverityBreakdown({ counts }: SeverityBreakdownProps) {
  const { t } = useI18n();
  const items = [
    { label: t.common.severity.critical, value: counts.critical, Icon: AlertTriangle, color: 'text-critical' },
    { label: t.common.severity.medium, value: counts.medium, Icon: AlertCircle, color: 'text-medium' },
    { label: t.common.severity.low, value: counts.low, Icon: Info, color: 'text-low' },
  ];

  return (
    <dl className="card grid h-full grid-cols-3 divide-x divide-separator">
      {items.map(({ label, value, Icon, color }) => (
        <div key={label} className="flex flex-col items-center justify-center gap-1 px-2 py-5 text-center">
          <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
          <dd className={`font-rounded text-title1 font-semibold tabular-nums ${value > 0 ? color : 'text-label-2'}`}>{value}</dd>
          <dt className="order-last text-footnote text-label-2">{label}</dt>
        </div>
      ))}
    </dl>
  );
}
