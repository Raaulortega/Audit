export type Severity = 'critical' | 'medium' | 'low';

export type FileType = 'vercelJson' | 'packageJson' | 'dockerfile' | 'gitignore' | 'unknown';

export interface Finding {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  fixSnippet: string;
  sourceFile: string;
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
