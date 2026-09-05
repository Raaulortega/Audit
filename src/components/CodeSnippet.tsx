import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
}

export function CodeSnippet({ code }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied - nothing to recover, user can select text manually
    }
  };

  return (
    <div className="relative rounded border border-slate-700 bg-slate-950">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded bg-slate-800 p-1.5 text-slate-400 hover:text-emerald-400"
        aria-label="Copy fix snippet"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre className="overflow-x-auto p-3 pr-10 font-mono text-xs text-slate-200">{code}</pre>
    </div>
  );
}
