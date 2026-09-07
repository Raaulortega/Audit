import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface SeverityBreakdownProps {
  counts: { critical: number; medium: number; low: number };
}

export function SeverityBreakdown({ counts }: SeverityBreakdownProps) {
  const items = [
    {
      label: 'Critical',
      value: counts.critical,
      Icon: AlertTriangle,
      color: 'text-red-400',
      glow: 'hover:shadow-[0_0_20px_rgba(248,113,113,0.25)]',
      border: 'border-red-500/20 hover:border-red-400/50',
    },
    {
      label: 'Medium',
      value: counts.medium,
      Icon: AlertCircle,
      color: 'text-amber-400',
      glow: 'hover:shadow-[0_0_20px_rgba(251,191,36,0.22)]',
      border: 'border-amber-500/20 hover:border-amber-400/50',
    },
    {
      label: 'Low',
      value: counts.low,
      Icon: Info,
      color: 'text-sky-400',
      glow: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.22)]',
      border: 'border-sky-500/20 hover:border-sky-400/50',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, Icon, color, glow, border }, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
          whileHover={{ y: -3 }}
          className={`rounded-xl border bg-white/[0.03] p-4 text-center backdrop-blur-sm transition-shadow ${border} ${glow}`}
        >
          <Icon className={`mx-auto mb-2 h-5 w-5 ${color}`} />
          <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        </motion.div>
      ))}
    </div>
  );
}
