import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
}

export function CodeSnippet({ code }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard access denied - nothing to recover, user can select text manually
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-950/80">
      <motion.button
        type="button"
        onClick={handleCopy}
        whileTap={{ scale: 0.92 }}
        className={`absolute right-2 top-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
          copied
            ? 'bg-emerald-400/15 text-emerald-300'
            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-emerald-300'
        }`}
        aria-label="Copy fix snippet"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              ¡Copiado!
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy patch
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <pre className="overflow-x-auto p-3 pr-28 font-mono text-xs text-slate-200">{code}</pre>
    </div>
  );
}
