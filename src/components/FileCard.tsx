import { motion } from 'framer-motion';
import { AlertTriangle, Boxes, FileCode2, FileJson, FileWarning, KeyRound, Server, X, type LucideIcon } from 'lucide-react';
import type { FileType } from '../engine/types';
import { useI18n } from '../i18n/I18nContext';

interface FileCardProps {
  filename: string;
  fileType: FileType;
  parseError: string | null;
  findingCount: number;
  onRemove: () => void;
}

const FILE_TYPE_LABELS: Record<Exclude<FileType, 'unknown'>, string> = {
  vercelJson: 'vercel.json',
  packageJson: 'package.json',
  dockerfile: 'Dockerfile',
  gitignore: '.gitignore',
  envFile: '.env',
  dockerCompose: 'docker-compose.yml',
  nginxConf: 'nginx.conf',
};

const FILE_TYPE_ICONS: Record<FileType, LucideIcon> = {
  vercelJson: FileJson,
  packageJson: FileJson,
  dockerfile: FileCode2,
  gitignore: FileCode2,
  envFile: KeyRound,
  dockerCompose: Boxes,
  nginxConf: Server,
  unknown: FileWarning,
};

/** One row of the inset grouped "files" list. */
export function FileCard({ filename, fileType, parseError, findingCount, onRemove }: FileCardProps) {
  const { t } = useI18n();
  const Icon = FILE_TYPE_ICONS[fileType];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="flex min-h-14 items-center gap-3 py-2 pl-4 pr-1.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-fill text-label-2">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-subhead font-medium text-label">{filename}</p>
          <p className="truncate text-footnote text-label-2">
            {fileType === 'unknown' ? t.fileCard.genericType : FILE_TYPE_LABELS[fileType]}
            {parseError && (
              <span className="ml-1.5 inline-flex items-center gap-1 text-critical">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                {t.fileCard.parseError}
              </span>
            )}
          </p>
        </div>
        <span className="shrink-0 text-footnote tabular-nums text-label-2">{t.fileCard.findings(findingCount)}</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-label-3 transition-colors hover:bg-fill hover:text-critical lg:h-9 lg:w-9"
          aria-label={t.fileCard.remove(filename)}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.li>
  );
}
