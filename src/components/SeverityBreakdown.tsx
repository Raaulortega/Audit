import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface SeverityBreakdownProps {
  counts: { critical: number; medium: number; low: number };
}

export function SeverityBreakdown({ counts }: SeverityBreakdownProps) {
  const items = [
    { label: 'Critical', value: counts.critical, Icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-950/40' },
    { label: 'Medium', value: counts.medium, Icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-950/40' },
    { label: 'Low', value: counts.low, Icon: Info, color: 'text-sky-400', bg: 'bg-sky-950/40' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, Icon, color, bg }) => (
        <div key={label} className={`rounded-lg border border-slate-800 ${bg} p-3 text-center`}>
          <Icon className={`mx-auto mb-1 h-5 w-5 ${color}`} />
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}
