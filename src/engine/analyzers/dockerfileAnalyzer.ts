import type { Finding } from '../types';

export function analyzeDockerfile(content: string): Finding[] {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const findings: Finding[] = [];

  const lastFromIndex = lines.reduce(
    (lastIndex, line, index) => (/^FROM\s+/i.test(line) ? index : lastIndex),
    -1,
  );
  const linesAfterLastFrom = lastFromIndex === -1 ? lines : lines.slice(lastFromIndex);

  const hasNonRootUser = linesAfterLastFrom.some((line) => /^USER\s+(?!root\b)\S+/i.test(line));
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

  const fromLines = lines.filter((line) => /^FROM\s+/i.test(line));
  const unpinnedImage = fromLines
    .map((line) => line.replace(/^FROM\s+/i, '').split(/\s+/)[0])
    .find((imageRef) => {
      const [, tag] = imageRef.split(':');
      return !tag || tag === 'latest';
    });

  if (unpinnedImage) {
    const [image] = unpinnedImage.split(':');
    findings.push({
      id: 'docker-latest-tag',
      severity: 'medium',
      category: 'Unpinned Base Image',
      title: `Base image "${image}" is unpinned or uses :latest`,
      description: 'Unpinned tags make builds non-reproducible and can silently pull in breaking or vulnerable updates.',
      fixSnippet: `FROM ${image}:<pinned-version>  # replace with a specific released tag`,
      sourceFile: 'Dockerfile',
    });
  }

  return findings;
}
