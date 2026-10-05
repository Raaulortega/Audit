import type { Severity } from '../engine/types';
import { useI18n } from '../i18n/I18nContext';

const STYLES: Record<Severity | 'varies', string> = {
  critical: 'border-red-400/40 bg-red-400/10 text-red-300',
  medium: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  low: 'border-sky-400/40 bg-sky-400/10 text-sky-300',
  varies: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
};

export function SeverityBadge({ severity }: { severity: Severity | 'varies' }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[severity]}`}
    >
      {t.common.severity[severity]}
    </span>
  );
}

export function ReferenceBadges({ references }: { references: string[] }) {
  return (
    <>
      {references.map((reference) => {
        const cwe = /^CWE-(\d+)$/.exec(reference);
        const className =
          'rounded-md border border-emerald-400/20 bg-emerald-400/5 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300/90';
        return cwe ? (
          <a
            key={reference}
            href={`https://cwe.mitre.org/data/definitions/${cwe[1]}.html`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${className} hover:border-emerald-400/50`}
          >
            {reference}
          </a>
        ) : (
          <span key={reference} className={className}>
            {reference}
          </span>
        );
      })}
    </>
  );
}
