import type { Analyzer, FileType } from '../types';
import { analyzeVercelConfig } from './vercelAnalyzer';
import { analyzePackageJson } from './packageJsonAnalyzer';
import { analyzeDockerfile } from './dockerfileAnalyzer';
import { analyzeGitignore } from './gitignoreAnalyzer';

export const analyzerRegistry: Partial<Record<FileType, Analyzer>> = {
  vercelJson: analyzeVercelConfig,
  packageJson: analyzePackageJson,
  dockerfile: analyzeDockerfile,
  gitignore: analyzeGitignore,
};
