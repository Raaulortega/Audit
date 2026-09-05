import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnalysisResult, AnalyzedFile, Finding } from '../engine/types';
import { detectFileType } from '../engine/detectFileType';
import { analyzerRegistry } from '../engine/analyzers';
import { buildAnalysisResult } from '../engine/scoring';

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

function analyzeSingleFile(file: AnalyzedFile): FileAnalysis {
  const analyzer = analyzerRegistry[file.fileType];
  if (!analyzer) {
    return {
      file,
      findings: [],
      parseError: file.fileType === 'unknown' ? 'Could not detect file type.' : null,
    };
  }

  try {
    return { file, findings: analyzer(file.content), parseError: null };
  } catch {
    return { file, findings: [], parseError: 'Failed to parse file content.' };
  }
}

export function useAnalysis(): UseAnalysisReturn {
  const [files, setFiles] = useState<AnalyzedFile[]>([]);
  const [result, setResult] = useState<AnalysisResult>(loadStoredResult);
  const isFirstRender = useRef(true);

  const addFile = useCallback((filename: string, content: string) => {
    const fileType = detectFileType(filename, content);
    setFiles((prev) => [...prev, { id: createId(), filename, content, fileType }]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const fileAnalyses = useMemo<FileAnalysis[]>(() => files.map(analyzeSingleFile), [files]);

  useEffect(() => {
    // On the very first render with no files loaded, keep showing the result
    // restored from localStorage instead of resetting it to the empty state.
    // Every subsequent change to `files` (including removing the last one)
    // recomputes live, since only the AnalysisResult - not the files - persists.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (files.length === 0) return;
    }

    const allFindings = fileAnalyses.flatMap((entry) => entry.findings);
    const nextResult = buildAnalysisResult(allFindings);
    setResult(nextResult);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextResult));
    } catch {
      // localStorage unavailable (e.g. private browsing) - persistence is best-effort
    }
  }, [fileAnalyses, files.length]);

  return { fileAnalyses, result, addFile, removeFile };
}
