import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useAnalysis, type FileAnalysis } from '../hooks/useAnalysis';
import { MAX_SNAPSHOTS, createSnapshot, parseSnapshots, type ScanSnapshot } from '../engine/history';
import type { AnalysisResult } from '../engine/types';

const HISTORY_KEY = 'config-audit:history';

interface AuditContextValue {
  fileAnalyses: FileAnalysis[];
  result: AnalysisResult;
  addFile: (filename: string, content: string) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  history: ScanSnapshot[];
  saveSnapshot: (label: string) => ScanSnapshot | null;
  deleteSnapshot: (id: string) => void;
  clearHistory: () => void;
}

const AuditContext = createContext<AuditContextValue | null>(null);

function loadHistory(): ScanSnapshot[] {
  try {
    return parseSnapshots(localStorage.getItem(HISTORY_KEY));
  } catch {
    return [];
  }
}

function persistHistory(history: ScanSnapshot[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage unavailable or full - history stays in memory for this session
  }
}

/**
 * Keeps the loaded files and scan history above the router, so moving between
 * pages (e.g. Header builder → Scanner) never loses work.
 */
export function AuditProvider({ children }: { children: ReactNode }) {
  const { fileAnalyses, result, addFile, removeFile, clearFiles } = useAnalysis();
  const [history, setHistory] = useState<ScanSnapshot[]>(loadHistory);

  const updateHistory = useCallback((update: (previous: ScanSnapshot[]) => ScanSnapshot[]) => {
    setHistory((previous) => {
      const next = update(previous);
      persistHistory(next);
      return next;
    });
  }, []);

  const saveSnapshot = useCallback(
    (label: string) => {
      if (fileAnalyses.length === 0) return null;
      const snapshot = createSnapshot(
        result,
        fileAnalyses.map(({ file }) => file.filename),
        label,
      );
      updateHistory((previous) => [snapshot, ...previous].slice(0, MAX_SNAPSHOTS));
      return snapshot;
    },
    [fileAnalyses, result, updateHistory],
  );

  const deleteSnapshot = useCallback(
    (id: string) => updateHistory((previous) => previous.filter((snapshot) => snapshot.id !== id)),
    [updateHistory],
  );
  const clearHistory = useCallback(() => updateHistory(() => []), [updateHistory]);

  const value = useMemo(
    () => ({
      fileAnalyses,
      result,
      addFile,
      removeFile,
      clearFiles,
      history,
      saveSnapshot,
      deleteSnapshot,
      clearHistory,
    }),
    [fileAnalyses, result, addFile, removeFile, clearFiles, history, saveSnapshot, deleteSnapshot, clearHistory],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit(): AuditContextValue {
  const context = useContext(AuditContext);
  if (!context) throw new Error('useAudit must be used inside <AuditProvider>');
  return context;
}
