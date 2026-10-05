import { describe, expect, it } from 'vitest';
import { toJsonReport, toMarkdownReport, toSarifReport } from './report';
import { detectFileType } from './detectFileType';
import type { AnalysisResult } from './types';

const result: AnalysisResult = {
  score: 77,
  counts: { critical: 1, medium: 0, low: 1 },
  findings: [
    {
      id: 'file-1:docker-no-healthcheck',
      ruleId: 'docker-no-healthcheck',
      severity: 'low',
      category: 'Availability',
      title: 'No HEALTHCHECK instruction',
      description: 'desc',
      fixSnippet: 'HEALTHCHECK CMD true',
      sourceFile: 'Dockerfile',
    },
    {
      id: 'file-2:secret-aws-access-key-L3',
      ruleId: 'secret-aws-access-key-L3',
      severity: 'critical',
      category: 'Hardcoded Secret',
      title: 'AWS access key ID on line 3',
      description: 'desc',
      fixSnippet: 'rotate',
      sourceFile: '.env',
      line: 3,
      references: ['CWE-798'],
    },
  ],
};
const generatedAt = new Date('2026-10-03T12:00:00.000Z');

describe('reports', () => {
  it('produces valid SARIF 2.1.0 with locations and levels', () => {
    const sarif = JSON.parse(toSarifReport(result));
    expect(sarif.version).toBe('2.1.0');
    const [run] = sarif.runs;
    expect(run.tool.driver.rules).toHaveLength(2);
    expect(run.results[1]).toMatchObject({
      ruleId: 'secret-aws-access-key-L3',
      level: 'error',
      locations: [{ physicalLocation: { artifactLocation: { uri: '.env' }, region: { startLine: 3 } } }],
    });
  });

  it('orders Markdown findings by severity', () => {
    const markdown = toMarkdownReport(result, generatedAt);
    expect(markdown).toContain('**Score:** 77/100');
    expect(markdown.indexOf('[CRITICAL]')).toBeLessThan(markdown.indexOf('[LOW]'));
    expect(markdown).toContain('`.env:3`');
  });

  it('includes metadata in the JSON report', () => {
    const json = JSON.parse(toJsonReport(result, generatedAt));
    expect(json.generatedAt).toBe('2026-10-03T12:00:00.000Z');
    expect(json.findings[0].severity).toBe('critical');
  });
});

describe('detectFileType', () => {
  it.each([
    ['.env.production', '', 'envFile'],
    ['docker-compose.prod.yml', '', 'dockerCompose'],
    ['compose.yaml', '', 'dockerCompose'],
    ['site.conf', 'server { listen 80; }', 'nginxConf'],
    ['pasted-content', 'services:\n  web:\n    image: nginx', 'dockerCompose'],
    ['pasted-content', 'FOO=bar\n# comment\nBAZ=1', 'envFile'],
    ['pasted-content', 'node_modules/\n.env', 'gitignore'],
  ])('%s → %s', (filename, content, expected) => {
    expect(detectFileType(filename, content)).toBe(expected);
  });
});
