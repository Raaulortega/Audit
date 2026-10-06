import { Download, FileJson, FileText, ShieldHalf } from 'lucide-react';
import type { AnalysisResult } from '../engine/types';
import { downloadTextFile, toJsonReport, toMarkdownReport, toSarifReport } from '../engine/report';
import { useI18n } from '../i18n/I18nContext';
import { Button } from './PageHeader';

interface ExportReportProps {
  result: AnalysisResult;
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
}

export function ExportReport({ result }: ExportReportProps) {
  const { t } = useI18n();
  const exports = [
    {
      label: 'Markdown',
      hint: t.exportReport.markdownHint,
      Icon: FileText,
      onClick: () => downloadTextFile(`security-audit-${timestamp()}.md`, toMarkdownReport(result), 'text/markdown'),
    },
    {
      label: 'JSON',
      hint: t.exportReport.jsonHint,
      Icon: FileJson,
      onClick: () => downloadTextFile(`security-audit-${timestamp()}.json`, toJsonReport(result), 'application/json'),
    },
    {
      label: 'SARIF',
      hint: t.exportReport.sarifHint,
      Icon: ShieldHalf,
      onClick: () =>
        downloadTextFile(`security-audit-${timestamp()}.sarif`, toSarifReport(result), 'application/sarif+json'),
    },
  ];

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <p className="flex items-center gap-2 text-subhead font-semibold text-label sm:mr-auto">
        <Download className="h-4 w-4 text-label-2" aria-hidden="true" />
        {t.exportReport.title}
      </p>
      <div className="flex flex-wrap gap-2">
        {exports.map(({ label, hint, Icon, onClick }) => (
          <span key={label} title={hint}>
            <Button onClick={onClick}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Button>
          </span>
        ))}
      </div>
    </div>
  );
}
