import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAnalysis, type FileAnalysis } from '../hooks/useAnalysis';
import { createSnapshot, parseSnapshots, upsertSnapshot, type ScanSnapshot } from '../engine/history';
import type { AnalysisResult } from '../engine/types';

const HISTORY_KEY = 'config-audit:history';
const ACTIVE_SCAN_KEY = 'config-audit:active-scan';

interface AuditContextValue {
  fileAnalyses: FileAnalysis[];
  result: AnalysisResult;
  /** False until the files saved by a previous visit have been restored. */
  hydrated: boolean;
  storageFull: boolean;
  addFile: (filename: string, content: string) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  history: ScanSnapshot[];
  /** History entry that is kept in sync with the files currently loaded, if any. */
  activeSnapshotId: string | null;
  saveSnapshot: (label: string) => ScanSnapshot | null;
  deleteSnapshot: (id: string) => void;
  clearHistory: () => void;
}

/**
 * Links the loaded files to their auto-saved history entry. `signature` is the
 * list of loaded file ids, so a reload with the same files does not create a
 * duplicate entry.
 */
interface ActiveScan {
  snapshotId: string | null;
  signature: string;
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

function loadActiveScan(): ActiveScan {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(ACTIVE_SCAN_KEY) ?? 'null');
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'signature' in parsed &&
      'snapshotId' in parsed &&
      typeof parsed.signature === 'string' &&
      (parsed.snapshotId === null || typeof parsed.snapshotId === 'string')
    ) {
      return { snapshotId: parsed.snapshotId, signature: parsed.signature };
    }
  } catch {
    // corrupted or unavailable - start a fresh link
  }
  return { snapshotId: null, signature: '' };
}

function createSnapshotId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Keeps the loaded files and scan history above the router, so moving between
 * pages (e.g. Header builder → Scanner) never loses work. Every change to the
 * loaded files is mirrored into one auto-saved history entry.
 */
export function AuditProvider({ children }: { children: ReactNode }) {
  const { fileAnalyses, result, hydrated, storageFull, addFile, removeFile, clearFiles } = useAnalysis();
  // Browser storage is read after the first render so it matches the prerendered HTML.
  const [history, setHistory] = useState<ScanSnapshot[]>([]);
  const activeScanRef = useRef<ActiveScan>(loadActiveScan());
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    setActiveSnapshotId(activeScanRef.current.snapshotId);
  }, []);

  const updateHistory = useCallback((update: (previous: ScanSnapshot[]) => ScanSnapshot[]) => {
    setHistory((previous) => {
      const next = update(previous);
      persistHistory(next);
      return next;
    });
  }, []);

  const setActiveScan = useCallback((next: ActiveScan) => {
    activeScanRef.current = next;
    setActiveSnapshotId(next.snapshotId);
    try {
      localStorage.setItem(ACTIVE_SCAN_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable - the link lasts for this session only
    }
  }, []);

  useEffect(() => {
    // Before hydration the list is empty only because it is still loading, not because the user cleared it.
    if (!hydrated) return;
    const signature = fileAnalyses.map(({ file }) => file.id).join('|');
    if (signature === activeScanRef.current.signature) return;

    if (fileAnalyses.length === 0) {
      // Scanner emptied: the next file starts a new history entry.
      setActiveScan({ snapshotId: null, signature: '' });
      return;
    }

    const id = activeScanRef.current.snapshotId ?? createSnapshotId();
    const fileNames = fileAnalyses.map(({ file }) => file.filename);
    updateHistory((previous) => {
      const label = previous.find((entry) => entry.id === id)?.label ?? '';
      return upsertSnapshot(previous, createSnapshot(result, fileNames, label, new Date(), id));
    });
    setActiveScan({ snapshotId: id, signature });
  }, [fileAnalyses, result, hydrated, updateHistory, setActiveScan]);

  /** Names the current scan and freezes it, so later changes go into a new entry. */
  const saveSnapshot = useCallback(
    (label: string) => {
      if (fileAnalyses.length === 0) return null;
      const snapshot = createSnapshot(
        result,
        fileAnalyses.map(({ file }) => file.filename),
        label,
        new Date(),
        activeScanRef.current.snapshotId ?? createSnapshotId(),
      );
      updateHistory((previous) => upsertSnapshot(previous, snapshot));
      setActiveScan({ snapshotId: null, signature: activeScanRef.current.signature });
      return snapshot;
    },
    [fileAnalyses, result, updateHistory, setActiveScan],
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
      hydrated,
      storageFull,
      addFile,
      removeFile,
      clearFiles,
      history,
      activeSnapshotId,
      saveSnapshot,
      deleteSnapshot,
      clearHistory,
    }),
    [
      fileAnalyses,
      result,
      hydrated,
      storageFull,
      addFile,
      removeFile,
      clearFiles,
      history,
      activeSnapshotId,
      saveSnapshot,
      deleteSnapshot,
      clearHistory,
    ],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit(): AuditContextValue {
  const context = useContext(AuditContext);
  if (!context) throw new Error('useAudit must be used inside <AuditProvider>');
  return context;
}
