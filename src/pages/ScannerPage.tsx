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
import { Button, PageHeader, SectionHeader, buttonClass } from '../components/PageHeader';
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
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && handleSave()}
        placeholder={t.scanner.labelPlaceholder}
        aria-label={t.scanner.labelAria}
        maxLength={80}
        className="field h-11 flex-1 px-3 text-callout lg:h-9 lg:text-subhead"
      />
      <div className="flex gap-2">
        <Button onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          <span aria-live="polite">{saved ? t.scanner.saved : t.scanner.saveCheckpoint}</span>
        </Button>
        <Link to={to('/history')} className={buttonClass('secondary')}>
          <History className="h-4 w-4" aria-hidden="true" />
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
          <div key="loading" className="flex justify-center py-14 text-label-2">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <ScoreGauge score={result.score} />
              <SeverityBreakdown counts={result.counts} />
            </div>

            <section>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 pr-1">
                <SectionHeader>{t.scanner.filesAnalyzed(fileAnalyses.length)}</SectionHeader>
                <div className="mb-2 flex items-center gap-1">
                  {storageFull ? (
                    <span className="flex items-center gap-1.5 text-footnote text-medium">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      {t.scanner.storageFull}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-footnote text-label-2">
                      <DatabaseBackup className="h-3.5 w-3.5" aria-hidden="true" />
                      {t.scanner.autoSaved}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearFiles}
                    className="min-h-11 rounded-full px-3 text-footnote font-semibold text-critical transition-colors hover:bg-critical-soft lg:min-h-8"
                  >
                    {t.common.clearAll}
                  </button>
                </div>
              </div>
              <ul className="card divide-y divide-separator overflow-hidden">
                <AnimatePresence initial={false}>
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
              </ul>
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
              <SaveSnapshot />
              <ExportReport result={result} />
            </div>
            <FindingsList findings={result.findings} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
