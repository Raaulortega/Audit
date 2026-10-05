import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnalysisResult, AnalyzedFile, Finding } from '../engine/types';
import { detectFileType } from '../engine/detectFileType';
import { analyzerRegistry } from '../engine/analyzers';
import { buildAnalysisResult } from '../engine/scoring';
import { scanSecrets } from '../engine/secretScanner';

const STORAGE_KEY = 'config-audit:last-result';
const EMPTY_RESULT: AnalysisResult = { score: 100, findings: [], counts: { critical: 0, medium: 0, low: 0 } };

export interface FileAnalysis {
  file: AnalyzedFile;
  findings: Finding[];
  parseError: string | null;
}

interface UseAnalysisReturn {
  fileAnalyses: FileAnalysis[];
  result: AnalysisResult;
  addFile: (filename: string, content: string) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadStoredResult(): AnalysisResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AnalysisResult;
  } catch {
    // localStorage unavailable (e.g. private browsing) - fall back to empty result
  }
  return EMPTY_RESULT;
}

function namespaceFindings(file: AnalyzedFile, findings: Finding[]): Finding[] {
  return findings.map((f) => ({
    ...f,
    id: `${file.id}:${f.id}`,
    // Line-specific ids (e.g. "docker-sudo-L4") share one rule.
    ruleId: f.ruleId ?? f.id.replace(/-L\d+$/, ''),
    sourceFile: file.filename,
  }));
}

export function analyzeSingleFile(file: AnalyzedFile): FileAnalysis {
  // Secrets leak into every kind of file, so the scanner runs even when the
  // type is unknown or the type-specific analyzer cannot parse the content.
  const secretFindings = file.fileType === 'gitignore' ? [] : namespaceFindings(file, scanSecrets(file.content));
  const analyzer = analyzerRegistry[file.fileType];
  if (!analyzer) {
    return { file, findings: secretFindings, parseError: null };
  }

  try {
    const findings = namespaceFindings(file, analyzer(file.content));
    // The generic heuristic adds nothing on a line a type-specific rule already explains.
    const coveredLines = new Set(findings.map((f) => f.line));
    const extraSecrets = secretFindings.filter(
      (f) => !(f.ruleId?.startsWith('secret-generic-secret') && coveredLines.has(f.line)),
    );
    return { file, findings: [...findings, ...extraSecrets], parseError: null };
  } catch {
    return { file, findings: secretFindings, parseError: 'Failed to parse file content.' };
  }
}

export function useAnalysis(): UseAnalysisReturn {
  const [files, setFiles] = useState<AnalyzedFile[]>([]);
  const [result, setResult] = useState<AnalysisResult>(loadStoredResult);
  const hasAnalyzed = useRef(false);

  const addFile = useCallback((filename: string, content: string) => {
    const fileType = detectFileType(filename, content);
    setFiles((prev) => [...prev, { id: createId(), filename, content, fileType }]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  const fileAnalyses = useMemo<FileAnalysis[]>(() => files.map(analyzeSingleFile), [files]);

  useEffect(() => {
    // Keep showing the result restored from localStorage until analysis has
    // actually happened at least once (i.e. a file has been loaded). Once
    // `hasAnalyzed.current` flips to true, every subsequent change to `files`
    // (including removing the last one) recomputes live, since only the
    // AnalysisResult - not the files - persists.
    if (!hasAnalyzed.current && files.length === 0) return;
    hasAnalyzed.current = true;

    const allFindings = fileAnalyses.flatMap((entry) => entry.findings);
    const nextResult = buildAnalysisResult(allFindings);
    setResult(nextResult);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextResult));
    } catch {
      // localStorage unavailable (e.g. private browsing) - persistence is best-effort
    }
  }, [fileAnalyses]);

  return { fileAnalyses, result, addFile, removeFile, clearFiles };
}
