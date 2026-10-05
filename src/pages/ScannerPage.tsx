import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, DatabaseBackup, History, Loader2, Save, ScanSearch } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { FileCard } from '../components/FileCard';
import { ScoreGauge } from '../components/ScoreGauge';
import { SeverityBreakdown } from '../components/SeverityBreakdown';
import { FindingsList } from '../components/FindingsList';
import { EmptyState } from '../components/EmptyState';
import { ExportReport } from '../components/ExportReport';
import { Button, PageHeader } from '../components/PageHeader';
import { useAudit } from '../context/AuditContext';
import type { PresetFile } from '../data/examplePresets';
import { useI18n } from '../i18n/I18nContext';

function SaveSnapshot() {
  const { saveSnapshot } = useAudit();
  const { t, to } = useI18n();
  const [label, setLabel] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!saveSnapshot(label)) return;
    setLabel('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/3 p-3 backdrop-blur-xs sm:flex-row sm:items-center">
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && handleSave()}
        placeholder={t.scanner.labelPlaceholder}
        aria-label={t.scanner.labelAria}
        maxLength={80}
        className="flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
      />
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? t.scanner.saved : t.scanner.saveCheckpoint}
        </Button>
        <Link
          to={to('/history')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:text-emerald-300"
        >
          <History className="h-4 w-4" />
          {t.scanner.history}
        </Link>
      </div>
    </div>
  );
}

export function ScannerPage() {
  const { fileAnalyses, result, hydrated, storageFull, addFile, removeFile, clearFiles } = useAudit();
  const { t } = useI18n();

  const handleLoadPreset = (files: PresetFile[]) => {
    files.forEach((file) => addFile(file.filename, file.content));
  };

  return (
    <div className="space-y-8">
      <PageHeader icon={ScanSearch} eyebrow={t.scanner.eyebrow} title={t.scanner.title} description={t.scanner.description} />

      <FileDropzone onAddFile={addFile} />

      <AnimatePresence mode="wait">
        {!hydrated ? (
          <div key="loading" className="flex justify-center py-14 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-label={t.layout.loadingPage} />
          </div>
        ) : fileAnalyses.length === 0 ? (
          <EmptyState key="empty-state" onLoadPreset={handleLoadPreset} />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <motion.div layout className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t.scanner.filesAnalyzed(fileAnalyses.length)}
                </p>
                <div className="flex items-center gap-4">
                  {storageFull ? (
                    <span className="flex items-center gap-1.5 text-xs text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {t.scanner.storageFull}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400/80">
                      <DatabaseBackup className="h-3.5 w-3.5" />
                      {t.scanner.autoSaved}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearFiles}
                    className="text-xs text-slate-500 transition-colors hover:text-red-400"
                  >
                    {t.common.clearAll}
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {fileAnalyses.map(({ file, findings, parseError }) => (
                  <FileCard
                    key={file.id}
                    filename={file.filename}
                    fileType={file.fileType}
                    parseError={parseError}
                    findingCount={findings.length}
                    onRemove={() => removeFile(file.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
              <div className="flex justify-center md:justify-start">
                <ScoreGauge score={result.score} />
              </div>
              <SeverityBreakdown counts={result.counts} />
            </div>

            <SaveSnapshot />
            <ExportReport result={result} />
            <FindingsList findings={result.findings} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
