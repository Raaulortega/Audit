import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { ExamplePresets } from './ExamplePresets';
import type { PresetFile } from '../data/examplePresets';
import { useI18n } from '../i18n/I18nContext';

interface EmptyStateProps {
  onLoadPreset: (files: PresetFile[]) => void;
}

export function EmptyState({ onLoadPreset }: EmptyStateProps) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/3 px-6 py-14 text-center backdrop-blur-xs"
    >
      <motion.div
        animate={{ boxShadow: ['0 0 0px rgba(52,211,153,0)', '0 0 32px rgba(52,211,153,0.25)', '0 0 0px rgba(52,211,153,0)'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10"
      >
        <ShieldAlert className="h-8 w-8 text-emerald-400" />
      </motion.div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-slate-100">{t.emptyState.title}</h2>
        <p className="mx-auto max-w-md text-sm text-slate-400">
          {t.emptyState.body}
        </p>
      </div>
      <ExamplePresets onLoadPreset={onLoadPreset} />
    </motion.div>
  );
}
