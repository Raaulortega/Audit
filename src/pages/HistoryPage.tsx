import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, History, Minus, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader } from '../components/PageHeader';
import { SeverityBadge } from '../components/SeverityBadge';
import { useAudit } from '../context/AuditContext';
import { compareScans, type ScanSnapshot } from '../engine/history';
import type { Finding } from '../engine/types';
import { useI18n } from '../i18n/I18nContext';

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
  const { t } = useI18n();
  return (
    <div>
      <p className={`mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
        {title} ({findings.length})
      </p>
      {findings.length === 0 ? (
        <p className="text-xs text-slate-600">{t.common.none}</p>
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
  const { history, activeSnapshotId, deleteSnapshot, clearHistory } = useAudit();
  const { t, to } = useI18n();
  const [selected, setSelected] = useState<[string, string] | null>(null);

  const labelOf = (snapshot: ScanSnapshot) => snapshot.label || t.history.autoLabel(snapshot.fileNames);
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(t.meta.dateLocale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

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
        <PageHeader
          icon={History}
          eyebrow={t.history.eyebrow}
          title={t.history.title}
          description={t.history.emptyDescription}
        />
        <Card>
          <p className="py-10 text-center text-sm text-slate-500">
            {t.history.emptyBody}
            <br />
            <Link to={to('/scanner')} className="mt-3 inline-block text-emerald-400 hover:text-emerald-300">
              {t.history.goToScanner}
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
        eyebrow={t.history.eyebrow}
        title={t.history.title}
        description={t.history.description}
        actions={
          <Button variant="danger" onClick={clearHistory}>
            <Trash2 className="h-4 w-4" />
            {t.common.clearAll}
          </Button>
        }
      />

      <Card className="p-0">
        <ul className="divide-y divide-white/5">
          {history.map((snapshot) => {
            const picked = selected?.includes(snapshot.id);
            const label = labelOf(snapshot);
            return (
              <li key={snapshot.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={Boolean(picked)}
                  onChange={() => toggle(snapshot.id)}
                  aria-label={t.history.select(label)}
                  className="h-4 w-4 shrink-0 accent-emerald-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
                    <span className="truncate">{label}</span>
                    {snapshot.id === activeSnapshotId && (
                      <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                        {t.history.live}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(snapshot.savedAt)} · {t.history.files(snapshot.fileNames.length)}
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
                    aria-label={t.history.delete(label)}
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
                {comparison.diff.scoreDelta} {t.history.points}
              </span>
            }
          >
            {t.history.comparison}
          </CardTitle>
          <p className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-md bg-white/5 px-2 py-1">
              {labelOf(comparison.before)} · {comparison.before.score}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="rounded-md bg-white/5 px-2 py-1">
              {labelOf(comparison.after)} · {comparison.after.score}
            </span>
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            <DiffList title={t.history.fixed} findings={comparison.diff.fixed} tone="text-emerald-300" Icon={Minus} />
            <DiffList title={t.history.introduced} findings={comparison.diff.introduced} tone="text-red-300" Icon={Plus} />
            <DiffList title={t.history.stillOpen} findings={comparison.diff.unchanged} tone="text-slate-400" Icon={ArrowRight} />
          </div>
        </Card>
      )}
    </div>
  );
}
