import { useCallback, useState, type DragEvent } from 'react';
import { AlertTriangle, FileUp } from 'lucide-react';
import { MAX_FILE_BYTES } from '../engine/storedFiles';
import { useI18n } from '../i18n/I18nContext';
import { Button, buttonClass } from './PageHeader';

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
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`card flex flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging ? 'border-tint bg-tint-soft' : 'border-separator'
        }`}
      >
        <span
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
            isDragging ? 'bg-tint text-on-tint' : 'bg-tint-soft text-tint'
          }`}
        >
          <FileUp className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-headline font-semibold text-label">{t.dropzone.dropHint}</p>
        <p className="mt-1 max-w-sm text-footnote text-label-2">{t.dropzone.otherFiles}</p>
        <label className={`${buttonClass('secondary')} mt-5 cursor-pointer focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-tint/70`}>
          {t.dropzone.browse}
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) readFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      <div className="card flex flex-col p-5">
        <label htmlFor="paste-config" className="mb-2 text-headline font-semibold text-label">
          {t.dropzone.pasteTitle}
        </label>
        <textarea
          id="paste-config"
          value={pastedContent}
          onChange={(event) => setPastedContent(event.target.value)}
          placeholder={t.dropzone.pastePlaceholder}
          rows={5}
          spellCheck={false}
          className="field min-h-32 flex-1 resize-y p-3 font-mono text-footnote"
        />
        <div className="mt-3 flex justify-end">
          <Button variant="primary" onClick={handlePasteSubmit} disabled={pastedContent.trim().length === 0}>
            {t.dropzone.analyzePasted}
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="card space-y-1 bg-medium-soft px-4 py-3 text-footnote text-label lg:col-span-2">
          {errors.map((error) => (
            <li key={error} className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-medium" aria-hidden="true" />
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
