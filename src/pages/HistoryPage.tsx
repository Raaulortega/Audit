import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, History, Minus, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader } from '../components/PageHeader';
import { SeverityBadge } from '../components/SeverityBadge';
import { useAudit } from '../context/AuditContext';
import { compareScans } from '../engine/history';
import type { Finding } from '../engine/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DiffList({
  title,
  findings,
  tone,
  Icon,
}: {
  title: string;
  findings: Finding[];
  tone: string;
  Icon: typeof Plus;
}) {
  return (
    <div>
      <p className={`mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
        {title} ({findings.length})
      </p>
      {findings.length === 0 ? (
        <p className="text-xs text-slate-600">None</p>
      ) : (
        <ul className="space-y-1.5">
          {findings.map((finding) => (
            <li key={finding.id} className="flex items-center gap-2 text-xs text-slate-300">
              <SeverityBadge severity={finding.severity} />
              <span className="truncate">{finding.title}</span>
              <span className="ml-auto shrink-0 text-slate-600">{finding.sourceFile}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HistoryPage() {
  const { history, deleteSnapshot, clearHistory } = useAudit();
  const [selected, setSelected] = useState<[string, string] | null>(null);

  const comparison = useMemo(() => {
    if (!selected) return null;
    const before = history.find((snapshot) => snapshot.id === selected[0]);
    const after = history.find((snapshot) => snapshot.id === selected[1]);
    if (!before || !after) return null;
    return { before, after, diff: compareScans(before, after) };
  }, [selected, history]);

  const toggle = (id: string) => {
    setSelected((current) => {
      if (!current) return [id, id];
      if (current.includes(id)) return current[0] === id && current[1] === id ? null : [id, id];
      return [current[1], id];
    });
  };

  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader icon={History} eyebrow="Audit" title="Scan history" description="Saved scans show up here." />
        <Card>
          <p className="py-10 text-center text-sm text-slate-500">
            No saved scans yet. Run a scan and press <span className="text-slate-300">Save to history</span>, then come
            back to track your score over time.
            <br />
            <Link to="/scanner" className="mt-3 inline-block text-emerald-400 hover:text-emerald-300">
              Go to the scanner →
            </Link>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={History}
        eyebrow="Audit"
        title="Scan history"
        description="Select two saved scans to see which findings were fixed and which were introduced. Stored only in this browser."
        actions={
          <Button variant="danger" onClick={clearHistory}>
            <Trash2 className="h-4 w-4" />
            Clear all
          </Button>
        }
      />

      <Card className="p-0">
        <ul className="divide-y divide-white/5">
          {history.map((snapshot) => {
            const picked = selected?.includes(snapshot.id);
            return (
              <li key={snapshot.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={Boolean(picked)}
                  onChange={() => toggle(snapshot.id)}
                  aria-label={`Select ${snapshot.label}`}
                  className="h-4 w-4 shrink-0 accent-emerald-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{snapshot.label}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(snapshot.savedAt)} · {snapshot.fileNames.length} file
                    {snapshot.fileNames.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="flex gap-1 text-xs">
                    <span className="text-red-400">{snapshot.counts.critical}</span>
                    <span className="text-amber-400">{snapshot.counts.medium}</span>
                    <span className="text-sky-400">{snapshot.counts.low}</span>
                  </span>
                  <span className="w-10 text-right text-sm font-bold tabular-nums text-slate-200">{snapshot.score}</span>
                  <button
                    type="button"
                    onClick={() => deleteSnapshot(snapshot.id)}
                    aria-label={`Delete ${snapshot.label}`}
                    className="text-slate-600 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {comparison && comparison.before.id !== comparison.after.id && (
        <Card>
          <CardTitle
            hint={
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  comparison.diff.scoreDelta >= 0 ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {comparison.diff.scoreDelta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {comparison.diff.scoreDelta >= 0 ? '+' : ''}
                {comparison.diff.scoreDelta} pts
              </span>
            }
          >
            Comparison
          </CardTitle>
          <p className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-md bg-white/5 px-2 py-1">
              {comparison.before.label} · {comparison.before.score}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="rounded-md bg-white/5 px-2 py-1">
              {comparison.after.label} · {comparison.after.score}
            </span>
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            <DiffList title="Fixed" findings={comparison.diff.fixed} tone="text-emerald-300" Icon={Minus} />
            <DiffList title="Introduced" findings={comparison.diff.introduced} tone="text-red-300" Icon={Plus} />
            <DiffList title="Still open" findings={comparison.diff.unchanged} tone="text-slate-400" Icon={ArrowRight} />
          </div>
        </Card>
      )}
    </div>
  );
}
