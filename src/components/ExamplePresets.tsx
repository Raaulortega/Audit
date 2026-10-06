import { EXAMPLE_PRESETS, type PresetFile } from '../data/examplePresets';
import { useI18n } from '../i18n/I18nContext';

interface ExamplePresetsProps {
  onLoadPreset: (files: PresetFile[]) => void;
}

export function ExamplePresets({ onLoadPreset }: ExamplePresetsProps) {
  const { t } = useI18n();
  return (
    <div className="w-full max-w-3xl space-y-3">
      <p className="text-footnote font-semibold text-label-2">{t.emptyState.tryExample}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onLoadPreset(preset.files)}
            className="min-h-14 rounded-[14px] bg-fill px-4 py-2.5 text-left transition-colors hover:bg-fill-strong"
          >
            <span className="block truncate font-mono text-subhead font-semibold text-label">
              {t.emptyState.presets[preset.id]?.label ?? preset.label}
            </span>
            <span className="block truncate text-footnote text-label-2">
              {t.emptyState.presets[preset.id]?.description ?? preset.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
