export type Severity = 'critical' | 'medium' | 'low';

export type FileType =
  | 'vercelJson'
  | 'packageJson'
  | 'dockerfile'
  | 'gitignore'
  | 'envFile'
  | 'dockerCompose'
  | 'nginxConf'
  | 'unknown';

export interface Finding {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  fixSnippet: string;
  sourceFile: string;
  /** Analyzer-level rule id, kept stable when `id` is namespaced per file. */
  ruleId?: string;
  /** 1-indexed line the finding points to, when it can be located. */
  line?: number;
  /** CWE / OWASP identifiers, e.g. "CWE-798", "OWASP A05:2021". */
  references?: string[];
}

export type Analyzer = (content: string) => Finding[];

export interface AnalyzedFile {
  id: string;
  filename: string;
  content: string;
  fileType: FileType;
}

export interface AnalysisResult {
  score: number;
  findings: Finding[];
  counts: { critical: number; medium: number; low: number };
}
