import type { Analyzer, FileType } from '../types';
import { analyzeVercelConfig } from './vercelAnalyzer';
import { analyzePackageJson } from './packageJsonAnalyzer';
import { analyzeDockerfile } from './dockerfileAnalyzer';
import { analyzeGitignore } from './gitignoreAnalyzer';
import { analyzeEnvFile } from './envAnalyzer';
import { analyzeDockerCompose } from './dockerComposeAnalyzer';
import { analyzeNginxConf } from './nginxAnalyzer';

export const analyzerRegistry: Partial<Record<FileType, Analyzer>> = {
  vercelJson: analyzeVercelConfig,
  packageJson: analyzePackageJson,
  dockerfile: analyzeDockerfile,
  gitignore: analyzeGitignore,
  envFile: analyzeEnvFile,
  dockerCompose: analyzeDockerCompose,
  nginxConf: analyzeNginxConf,
};
