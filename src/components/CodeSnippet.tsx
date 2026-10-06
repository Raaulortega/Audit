import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface CodeSnippetProps {
  code: string;
  copyLabel?: string;
}

export function CodeSnippet({ code, copyLabel: customLabel }: CodeSnippetProps) {
  const { t } = useI18n();
  const copyLabel = customLabel ?? t.common.copyPatch;
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard access denied - nothing to recover, user can select text manually
    }
  };

  return (
    <div className="overflow-hidden rounded-[14px] border border-separator bg-code">
      <div className="flex items-center justify-end border-b border-separator px-1.5 py-1">
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-footnote font-medium transition-colors ${
            copied ? 'text-tint' : 'text-label-2 hover:bg-fill hover:text-label'
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          <span aria-live="polite">{copied ? t.common.copied : copyLabel}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-footnote leading-relaxed text-label">{code}</pre>
    </div>
  );
}
