import { useCallback, useState, type DragEvent } from 'react';
import { FilePlus2, UploadCloud } from 'lucide-react';

interface FileDropzoneProps {
  onAddFile: (filename: string, content: string) => void;
}

export function FileDropzone({ onAddFile }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pastedContent, setPastedContent] = useState('');

  const readFiles = useCallback(
    (fileList: FileList) => {
      Array.from(fileList).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => onAddFile(file.name, String(reader.result ?? ''));
        reader.readAsText(file);
      });
    },
    [onAddFile],
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
    onAddFile('pasted-content', pastedContent);
    setPastedContent('');
  }, [pastedContent, onAddFile]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
          isDragging ? 'border-emerald-400 bg-emerald-950/20' : 'border-slate-700 bg-slate-900/40'
        }`}
      >
        <UploadCloud className="mb-3 h-10 w-10 text-slate-400" />
        <p className="text-sm text-slate-300">Drag & drop vercel.json, package.json, Dockerfile, or .gitignore</p>
        <label className="mt-3 cursor-pointer text-sm text-emerald-400 hover:text-emerald-300">
          or browse files
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
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
          <FilePlus2 className="h-4 w-4" />
          Or paste file content
        </div>
        <textarea
          value={pastedContent}
          onChange={(event) => setPastedContent(event.target.value)}
          placeholder="Paste the raw file content here..."
          rows={4}
          className="w-full resize-y rounded border border-slate-700 bg-slate-950 p-2 font-mono text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handlePasteSubmit}
          className="mt-2 rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Analyze pasted content
        </button>
      </div>
    </div>
  );
}
