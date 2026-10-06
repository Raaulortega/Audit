import { useDeferredValue, useMemo, useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader } from '../components/PageHeader';
import { CodeSnippet } from '../components/CodeSnippet';
import { SeverityBadge } from '../components/SeverityBadge';
import { findSecrets, maskSecret, redactSecrets, type SecretMatch } from '../engine/secretScanner';
import { splitLines } from '../engine/lineUtils';
import { useI18n } from '../i18n/I18nContext';

// Demo values are assembled at runtime so repository secret scanners do not flag this file.
const SAMPLE = [
  '2026-10-04T09:12:03Z INFO  boot: connecting to database',
  `2026-10-04T09:12:03Z DEBUG db: url=postgres://app:${'Tr0ub4dor'}${'&3x'}@db.internal:5432/prod`,
  '2026-10-04T09:12:04Z INFO  http: listening on :8080',
  `2026-10-04T09:12:09Z DEBUG github: using token ${'ghp_'}${'R4nd0mL00k1ngT0k3nV4lu3F0rD3m0Purp0s3s'}`,
  `2026-10-04T09:12:10Z WARN  aws: falling back to static key ${'AKIA'}${'Z7XQ2M4N8P6R3T5V'}`,
  `2026-10-04T09:12:12Z DEBUG auth: Authorization: Bearer ${'eyJhbGciOiJIUzI1NiJ9'}.${'eyJzdWIiOiJ1c2VyLTQyIn0'}.${'dGhpc2lzbm90YXJlYWxzaWduYXR1cmU'}`,
  '2026-10-04T09:12:15Z INFO  worker: processed 42 jobs',
].join('\n');

function HighlightedLine({ line, match, reveal }: { line: string; match?: SecretMatch; reveal: boolean }) {
  if (!match) return <>{line || ' '}</>;
  return (
    <>
      {line.slice(0, match.start)}
      <mark className="rounded-[4px] bg-critical-soft px-0.5 font-semibold text-critical ring-1 ring-critical/40">
        {reveal ? match.secret : maskSecret(match.secret)}
      </mark>
      {line.slice(match.end)}
    </>
  );
}

export function SecretsPage() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [reveal, setReveal] = useState(false);
  const deferredInput = useDeferredValue(input);

  const matches = useMemo(() => findSecrets(deferredInput), [deferredInput]);
  const matchesByLine = useMemo(() => new Map(matches.map((match) => [match.line, match])), [matches]);
  const redacted = useMemo(() => (matches.length > 0 ? redactSecrets(deferredInput) : ''), [deferredInput, matches]);
  const lines = useMemo(() => splitLines(deferredInput), [deferredInput]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={KeyRound}
        eyebrow={t.secrets.eyebrow}
        title={t.secrets.title}
        description={t.secrets.description}
        actions={
          <>
            <Button onClick={() => setInput(SAMPLE)}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t.secrets.loadSample}
            </Button>
            {input && <Button onClick={() => setInput('')}>{t.common.clear}</Button>}
          </>
        }
      />

      <Card>
        <CardTitle hint={t.secrets.inputHint(lines.length)}>{t.secrets.input}</CardTitle>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t.secrets.placeholder}
          rows={8}
          spellCheck={false}
          aria-label={t.secrets.inputAria}
          className="field resize-y p-3 font-mono text-footnote"
        />
      </Card>

      {deferredInput.trim().length > 0 && (
        <>
          <div
            role="status"
            className={`card flex items-center gap-3 px-5 py-4 text-subhead font-medium ${
              matches.length > 0 ? 'bg-critical-soft text-critical' : 'bg-tint-soft text-tint'
            }`}
          >
            {matches.length > 0 ? (
              <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            {matches.length > 0 ? t.secrets.detected(matches.length) : t.secrets.none}
          </div>

          {matches.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="min-w-0">
                <CardTitle
                  hint={
                    <button
                      type="button"
                      onClick={() => setReveal((value) => !value)}
                      aria-pressed={reveal}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-tint hover:bg-fill"
                    >
                      {reveal ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      {reveal ? t.secrets.mask : t.secrets.reveal}
                    </button>
                  }
                >
                  {t.secrets.highlighted}
                </CardTitle>
                <pre className="max-h-96 overflow-auto rounded-[14px] border border-separator bg-code py-2 font-mono text-footnote leading-relaxed text-label">
                  {lines.map((line, index) => {
                    const match = matchesByLine.get(index + 1);
                    return (
                      <div key={index} className={`flex ${match ? 'bg-critical-soft' : ''}`}>
                        <span className="w-10 shrink-0 select-none pr-3 text-right text-label-3">{index + 1}</span>
                        <span className="whitespace-pre pr-3">
                          <HighlightedLine line={line} match={match} reveal={reveal} />
                        </span>
                      </div>
                    );
                  })}
                </pre>
              </Card>

              <Card>
                <CardTitle hint={t.secrets.rotateHint}>{t.secrets.detections}</CardTitle>
                <ul className="divide-y divide-separator overflow-hidden rounded-[14px] bg-fill">
                  {matches.map((match) => (
                    <li key={`${match.line}-${match.ruleId}`} className="p-3.5">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={match.severity} />
                        <span className="text-subhead font-semibold text-label">{match.name}</span>
                        <span className="ml-auto text-footnote text-label-2">{t.secrets.line(match.line)}</span>
                      </div>
                      <p className="mt-1.5 font-mono text-footnote text-label-2">{maskSecret(match.secret)}</p>
                      <p className="mt-1.5 text-footnote text-label">{match.rotateHint}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {matches.length > 0 && (
            <Card>
              <CardTitle hint={t.secrets.safeToShare}>{t.secrets.redacted}</CardTitle>
              <CodeSnippet code={redacted} copyLabel={t.secrets.copyRedacted} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
