import { CodeSnippet } from './CodeSnippet';
import type { Finding, Severity } from '../engine/types';

interface FindingsListProps {
  findings: Finding[];
}

const SEVERITY_ORDER: Severity[] = ['critical', 'medium', 'low'];
const SEVERITY_LABELS: Record<Severity, string> = { critical: 'Critical', medium: 'Medium', low: 'Low' };
const SEVERITY_BORDER: Record<Severity, string> = {
  critical: 'border-red-500/40',
  medium: 'border-amber-500/40',
  low: 'border-sky-500/40',
};

export function FindingsList({ findings }: FindingsListProps) {
  if (findings.length === 0) {
    return <p className="text-sm text-slate-500">No findings yet. Add a configuration file to begin.</p>;
  }

  return (
    <div className="space-y-3">
      {SEVERITY_ORDER.flatMap((severity) =>
        findings
          .filter((finding) => finding.severity === severity)
          .map((finding) => (
            <details key={finding.id} className={`rounded-lg border ${SEVERITY_BORDER[severity]} bg-slate-900/60 p-4`}>
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-100">{finding.title}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {SEVERITY_LABELS[severity]} · {finding.sourceFile}
                  </span>
                </div>
              </summary>
              <div className="mt-3 space-y-3">
                <p className="text-sm text-slate-400">{finding.description}</p>
                <CodeSnippet code={finding.fixSnippet} />
              </div>
            </details>
          )),
      )}
    </div>
  );
}
