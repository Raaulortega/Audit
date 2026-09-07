import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { EXAMPLE_PRESETS, type PresetFile } from '../data/examplePresets';

interface ExamplePresetsProps {
  onLoadPreset: (files: PresetFile[]) => void;
}

export function ExamplePresets({ onLoadPreset }: ExamplePresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        Try an example — no upload needed
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {EXAMPLE_PRESETS.map((preset) => (
          <motion.button
            key={preset.id}
            type="button"
            onClick={() => onLoadPreset(preset.files)}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-left backdrop-blur-sm transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/10"
          >
            <p className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300">{preset.label}</p>
            <p className="text-xs text-slate-500">{preset.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
