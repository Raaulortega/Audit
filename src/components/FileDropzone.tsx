import { useCallback, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ scale: isDragging ? 1.015 : 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 backdrop-blur-sm transition-colors ${
          isDragging
            ? 'border-emerald-400/70 bg-emerald-400/10 shadow-[0_0_32px_rgba(52,211,153,0.25)]'
            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
        }`}
      >
        <motion.div animate={isDragging ? { y: [0, -6, 0] } : { y: 0 }} transition={{ duration: 0.8, repeat: isDragging ? Infinity : 0 }}>
          <UploadCloud className={`mb-3 h-10 w-10 ${isDragging ? 'text-emerald-400' : 'text-slate-400'}`} />
        </motion.div>
        <p className="text-sm text-slate-300">Drag & drop vercel.json, package.json, Dockerfile, or .gitignore</p>
        <label className="mt-3 cursor-pointer text-sm text-emerald-400 transition-colors hover:text-emerald-300">
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
      </motion.div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
          <FilePlus2 className="h-4 w-4" />
          Or paste file content
        </div>
        <textarea
          value={pastedContent}
          onChange={(event) => setPastedContent(event.target.value)}
          placeholder="Paste the raw file content here..."
          rows={4}
          className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 p-2 font-mono text-xs text-slate-200 transition-colors focus:border-emerald-400/60 focus:outline-none"
        />
        <motion.button
          type="button"
          onClick={handlePasteSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.35)] transition-colors hover:bg-emerald-400"
        >
          Analyze pasted content
        </motion.button>
      </div>
    </div>
  );
}
