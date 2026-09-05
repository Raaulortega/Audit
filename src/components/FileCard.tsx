import { FileCode2, FileJson, FileWarning, X } from 'lucide-react';
import type { FileType } from '../engine/types';

interface FileCardProps {
  filename: string;
  fileType: FileType;
  parseError: string | null;
  findingCount: number;
  onRemove: () => void;
}

const FILE_TYPE_LABELS: Record<FileType, string> = {
  vercelJson: 'vercel.json',
  packageJson: 'package.json',
  dockerfile: 'Dockerfile',
  gitignore: '.gitignore',
  unknown: 'Unrecognized',
};

export function FileCard({ filename, fileType, parseError, findingCount, onRemove }: FileCardProps) {
  const Icon = fileType === 'dockerfile' ? FileCode2 : fileType === 'unknown' ? FileWarning : FileJson;

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-200">{filename}</p>
          <p className="text-xs text-slate-500">{FILE_TYPE_LABELS[fileType]}</p>
          {parseError && <p className="mt-1 text-xs text-red-400">{parseError}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!parseError && (
          <span className="text-xs text-slate-400">
            {findingCount} finding{findingCount === 1 ? '' : 's'}
          </span>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-500 hover:text-red-400"
          aria-label={`Remove ${filename}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
