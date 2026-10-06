import { ShieldQuestion } from 'lucide-react';
import { ExamplePresets } from './ExamplePresets';
import type { PresetFile } from '../data/examplePresets';
import { useI18n } from '../i18n/I18nContext';

interface EmptyStateProps {
  onLoadPreset: (files: PresetFile[]) => void;
}

/** An empty screen that invites the next action instead of just saying "nothing here". */
export function EmptyState({ onLoadPreset }: EmptyStateProps) {
  const { t } = useI18n();
  return (
    <div className="card flex flex-col items-center gap-6 px-5 py-12 text-center">
      <ShieldQuestion className="h-12 w-12 text-label-3" strokeWidth={1.5} aria-hidden="true" />
      <div className="space-y-1.5">
        <h2 className="text-title3 font-semibold text-label">{t.emptyState.title}</h2>
        <p className="mx-auto max-w-md text-subhead text-label-2">{t.emptyState.body}</p>
      </div>
      <ExamplePresets onLoadPreset={onLoadPreset} />
    </div>
  );
}
