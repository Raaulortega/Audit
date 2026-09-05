import { ShieldCheck } from 'lucide-react';
import { FileDropzone } from './components/FileDropzone';
import { FileCard } from './components/FileCard';
import { ScoreGauge } from './components/ScoreGauge';
import { SeverityBreakdown } from './components/SeverityBreakdown';
import { FindingsList } from './components/FindingsList';
import { useAnalysis } from './hooks/useAnalysis';

export function App() {
  const { fileAnalyses, result, addFile, removeFile } = useAnalysis();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold">Config Security Audit</h1>
            <p className="text-sm text-slate-400">
              Static security analysis for vercel.json, package.json, Dockerfile, and .gitignore.
            </p>
          </div>
        </header>

        <FileDropzone onAddFile={addFile} />

        {fileAnalyses.length > 0 && (
          <div className="space-y-2">
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
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto,1fr]">
          <div className="flex justify-center md:justify-start">
            <ScoreGauge score={result.score} />
          </div>
          <SeverityBreakdown counts={result.counts} />
        </div>

        <FindingsList findings={result.findings} />
      </div>
    </div>
  );
}
