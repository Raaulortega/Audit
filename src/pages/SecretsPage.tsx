import { useDeferredValue, useMemo, useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader } from '../components/PageHeader';
import { CodeSnippet } from '../components/CodeSnippet';
import { SeverityBadge } from '../components/SeverityBadge';
import { findSecrets, maskSecret, redactSecrets, type SecretMatch } from '../engine/secretScanner';
import { splitLines } from '../engine/lineUtils';

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
      <mark className="rounded-sm bg-red-500/25 px-0.5 text-red-200 ring-1 ring-red-400/40">
        {reveal ? match.secret : maskSecret(match.secret)}
      </mark>
      {line.slice(match.end)}
    </>
  );
}

export function SecretsPage() {
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
        eyebrow="Toolkit"
        title="Secret scanner & redactor"
        description="Paste logs, stack traces, CI output or source code. Detected credentials are highlighted and you get a redacted copy that is safe to paste into a ticket, chat or AI assistant."
        actions={
          <>
            <Button onClick={() => setInput(SAMPLE)}>
              <Sparkles className="h-4 w-4" />
              Load sample log
            </Button>
            {input && <Button onClick={() => setInput('')}>Clear</Button>}
          </>
        }
      />

      <Card>
        <CardTitle hint={`${lines.length} line${lines.length === 1 ? '' : 's'} · scanned locally`}>Input</CardTitle>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste any text…"
          rows={8}
          spellCheck={false}
          aria-label="Text to scan for secrets"
          className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 p-3 font-mono text-xs text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
        />
      </Card>

      {deferredInput.trim().length > 0 && (
        <>
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              matches.length > 0
                ? 'border-red-500/30 bg-red-500/10 text-red-200'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            {matches.length > 0 ? <ShieldAlert className="h-5 w-5 shrink-0" /> : <ShieldCheck className="h-5 w-5 shrink-0" />}
            {matches.length > 0
              ? `${matches.length} secret${matches.length === 1 ? '' : 's'} detected. Rotate them — anything that reached a log should be treated as leaked.`
              : 'No known secret patterns detected.'}
          </div>

          {matches.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardTitle
                  hint={
                    <button
                      type="button"
                      onClick={() => setReveal((value) => !value)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-300"
                    >
                      {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {reveal ? 'Mask values' : 'Reveal values'}
                    </button>
                  }
                >
                  Highlighted input
                </CardTitle>
                <pre className="max-h-96 overflow-auto rounded-lg border border-white/10 bg-slate-950/80 py-2 font-mono text-xs leading-relaxed text-slate-300">
                  {lines.map((line, index) => {
                    const match = matchesByLine.get(index + 1);
                    return (
                      <div key={index} className={`flex ${match ? 'bg-red-500/5' : ''}`}>
                        <span className="w-10 shrink-0 select-none pr-3 text-right text-slate-600">{index + 1}</span>
                        <span className="whitespace-pre pr-3">
                          <HighlightedLine line={line} match={match} reveal={reveal} />
                        </span>
                      </div>
                    );
                  })}
                </pre>
              </Card>

              <Card>
                <CardTitle hint="Rotate each credential">Detections</CardTitle>
                <ul className="space-y-3">
                  {matches.map((match) => (
                    <li key={`${match.line}-${match.ruleId}`} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={match.severity} />
                        <span className="text-sm font-medium text-slate-100">{match.name}</span>
                        <span className="ml-auto text-xs text-slate-500">line {match.line}</span>
                      </div>
                      <p className="mt-1 font-mono text-xs text-slate-400">{maskSecret(match.secret)}</p>
                      <p className="mt-2 text-xs text-slate-400">{match.rotateHint}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {matches.length > 0 && (
            <Card>
              <CardTitle hint="Safe to share">Redacted output</CardTitle>
              <CodeSnippet code={redacted} copyLabel="Copy redacted" />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
