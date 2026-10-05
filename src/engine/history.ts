import type { AnalysisResult, Finding } from './types';

export interface ScanSnapshot extends AnalysisResult {
  id: string;
  /** ISO 8601 timestamp, e.g. "2026-10-04T09:30:00.000Z". */
  savedAt: string;
  label: string;
  fileNames: string[];
}

export interface ScanComparison {
  fixed: Finding[];
  introduced: Finding[];
  unchanged: Finding[];
  scoreDelta: number;
}

export const MAX_SNAPSHOTS = 50;

/** Identity of a finding across scans: same rule in the same file, regardless of line moves. */
function findingKey(finding: Finding): string {
  return `${finding.sourceFile}|${finding.ruleId ?? finding.id}`;
}

export function compareScans(before: ScanSnapshot, after: ScanSnapshot): ScanComparison {
  const beforeKeys = new Set(before.findings.map(findingKey));
  const afterKeys = new Set(after.findings.map(findingKey));
  return {
    fixed: before.findings.filter((finding) => !afterKeys.has(findingKey(finding))),
    introduced: after.findings.filter((finding) => !beforeKeys.has(findingKey(finding))),
    unchanged: after.findings.filter((finding) => beforeKeys.has(findingKey(finding))),
    scoreDelta: after.score - before.score,
  };
}

export function createSnapshot(result: AnalysisResult, fileNames: string[], label: string, now = new Date()): ScanSnapshot {
  return {
    ...result,
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: now.toISOString(),
    label: label.trim() || `Scan of ${fileNames.length} file${fileNames.length === 1 ? '' : 's'}`,
    fileNames,
  };
}

/** Accepts only well-formed snapshots so a corrupted localStorage entry cannot crash the page. */
export function parseSnapshots(raw: string | null): ScanSnapshot[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ScanSnapshot =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof entry.id === 'string' &&
        typeof entry.savedAt === 'string' &&
        typeof entry.score === 'number' &&
        Array.isArray(entry.findings),
    );
  } catch {
    return [];
  }
}
