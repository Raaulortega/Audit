import type { AnalysisResult, Finding, Severity } from './types';

const SEVERITY_PENALTY: Record<Severity, number> = {
  critical: 15,
  medium: 8,
  low: 3,
};

export function computeScore(findings: Finding[]): number {
  const raw = findings.reduce((score, finding) => score - SEVERITY_PENALTY[finding.severity], 100);
  return Math.max(0, raw);
}

export function buildAnalysisResult(findings: Finding[]): AnalysisResult {
  const counts = { critical: 0, medium: 0, low: 0 };
  for (const finding of findings) {
    counts[finding.severity] += 1;
  }
  return { score: computeScore(findings), findings, counts };
}
