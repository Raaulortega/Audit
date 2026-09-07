import { motion } from 'framer-motion';
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
    <motion.div
      layout
      initial={{ opacity: 0, x: -12, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex items-center justify-between rounded-lg border bg-white/[0.03] px-4 py-3 backdrop-blur-sm ${
        parseError ? 'border-red-500/40' : 'border-white/10'
      }`}
    >
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
        <motion.button
          type="button"
          onClick={onRemove}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="text-slate-500 hover:text-red-400"
          aria-label={`Remove ${filename}`}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
