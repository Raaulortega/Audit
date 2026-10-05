import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, History, Save, ScanSearch } from 'lucide-react';
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

function SaveSnapshot() {
  const { saveSnapshot } = useAudit();
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
        placeholder="Label this scan, e.g. “before hardening”"
        aria-label="Snapshot label"
        className="flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
      />
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved' : 'Save to history'}
        </Button>
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:text-emerald-300"
        >
          <History className="h-4 w-4" />
          History
        </Link>
      </div>
    </div>
  );
}

export function ScannerPage() {
  const { fileAnalyses, result, addFile, removeFile, clearFiles } = useAudit();

  const handleLoadPreset = (files: PresetFile[]) => {
    files.forEach((file) => addFile(file.filename, file.content));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={ScanSearch}
        eyebrow="Audit"
        title="Config scanner"
        description="Drop configuration files to get a 0–100 security score, findings mapped to CWE/OWASP, and copy-ready patches. Files are analyzed in memory and never uploaded."
      />

      <FileDropzone onAddFile={addFile} />

      <AnimatePresence mode="wait">
        {fileAnalyses.length === 0 ? (
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
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {fileAnalyses.length} file{fileAnalyses.length === 1 ? '' : 's'} analyzed
                </p>
                <button
                  type="button"
                  onClick={clearFiles}
                  className="text-xs text-slate-500 transition-colors hover:text-red-400"
                >
                  Clear all
                </button>
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
