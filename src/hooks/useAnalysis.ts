import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AnalysisResult, AnalyzedFile, Finding } from '../engine/types';
import { detectFileType } from '../engine/detectFileType';
import { analyzerRegistry } from '../engine/analyzers';
import { buildAnalysisResult } from '../engine/scoring';
import { scanSecrets } from '../engine/secretScanner';
import {
  MAX_FILE_BYTES,
  loadFilesFromDb,
  parseStoredFiles,
  saveFilesToDb,
  type StoredFile,
} from '../engine/storedFiles';

/** Older builds kept the files (or only the last result) in localStorage; they move to IndexedDB. */
const LEGACY_FILES_KEY = 'config-audit:files';
const LEGACY_RESULT_KEY = 'config-audit:last-result';

export interface FileAnalysis {
  file: AnalyzedFile;
  findings: Finding[];
  parseError: string | null;
}

interface UseAnalysisReturn {
  fileAnalyses: FileAnalysis[];
  result: AnalysisResult;
  /** False until the files saved by a previous visit have been restored. */
  hydrated: boolean;
  /** True when the browser refused to store the files, so they will not survive a reload. */
  storageFull: boolean;
  addFile: (filename: string, content: string) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readLegacyFiles(): StoredFile[] {
  try {
    return parseStoredFiles(localStorage.getItem(LEGACY_FILES_KEY));
  } catch {
    // localStorage unavailable - nothing to migrate
    return [];
  }
}

/** Called only after IndexedDB holds the files, so a failed migration never loses them. */
function removeLegacyKeys(): void {
  try {
    localStorage.removeItem(LEGACY_FILES_KEY);
    localStorage.removeItem(LEGACY_RESULT_KEY);
  } catch {
    // localStorage unavailable - nothing to remove
  }
}

function toAnalyzedFile(file: StoredFile): AnalyzedFile {
  return { ...file, fileType: detectFileType(file.filename, file.content) };
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
  const [hydrated, setHydrated] = useState(false);
  const [storageFull, setStorageFull] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const legacy = readLegacyFiles();
    loadFilesFromDb()
      .catch(() => [] as StoredFile[])
      .then((stored) => {
        if (cancelled) return;
        const restored = (stored.length > 0 ? stored : legacy).map(toAnalyzedFile);
        // Files added while the database was still loading are kept after the restored ones.
        setFiles((current) => [...restored, ...current.filter((file) => !restored.some((r) => r.id === file.id))]);
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addFile = useCallback((filename: string, content: string) => {
    // Callers check the size first; this guard keeps oversized input out of the regex engine regardless.
    if (content.length > MAX_FILE_BYTES) return;
    const fileType = detectFileType(filename, content);
    setFiles((prev) => [...prev, { id: createId(), filename, content, fileType }]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  const fileAnalyses = useMemo<FileAnalysis[]>(() => files.map(analyzeSingleFile), [files]);

  const result = useMemo<AnalysisResult>(
    () => buildAnalysisResult(fileAnalyses.flatMap((entry) => entry.findings)),
    [fileAnalyses],
  );

  // The files themselves persist (not just the result), so a reload restores the full scan.
  // Saving waits for hydration, otherwise the initial empty list would wipe the stored files.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    saveFilesToDb(files.map(({ id, filename, content }) => ({ id, filename, content })))
      .then(() => {
        removeLegacyKeys();
        if (!cancelled) setStorageFull(false);
      })
      // Quota exceeded or IndexedDB disabled (some private modes) - keep working in memory and tell the user.
      .catch(() => !cancelled && setStorageFull(files.length > 0));
    return () => {
      cancelled = true;
    };
  }, [files, hydrated]);

  return { fileAnalyses, result, hydrated, storageFull, addFile, removeFile, clearFiles };
}
