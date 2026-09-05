import type { Finding } from '../types';

export function analyzeDockerfile(content: string): Finding[] {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const findings: Finding[] = [];

  const hasNonRootUser = lines.some((line) => /^USER\s+(?!root\b)\S+/i.test(line));
  if (!hasNonRootUser) {
    findings.push({
      id: 'docker-root-user',
      severity: 'critical',
      category: 'Container Privilege',
      title: 'Container runs as root',
      description: 'Running as root inside a container widens the blast radius of any code-execution vulnerability.',
      fixSnippet: `RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser`,
      sourceFile: 'Dockerfile',
    });
  }

  const fromLine = lines.find((line) => /^FROM\s+/i.test(line));
  if (fromLine) {
    const imageRef = fromLine.replace(/^FROM\s+/i, '').split(/\s+/)[0];
    const [image, tag] = imageRef.split(':');
    if (!tag || tag === 'latest') {
      findings.push({
        id: 'docker-latest-tag',
        severity: 'medium',
        category: 'Unpinned Base Image',
        title: `Base image "${image}" is unpinned or uses :latest`,
        description: 'Unpinned tags make builds non-reproducible and can silently pull in breaking or vulnerable updates.',
        fixSnippet: `FROM ${image}:20.11.1-alpine`,
        sourceFile: 'Dockerfile',
      });
    }
  }

  return findings;
}
