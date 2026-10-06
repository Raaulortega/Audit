import type { Severity } from '../engine/types';
import { useI18n } from '../i18n/I18nContext';

const STYLES: Record<Severity | 'varies', string> = {
  critical: 'bg-critical-soft text-critical',
  medium: 'bg-medium-soft text-medium',
  low: 'bg-low-soft text-low',
  varies: 'bg-fill text-varies',
};

/** Color plus a word, never color alone. */
export function SeverityBadge({ severity }: { severity: Severity | 'varies' }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-caption2 font-semibold ${STYLES[severity]}`}>
      {t.common.severity[severity]}
    </span>
  );
}

export function ReferenceBadges({ references }: { references: string[] }) {
  return (
    <>
      {references.map((reference) => {
        const cwe = /^CWE-(\d+)$/.exec(reference);
        const className = 'rounded-md bg-fill px-1.5 py-0.5 font-mono text-caption2 text-label-2';
        return cwe ? (
          <a
            key={reference}
            href={`https://cwe.mitre.org/data/definitions/${cwe[1]}.html`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${className} underline-offset-2 hover:text-tint hover:underline`}
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
