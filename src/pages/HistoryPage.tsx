import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, History, Minus, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader, buttonClass } from '../components/PageHeader';
import { FindingRows } from '../components/FindingsList';
import { useAudit } from '../context/AuditContext';
import { compareScans, type ScanSnapshot } from '../engine/history';
import type { Finding, Severity } from '../engine/types';
import { useI18n } from '../i18n/I18nContext';

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, medium: 1, low: 2 };
const bySeverity = (findings: Finding[]) => [...findings].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

function DiffSection({
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
    <section>
      <h3 className={`mb-2 flex items-center gap-1.5 px-1 text-footnote font-semibold ${tone}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {title} ({findings.length})
      </h3>
      {findings.length === 0 ? (
        <p className="rounded-[14px] bg-fill px-4 py-3 text-footnote text-label-2">{t.common.none}</p>
      ) : (
        <FindingRows findings={bySeverity(findings)} className="rounded-[14px] bg-fill" />
      )}
    </section>
  );
}

export function HistoryPage() {
  const { history, activeSnapshotId, deleteSnapshot, clearHistory } = useAudit();
  const { t, to } = useI18n();
  const [selected, setSelected] = useState<[string, string] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center">
          <History className="h-12 w-12 text-label-3" strokeWidth={1.5} aria-hidden="true" />
          <p className="max-w-sm text-subhead text-label-2">{t.history.emptyBody}</p>
          <Link to={to('/scanner')} className={buttonClass('primary')}>
            {t.history.goToScanner}
          </Link>
        </div>
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
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t.common.clearAll}
          </Button>
        }
      />

      <ul className="card divide-y divide-separator overflow-hidden">
        {history.map((snapshot) => {
          const picked = selected?.includes(snapshot.id);
          const expanded = expandedId === snapshot.id;
          const label = labelOf(snapshot);
          const panelId = `snapshot-${snapshot.id}`;
          return (
            <li key={snapshot.id} className={picked ? 'bg-tint-soft' : ''}>
              <div className="flex min-h-16 items-center gap-1 py-1.5 pl-4 pr-1.5">
                <input
                  type="checkbox"
                  checked={Boolean(picked)}
                  onChange={() => toggle(snapshot.id)}
                  aria-label={t.history.select(label)}
                  className="mr-2 h-5 w-5 shrink-0 cursor-pointer accent-tint"
                />
                {/* The whole row opens the scan, so its findings can be read and fixed again. */}
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : snapshot.id)}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  aria-label={t.history.showFindings(label)}
                  className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-[12px] px-2 text-left transition-colors hover:bg-fill/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-subhead font-medium text-label">
                      <span className="truncate">{label}</span>
                      {snapshot.id === activeSnapshotId && (
                        <span className="shrink-0 rounded-full bg-tint-soft px-2 py-0.5 text-caption2 font-semibold text-tint">
                          {t.history.live}
                        </span>
                      )}
                    </span>
                    <span className="block text-footnote text-label-2">
                      {formatDate(snapshot.savedAt)} · {t.history.files(snapshot.fileNames.length)}
                    </span>
                  </span>
                  <span className="hidden shrink-0 gap-2 text-footnote font-semibold tabular-nums sm:flex" aria-hidden="true">
                    <span className="text-critical">{snapshot.counts.critical}</span>
                    <span className="text-medium">{snapshot.counts.medium}</span>
                    <span className="text-low">{snapshot.counts.low}</span>
                  </span>
                  <span className="w-9 shrink-0 text-right font-rounded text-title3 font-semibold tabular-nums text-label">
                    {snapshot.score}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-label-3 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => deleteSnapshot(snapshot.id)}
                  aria-label={t.history.delete(label)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-label-3 transition-colors hover:bg-critical-soft hover:text-critical lg:h-9 lg:w-9"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    id={panelId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                      {snapshot.findings.length === 0 ? (
                        <p className="rounded-[14px] bg-fill px-4 py-3 text-footnote text-label-2">{t.history.noFindings}</p>
                      ) : (
                        <FindingRows findings={bySeverity(snapshot.findings)} className="rounded-[14px] bg-fill" />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      {comparison && comparison.before.id !== comparison.after.id && (
        <Card>
          <CardTitle
            hint={
              <span
                className={`inline-flex items-center gap-1 text-subhead font-semibold ${
                  comparison.diff.scoreDelta >= 0 ? 'text-tint' : 'text-critical'
                }`}
              >
                {comparison.diff.scoreDelta >= 0 ? (
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-4 w-4" aria-hidden="true" />
                )}
                {comparison.diff.scoreDelta >= 0 ? '+' : ''}
                {comparison.diff.scoreDelta} {t.history.points}
              </span>
            }
          >
            {t.history.comparison}
          </CardTitle>
          <p className="mb-5 flex flex-wrap items-center gap-2 text-footnote text-label">
            <span className="rounded-full bg-fill px-3 py-1">
              {labelOf(comparison.before)} · {comparison.before.score}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-label-2" aria-hidden="true" />
            <span className="rounded-full bg-fill px-3 py-1">
              {labelOf(comparison.after)} · {comparison.after.score}
            </span>
          </p>
          <div className="space-y-5">
            <DiffSection title={t.history.introduced} findings={comparison.diff.introduced} tone="text-critical" Icon={Plus} />
            <DiffSection title={t.history.fixed} findings={comparison.diff.fixed} tone="text-tint" Icon={Minus} />
            <DiffSection title={t.history.stillOpen} findings={comparison.diff.unchanged} tone="text-label-2" Icon={ArrowRight} />
          </div>
        </Card>
      )}
    </div>
  );
}
