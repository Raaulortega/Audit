import { useCallback, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FilePlus2, UploadCloud } from 'lucide-react';
import { MAX_FILE_BYTES } from '../engine/storedFiles';
import { useI18n } from '../i18n/I18nContext';

interface FileDropzoneProps {
  onAddFile: (filename: string, content: string) => void;
}

const MAX_MB = MAX_FILE_BYTES / (1024 * 1024);

export function FileDropzone({ onAddFile }: FileDropzoneProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const readFiles = useCallback(
    (fileList: FileList) => {
      const rejected: string[] = [];
      Array.from(fileList).forEach((file) => {
        // Checked before reading: a huge file would freeze the tab in the regex engine.
        if (file.size > MAX_FILE_BYTES) {
          rejected.push(t.dropzone.tooLarge(file.name, MAX_MB));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => onAddFile(file.name, String(reader.result ?? ''));
        reader.onerror = () => setErrors((previous) => [...previous, t.dropzone.unreadable(file.name)]);
        reader.readAsText(file);
      });
      setErrors(rejected);
    },
    [onAddFile, t],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files.length > 0) readFiles(event.dataTransfer.files);
    },
    [readFiles],
  );

  const handlePasteSubmit = useCallback(() => {
    if (pastedContent.trim().length === 0) return;
    if (pastedContent.length > MAX_FILE_BYTES) {
      setErrors([t.dropzone.tooLarge('pasted-content', MAX_MB)]);
      return;
    }
    setErrors([]);
    onAddFile('pasted-content', pastedContent);
    setPastedContent('');
  }, [pastedContent, onAddFile, t]);

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ scale: isDragging ? 1.015 : 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 backdrop-blur-xs transition-colors ${
          isDragging
            ? 'border-emerald-400/70 bg-emerald-400/10 shadow-[0_0_32px_rgba(52,211,153,0.25)]'
            : 'border-white/10 bg-white/3 hover:border-white/20'
        }`}
      >
        <motion.div animate={isDragging ? { y: [0, -6, 0] } : { y: 0 }} transition={{ duration: 0.8, repeat: isDragging ? Infinity : 0 }}>
          <UploadCloud className={`mb-3 h-10 w-10 ${isDragging ? 'text-emerald-400' : 'text-slate-400'}`} />
        </motion.div>
        <p className="text-center text-sm text-slate-300">{t.dropzone.dropHint}</p>
        <p className="mt-1 text-center text-xs text-slate-500">{t.dropzone.otherFiles}</p>
        <label className="mt-3 cursor-pointer text-sm text-emerald-400 transition-colors hover:text-emerald-300">
          {t.dropzone.browse}
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) readFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
      </motion.div>

      {errors.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          {errors.map((error) => (
            <li key={error} className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-white/10 bg-white/3 p-4 backdrop-blur-xs">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
          <FilePlus2 className="h-4 w-4" />
          {t.dropzone.pasteTitle}
        </div>
        <textarea
          value={pastedContent}
          onChange={(event) => setPastedContent(event.target.value)}
          placeholder={t.dropzone.pastePlaceholder}
          rows={4}
          className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 p-2 font-mono text-xs text-slate-200 transition-colors focus:border-emerald-400/60 focus:outline-hidden"
        />
        <motion.button
          type="button"
          onClick={handlePasteSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.35)] transition-colors hover:bg-emerald-400"
        >
          {t.dropzone.analyzePasted}
        </motion.button>
      </div>
    </div>
  );
}
