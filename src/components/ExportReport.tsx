import { motion } from 'framer-motion';
import { Download, FileJson, FileText, ShieldHalf } from 'lucide-react';
import type { AnalysisResult } from '../engine/types';
import { downloadTextFile, toJsonReport, toMarkdownReport, toSarifReport } from '../engine/report';

interface ExportReportProps {
  result: AnalysisResult;
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
}

export function ExportReport({ result }: ExportReportProps) {
  const exports = [
    {
      label: 'Markdown',
      hint: 'Share in a PR or ticket',
      Icon: FileText,
      onClick: () => downloadTextFile(`security-audit-${timestamp()}.md`, toMarkdownReport(result), 'text/markdown'),
    },
    {
      label: 'JSON',
      hint: 'Feed other tools',
      Icon: FileJson,
      onClick: () => downloadTextFile(`security-audit-${timestamp()}.json`, toJsonReport(result), 'application/json'),
    },
    {
      label: 'SARIF',
      hint: 'Upload to GitHub code scanning',
      Icon: ShieldHalf,
      onClick: () =>
        downloadTextFile(`security-audit-${timestamp()}.sarif`, toSarifReport(result), 'application/sarif+json'),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/3 p-3 backdrop-blur-xs">
      <span className="mr-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Download className="h-3.5 w-3.5 text-emerald-400" />
        Export report
      </span>
      {exports.map(({ label, hint, Icon, onClick }) => (
        <motion.button
          key={label}
          type="button"
          onClick={onClick}
          title={hint}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </motion.button>
      ))}
    </div>
  );
}
