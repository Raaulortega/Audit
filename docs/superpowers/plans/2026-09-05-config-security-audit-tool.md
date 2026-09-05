# Config Security Audit Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side React SPA that statically audits `vercel.json`, `package.json`, `Dockerfile`, and `.gitignore` files for security misconfigurations and shows a 0-100 score with copy-ready fixes.

**Architecture:** A framework-agnostic `engine/` module (pure functions: detect file type → run matching analyzer → aggregate findings → score) feeds a small set of React components via one `useAnalysis` hook. No backend, no network calls.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, lucide-react. No test framework is added to `package.json` (explicit spec decision) — engine logic is verified with disposable `npx tsx` scratch scripts that are deleted before committing; UI is verified by running the dev server and checking the browser.

**Spec:** `docs/superpowers/specs/2026-09-05-config-security-audit-tool-design.md`

## Global Constraints

- No backend, no network calls, no telemetry, no live CVE/npm-registry lookups.
- No automated test framework in `package.json` (Vitest/Jest not installed).
- Scoring: start at 100, subtract Critical −15, Medium −8, Low −3, floor at 0.
- Dark theme only; Tailwind CSS; lucide-react for all icons.
- Every `Finding` includes: `id`, `severity`, `category`, `title`, `description`, `fixSnippet`, `sourceFile`.
- `localStorage` writes/reads must be wrapped in try/catch and fail silently (private browsing).
- Comments and all logic/identifiers in English.

---

## Task 1: Project Scaffold & Dark Theme Shell

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx`

**Interfaces:**
- Produces: a buildable Vite React-TS project; `src/App.tsx` exports `App` (React component), replaced with full content in Task 11.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "config-security-audit",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.441.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.45",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4",
    "vite": "^5.4.3"
  }
}
```

- [ ] **Step 2: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 6: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Config Security Audit</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `.gitignore`**

```
node_modules
dist
*.local
```

- [ ] **Step 9: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #020617;
}
```

- [ ] **Step 10: Create `src/App.tsx` (placeholder, replaced in Task 11)**

```tsx
export function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <p className="text-sm text-slate-400">Config Security Audit — scaffold ready.</p>
    </div>
  );
}
```

- [ ] **Step 11: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 12: Install dependencies**

Run: `npm install`
Expected: completes with no errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 13: Verify build**

Run: `npm run build`
Expected: `tsc -b` and `vite build` both succeed, `dist/` is created.

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.js postcss.config.js index.html .gitignore src/main.tsx src/index.css src/App.tsx
git commit -m "feat: scaffold Vite React TS project with Tailwind dark shell"
```

---

## Task 2: Engine Types & File Type Detection

**Files:**
- Create: `src/engine/types.ts`
- Create: `src/engine/detectFileType.ts`

**Interfaces:**
- Consumes: nothing (foundational).
- Produces: `Severity`, `FileType`, `Finding`, `Analyzer`, `AnalyzedFile`, `AnalysisResult` types; `detectFileType(filename: string, content: string): FileType`.

- [ ] **Step 1: Create `src/engine/types.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/engine/detectFileType.ts`**

```ts
import type { FileType } from './types';

export function detectFileType(filename: string, content: string): FileType {
  const name = filename.trim().toLowerCase();

  if (name.endsWith('vercel.json')) return 'vercelJson';
  if (name.endsWith('package.json')) return 'packageJson';
  if (name.endsWith('dockerfile')) return 'dockerfile';
  if (name.endsWith('.gitignore')) return 'gitignore';

  return detectFileTypeFromContent(content);
}

function detectFileTypeFromContent(content: string): FileType {
  const trimmed = content.trim();

  if (trimmed.startsWith('{')) {
    return detectJsonFileType(trimmed);
  }

  if (/^FROM\s+\S+/m.test(trimmed)) return 'dockerfile';

  if (/node_modules|\.env|\.DS_Store/.test(trimmed) && !trimmed.includes('{')) {
    return 'gitignore';
  }

  return 'unknown';
}

function detectJsonFileType(trimmed: string): FileType {
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if ('headers' in parsed || 'redirects' in parsed) return 'vercelJson';
    if ('dependencies' in parsed || 'scripts' in parsed) return 'packageJson';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}
```

- [ ] **Step 3: Write scratch verification script**

Create temporary file `scripts/tmp-verify-detect.mts` (not committed):

```ts
import { detectFileType } from '../src/engine/detectFileType';

const cases: Array<[string, string, string]> = [
  ['vercel.json', '{"headers":[]}', 'vercelJson'],
  ['package.json', '{"dependencies":{}}', 'packageJson'],
  ['Dockerfile', 'FROM node:20\nUSER app', 'dockerfile'],
  ['.gitignore', 'node_modules\n.env', 'gitignore'],
  ['pasted-content', '{"dependencies":{"react":"18.0.0"}}', 'packageJson'],
  ['pasted-content', 'FROM python:3.12', 'dockerfile'],
  ['pasted-content', 'not a real config', 'unknown'],
];

let failed = false;
for (const [filename, content, expected] of cases) {
  const actual = detectFileType(filename, content);
  if (actual !== expected) {
    console.error(`FAIL: detectFileType(${filename}) = ${actual}, expected ${expected}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('All detectFileType cases passed.');
```

- [ ] **Step 4: Run verification**

Run: `npx --yes tsx scripts/tmp-verify-detect.mts`
Expected: `All detectFileType cases passed.`

- [ ] **Step 5: Delete scratch script**

Run: `rm scripts/tmp-verify-detect.mts` (PowerShell: `Remove-Item scripts/tmp-verify-detect.mts`)

- [ ] **Step 6: Commit**

```bash
git add src/engine/types.ts src/engine/detectFileType.ts
git commit -m "feat: add engine types and file type detection"
```

---

## Task 3: Scoring Engine

**Files:**
- Create: `src/engine/scoring.ts`

**Interfaces:**
- Consumes: `Finding`, `AnalysisResult` from `src/engine/types.ts` (Task 2).
- Produces: `computeScore(findings: Finding[]): number`, `buildAnalysisResult(findings: Finding[]): AnalysisResult`.

- [ ] **Step 1: Create `src/engine/scoring.ts`**

```ts
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
```

- [ ] **Step 2: Write scratch verification script**

Create temporary file `scripts/tmp-verify-scoring.mts` (not committed):

```ts
import { computeScore, buildAnalysisResult } from '../src/engine/scoring';
import type { Finding } from '../src/engine/types';

function makeFinding(severity: Finding['severity']): Finding {
  return {
    id: severity,
    severity,
    category: 'test',
    title: 'test',
    description: 'test',
    fixSnippet: 'test',
    sourceFile: 'test',
  };
}

let failed = false;

if (computeScore([]) !== 100) {
  console.error('FAIL: empty findings should score 100');
  failed = true;
}

if (computeScore([makeFinding('critical')]) !== 85) {
  console.error('FAIL: one critical should score 85');
  failed = true;
}

const manyFindings = Array.from({ length: 10 }, () => makeFinding('critical'));
if (computeScore(manyFindings) !== 0) {
  console.error('FAIL: score should floor at 0');
  failed = true;
}

const result = buildAnalysisResult([makeFinding('critical'), makeFinding('medium'), makeFinding('low')]);
if (result.score !== 74 || result.counts.critical !== 1 || result.counts.medium !== 1 || result.counts.low !== 1) {
  console.error('FAIL: buildAnalysisResult counts/score mismatch', result);
  failed = true;
}

if (failed) process.exit(1);
console.log('All scoring cases passed.');
```

- [ ] **Step 3: Run verification**

Run: `npx --yes tsx scripts/tmp-verify-scoring.mts`
Expected: `All scoring cases passed.`

- [ ] **Step 4: Delete scratch script**

Run: `rm scripts/tmp-verify-scoring.mts`

- [ ] **Step 5: Commit**

```bash
git add src/engine/scoring.ts
git commit -m "feat: add scoring engine"
```

---

## Task 4: Vercel Analyzer

**Files:**
- Create: `src/engine/analyzers/vercelAnalyzer.ts`

**Interfaces:**
- Consumes: `Finding` from `src/engine/types.ts`.
- Produces: `analyzeVercelConfig(content: string): Finding[]` (throws on invalid JSON — caller catches).

- [ ] **Step 1: Create `src/engine/analyzers/vercelAnalyzer.ts`**

```ts
import type { Finding, Severity } from '../types';

interface VercelHeaderRule {
  key: string;
  value: string;
}

interface VercelHeaderBlock {
  source: string;
  headers: VercelHeaderRule[];
}

interface VercelConfig {
  headers?: VercelHeaderBlock[];
}

interface RequiredHeaderRule {
  key: string;
  severity: Severity;
  title: string;
  description: string;
  fixSnippet: string;
}

const REQUIRED_HEADERS: RequiredHeaderRule[] = [
  {
    key: 'strict-transport-security',
    severity: 'critical',
    title: 'Missing Strict-Transport-Security header',
    description: 'HSTS forces browsers to use HTTPS, preventing downgrade and SSL-stripping attacks.',
    fixSnippet: `{
  "key": "Strict-Transport-Security",
  "value": "max-age=63072000; includeSubDomains; preload"
}`,
  },
  {
    key: 'content-security-policy',
    severity: 'critical',
    title: 'Missing Content-Security-Policy header',
    description: "CSP restricts which sources scripts, styles, and other resources can load from, mitigating XSS.",
    fixSnippet: `{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'"
}`,
  },
  {
    key: 'x-frame-options',
    severity: 'medium',
    title: 'Missing X-Frame-Options header',
    description: 'Prevents the site from being embedded in an iframe, mitigating clickjacking attacks.',
    fixSnippet: `{
  "key": "X-Frame-Options",
  "value": "DENY"
}`,
  },
  {
    key: 'x-content-type-options',
    severity: 'medium',
    title: 'Missing X-Content-Type-Options header',
    description: "Prevents browsers from MIME-sniffing a response away from its declared content type.",
    fixSnippet: `{
  "key": "X-Content-Type-Options",
  "value": "nosniff"
}`,
  },
];

export function analyzeVercelConfig(content: string): Finding[] {
  const config = JSON.parse(content) as VercelConfig;
  const presentKeys = new Set<string>();

  for (const block of config.headers ?? []) {
    for (const header of block.headers ?? []) {
      presentKeys.add(header.key.toLowerCase());
    }
  }

  const findings: Finding[] = [];
  for (const rule of REQUIRED_HEADERS) {
    if (!presentKeys.has(rule.key)) {
      findings.push({
        id: `vercel-${rule.key}`,
        severity: rule.severity,
        category: 'Security Headers',
        title: rule.title,
        description: rule.description,
        fixSnippet: rule.fixSnippet,
        sourceFile: 'vercel.json',
      });
    }
  }

  return findings;
}
```

- [ ] **Step 2: Write scratch verification script**

Create temporary file `scripts/tmp-verify-vercel.mts` (not committed):

```ts
import { analyzeVercelConfig } from '../src/engine/analyzers/vercelAnalyzer';

let failed = false;

const emptyConfig = '{"headers":[]}';
const findingsAllMissing = analyzeVercelConfig(emptyConfig);
if (findingsAllMissing.length !== 4) {
  console.error('FAIL: expected 4 findings for empty headers, got', findingsAllMissing.length);
  failed = true;
}

const fullConfig = JSON.stringify({
  headers: [
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        { key: 'Content-Security-Policy', value: "default-src 'self'" },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ],
});
const findingsNoneMissing = analyzeVercelConfig(fullConfig);
if (findingsNoneMissing.length !== 0) {
  console.error('FAIL: expected 0 findings for full headers, got', findingsNoneMissing.length);
  failed = true;
}

if (failed) process.exit(1);
console.log('All vercelAnalyzer cases passed.');
```

- [ ] **Step 3: Run verification**

Run: `npx --yes tsx scripts/tmp-verify-vercel.mts`
Expected: `All vercelAnalyzer cases passed.`

- [ ] **Step 4: Delete scratch script**

Run: `rm scripts/tmp-verify-vercel.mts`

- [ ] **Step 5: Commit**

```bash
git add src/engine/analyzers/vercelAnalyzer.ts
git commit -m "feat: add vercel.json security header analyzer"
```

---

## Task 5: Package.json Analyzer

**Files:**
- Create: `src/engine/knownVulnerablePackages.ts`
- Create: `src/engine/analyzers/packageJsonAnalyzer.ts`

**Interfaces:**
- Consumes: `Finding` from `src/engine/types.ts`.
- Produces: `analyzePackageJson(content: string): Finding[]` (throws on invalid JSON — caller catches); `KNOWN_VULNERABLE_PACKAGES`, `DEV_ONLY_TOOLS` exported for reuse if needed.

- [ ] **Step 1: Create `src/engine/knownVulnerablePackages.ts`**

```ts
export interface PackageRule {
  minSafeVersion: string;
  advisory: string;
}

export const KNOWN_VULNERABLE_PACKAGES: Record<string, PackageRule> = {
  lodash: { minSafeVersion: '4.17.21', advisory: 'Prototype pollution fixed in 4.17.21.' },
  axios: { minSafeVersion: '1.6.0', advisory: 'SSRF and credential leak issues fixed in 1.6.0.' },
  express: { minSafeVersion: '4.19.2', advisory: 'Open redirect vulnerability fixed in 4.19.2.' },
  minimist: { minSafeVersion: '1.2.6', advisory: 'Prototype pollution fixed in 1.2.6.' },
  'node-fetch': { minSafeVersion: '2.6.7', advisory: 'Information exposure fixed in 2.6.7.' },
  jsonwebtoken: { minSafeVersion: '9.0.0', advisory: 'Signature verification bypass fixed in 9.0.0.' },
  moment: { minSafeVersion: '2.29.4', advisory: 'ReDoS vulnerability fixed in 2.29.4.' },
};

export const DEV_ONLY_TOOLS = new Set([
  'nodemon',
  'webpack-dev-server',
  'vite',
  'eslint',
  'prettier',
  'jest',
  'vitest',
]);
```

- [ ] **Step 2: Create `src/engine/analyzers/packageJsonAnalyzer.ts`**

```ts
import type { Finding } from '../types';
import { DEV_ONLY_TOOLS, KNOWN_VULNERABLE_PACKAGES } from '../knownVulnerablePackages';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

function normalizeVersion(range: string): string {
  return range.replace(/^[\^~>=<\s]+/, '').trim();
}

function isBelowMinVersion(declaredRange: string, minSafeVersion: string): boolean {
  if (declaredRange === '*' || declaredRange === 'latest') return false;

  const declaredParts = normalizeVersion(declaredRange).split('.').map(Number);
  const minParts = minSafeVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(declaredParts.length, minParts.length); i += 1) {
    const declaredPart = declaredParts[i] ?? 0;
    const minPart = minParts[i] ?? 0;
    if (declaredPart !== minPart) return declaredPart < minPart;
  }

  return false;
}

export function analyzePackageJson(content: string): Finding[] {
  const pkg = JSON.parse(content) as PackageJson;
  const findings: Finding[] = [];

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, range] of Object.entries(allDeps)) {
    const rule = KNOWN_VULNERABLE_PACKAGES[name];
    if (rule && isBelowMinVersion(range, rule.minSafeVersion)) {
      findings.push({
        id: `pkg-vuln-${name}`,
        severity: 'critical',
        category: 'Vulnerable Dependency',
        title: `${name}@${range} is below known-safe version`,
        description: rule.advisory,
        fixSnippet: `"${name}": "^${rule.minSafeVersion}"`,
        sourceFile: 'package.json',
      });
    }
  }

  const scripts = pkg.scripts ?? {};
  if (!scripts.audit && !scripts.security) {
    findings.push({
      id: 'pkg-missing-audit-script',
      severity: 'low',
      category: 'Missing Security Tooling',
      title: 'No audit/security script defined',
      description: 'Adding an audit script makes dependency vulnerability scanning a routine part of the workflow.',
      fixSnippet: `"scripts": {
  "audit": "npm audit --audit-level=moderate"
}`,
      sourceFile: 'package.json',
    });
  }

  for (const name of Object.keys(pkg.dependencies ?? {})) {
    if (DEV_ONLY_TOOLS.has(name)) {
      findings.push({
        id: `pkg-devtool-in-deps-${name}`,
        severity: 'medium',
        category: 'Misplaced Dependency',
        title: `${name} is a dev tool listed in dependencies`,
        description: `${name} is typically only needed during development and should not ship in production dependencies.`,
        fixSnippet: `"devDependencies": {
  "${name}": "${pkg.dependencies?.[name]}"
}`,
        sourceFile: 'package.json',
      });
    }
  }

  return findings;
}
```

- [ ] **Step 3: Write scratch verification script**

Create temporary file `scripts/tmp-verify-package.mts` (not committed):

```ts
import { analyzePackageJson } from '../src/engine/analyzers/packageJsonAnalyzer';

let failed = false;

const vulnerablePkg = JSON.stringify({
  dependencies: { lodash: '4.17.20', nodemon: '3.0.0' },
  scripts: {},
});
const findings = analyzePackageJson(vulnerablePkg);

if (!findings.some((f) => f.id === 'pkg-vuln-lodash')) {
  console.error('FAIL: expected lodash vulnerability finding');
  failed = true;
}
if (!findings.some((f) => f.id === 'pkg-missing-audit-script')) {
  console.error('FAIL: expected missing audit script finding');
  failed = true;
}
if (!findings.some((f) => f.id === 'pkg-devtool-in-deps-nodemon')) {
  console.error('FAIL: expected nodemon misplaced dependency finding');
  failed = true;
}

const cleanPkg = JSON.stringify({
  dependencies: { lodash: '4.17.21' },
  devDependencies: { nodemon: '3.0.0' },
  scripts: { audit: 'npm audit' },
});
const cleanFindings = analyzePackageJson(cleanPkg);
if (cleanFindings.length !== 0) {
  console.error('FAIL: expected 0 findings for clean package.json, got', cleanFindings.length);
  failed = true;
}

if (failed) process.exit(1);
console.log('All packageJsonAnalyzer cases passed.');
```

- [ ] **Step 4: Run verification**

Run: `npx --yes tsx scripts/tmp-verify-package.mts`
Expected: `All packageJsonAnalyzer cases passed.`

- [ ] **Step 5: Delete scratch script**

Run: `rm scripts/tmp-verify-package.mts`

- [ ] **Step 6: Commit**

```bash
git add src/engine/knownVulnerablePackages.ts src/engine/analyzers/packageJsonAnalyzer.ts
git commit -m "feat: add package.json dependency and script analyzer"
```

---

## Task 6: Dockerfile Analyzer

**Files:**
- Create: `src/engine/analyzers/dockerfileAnalyzer.ts`

**Interfaces:**
- Consumes: `Finding` from `src/engine/types.ts`.
- Produces: `analyzeDockerfile(content: string): Finding[]` (never throws — plain text parsing).

- [ ] **Step 1: Create `src/engine/analyzers/dockerfileAnalyzer.ts`**

```ts
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
```

- [ ] **Step 2: Write scratch verification script**

Create temporary file `scripts/tmp-verify-dockerfile.mts` (not committed):

```ts
import { analyzeDockerfile } from '../src/engine/analyzers/dockerfileAnalyzer';

let failed = false;

const insecure = 'FROM node:latest\nRUN npm install';
const insecureFindings = analyzeDockerfile(insecure);
if (!insecureFindings.some((f) => f.id === 'docker-root-user')) {
  console.error('FAIL: expected root user finding');
  failed = true;
}
if (!insecureFindings.some((f) => f.id === 'docker-latest-tag')) {
  console.error('FAIL: expected latest tag finding');
  failed = true;
}

const secure = 'FROM node:20.11.1-alpine\nUSER appuser';
const secureFindings = analyzeDockerfile(secure);
if (secureFindings.length !== 0) {
  console.error('FAIL: expected 0 findings for secure Dockerfile, got', secureFindings.length);
  failed = true;
}

if (failed) process.exit(1);
console.log('All dockerfileAnalyzer cases passed.');
```

- [ ] **Step 3: Run verification**

Run: `npx --yes tsx scripts/tmp-verify-dockerfile.mts`
Expected: `All dockerfileAnalyzer cases passed.`

- [ ] **Step 4: Delete scratch script**

Run: `rm scripts/tmp-verify-dockerfile.mts`

- [ ] **Step 5: Commit**

```bash
git add src/engine/analyzers/dockerfileAnalyzer.ts
git commit -m "feat: add Dockerfile root-user and latest-tag analyzer"
```

---

## Task 7: Gitignore Analyzer & Analyzer Registry

**Files:**
- Create: `src/engine/analyzers/gitignoreAnalyzer.ts`
- Create: `src/engine/analyzers/index.ts`

**Interfaces:**
- Consumes: `Finding`, `Analyzer`, `FileType` from `src/engine/types.ts`; all four analyzer functions from Tasks 4-7.
- Produces: `analyzeGitignore(content: string): Finding[]`; `analyzerRegistry: Partial<Record<FileType, Analyzer>>`.

- [ ] **Step 1: Create `src/engine/analyzers/gitignoreAnalyzer.ts`**

```ts
import type { Finding } from '../types';

export function analyzeGitignore(content: string): Finding[] {
  const lines = content.split('\n').map((line) => line.trim());
  const findings: Finding[] = [];

  const hasEnvRule = lines.some((line) => line.startsWith('.env'));
  if (!hasEnvRule) {
    findings.push({
      id: 'gitignore-missing-env',
      severity: 'critical',
      category: 'Secret Exposure',
      title: 'No .env exclusion rule',
      description: 'Without ignoring .env files, environment secrets can be committed to version control.',
      fixSnippet: `.env
.env.local
.env.*.local`,
      sourceFile: '.gitignore',
    });
  }

  const hasNodeModulesRule = lines.some((line) => line === 'node_modules' || line === 'node_modules/');
  if (!hasNodeModulesRule) {
    findings.push({
      id: 'gitignore-missing-node-modules',
      severity: 'low',
      category: 'Repository Hygiene',
      title: 'No node_modules exclusion rule',
      description: 'Committing node_modules bloats the repository and can introduce inconsistent installs.',
      fixSnippet: 'node_modules/',
      sourceFile: '.gitignore',
    });
  }

  const hasKeyRule = lines.some((line) => /\*\.(pem|key)$/.test(line));
  if (!hasKeyRule) {
    findings.push({
      id: 'gitignore-missing-keys',
      severity: 'medium',
      category: 'Secret Exposure',
      title: 'No *.pem/*.key exclusion rule',
      description: 'Private key files should never be tracked in version control.',
      fixSnippet: `*.pem
*.key`,
      sourceFile: '.gitignore',
    });
  }

  return findings;
}
```

- [ ] **Step 2: Create `src/engine/analyzers/index.ts`**

```ts
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
```

- [ ] **Step 3: Write scratch verification script**

Create temporary file `scripts/tmp-verify-registry.mts` (not committed):

```ts
import { analyzeGitignore } from '../src/engine/analyzers/gitignoreAnalyzer';
import { analyzerRegistry } from '../src/engine/analyzers/index';

let failed = false;

const emptyGitignore = analyzeGitignore('');
if (emptyGitignore.length !== 3) {
  console.error('FAIL: expected 3 findings for empty .gitignore, got', emptyGitignore.length);
  failed = true;
}

const fullGitignore = analyzeGitignore('.env\nnode_modules/\n*.pem');
if (fullGitignore.length !== 0) {
  console.error('FAIL: expected 0 findings for complete .gitignore, got', fullGitignore.length);
  failed = true;
}

const expectedKeys = ['vercelJson', 'packageJson', 'dockerfile', 'gitignore'];
for (const key of expectedKeys) {
  if (!(key in analyzerRegistry)) {
    console.error(`FAIL: analyzerRegistry missing key ${key}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('All gitignoreAnalyzer/registry cases passed.');
```

- [ ] **Step 4: Run verification**

Run: `npx --yes tsx scripts/tmp-verify-registry.mts`
Expected: `All gitignoreAnalyzer/registry cases passed.`

- [ ] **Step 5: Delete scratch script**

Run: `rm scripts/tmp-verify-registry.mts`

- [ ] **Step 6: Commit**

```bash
git add src/engine/analyzers/gitignoreAnalyzer.ts src/engine/analyzers/index.ts
git commit -m "feat: add .gitignore analyzer and analyzer registry"
```

---

## Task 8: useAnalysis Hook

**Files:**
- Create: `src/hooks/useAnalysis.ts`

**Interfaces:**
- Consumes: `detectFileType` (Task 2), `analyzerRegistry` (Task 7), `buildAnalysisResult` (Task 3), `AnalyzedFile`/`AnalysisResult`/`Finding`/`FileType` types (Task 2).
- Produces: `FileAnalysis` interface (`{ file: AnalyzedFile; findings: Finding[]; parseError: string | null }`); `useAnalysis(): { fileAnalyses: FileAnalysis[]; result: AnalysisResult; addFile: (filename: string, content: string) => void; removeFile: (id: string) => void }`.

- [ ] **Step 1: Create `src/hooks/useAnalysis.ts`**

```ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnalysisResult, AnalyzedFile, Finding } from '../engine/types';
import { detectFileType } from '../engine/detectFileType';
import { analyzerRegistry } from '../engine/analyzers';
import { buildAnalysisResult } from '../engine/scoring';

const STORAGE_KEY = 'config-audit:last-result';
const EMPTY_RESULT: AnalysisResult = { score: 100, findings: [], counts: { critical: 0, medium: 0, low: 0 } };

export interface FileAnalysis {
  file: AnalyzedFile;
  findings: Finding[];
  parseError: string | null;
}

interface UseAnalysisReturn {
  fileAnalyses: FileAnalysis[];
  result: AnalysisResult;
  addFile: (filename: string, content: string) => void;
  removeFile: (id: string) => void;
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadStoredResult(): AnalysisResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AnalysisResult;
  } catch {
    // localStorage unavailable (e.g. private browsing) - fall back to empty result
  }
  return EMPTY_RESULT;
}

function analyzeSingleFile(file: AnalyzedFile): FileAnalysis {
  const analyzer = analyzerRegistry[file.fileType];
  if (!analyzer) {
    return {
      file,
      findings: [],
      parseError: file.fileType === 'unknown' ? 'Could not detect file type.' : null,
    };
  }

  try {
    return { file, findings: analyzer(file.content), parseError: null };
  } catch {
    return { file, findings: [], parseError: 'Failed to parse file content.' };
  }
}

export function useAnalysis(): UseAnalysisReturn {
  const [files, setFiles] = useState<AnalyzedFile[]>([]);
  const [result, setResult] = useState<AnalysisResult>(loadStoredResult);
  const isFirstRender = useRef(true);

  const addFile = useCallback((filename: string, content: string) => {
    const fileType = detectFileType(filename, content);
    setFiles((prev) => [...prev, { id: createId(), filename, content, fileType }]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const fileAnalyses = useMemo<FileAnalysis[]>(() => files.map(analyzeSingleFile), [files]);

  useEffect(() => {
    // On the very first render with no files loaded, keep showing the result
    // restored from localStorage instead of resetting it to the empty state.
    // Every subsequent change to `files` (including removing the last one)
    // recomputes live, since only the AnalysisResult - not the files - persists.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (files.length === 0) return;
    }

    const allFindings = fileAnalyses.flatMap((entry) => entry.findings);
    const nextResult = buildAnalysisResult(allFindings);
    setResult(nextResult);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextResult));
    } catch {
      // localStorage unavailable (e.g. private browsing) - persistence is best-effort
    }
  }, [fileAnalyses, files.length]);

  return { fileAnalyses, result, addFile, removeFile };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAnalysis.ts
git commit -m "feat: add useAnalysis hook orchestrating detection, analysis, and persistence"
```

---

## Task 9: FileDropzone + FileCard + App Wiring

**Files:**
- Create: `src/components/FileDropzone.tsx`
- Create: `src/components/FileCard.tsx`
- Modify: `src/App.tsx` (replace placeholder with dropzone + file list wiring)

**Interfaces:**
- Consumes: `useAnalysis` (Task 8), `FileType` from `src/engine/types.ts`.
- Produces: `FileDropzone({ onAddFile: (filename: string, content: string) => void })`; `FileCard({ filename, fileType, parseError, findingCount, onRemove })`.

- [ ] **Step 1: Create `src/components/FileDropzone.tsx`**

```tsx
import { useCallback, useState, type DragEvent } from 'react';
import { FilePlus2, UploadCloud } from 'lucide-react';

interface FileDropzoneProps {
  onAddFile: (filename: string, content: string) => void;
}

export function FileDropzone({ onAddFile }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pastedContent, setPastedContent] = useState('');

  const readFiles = useCallback(
    (fileList: FileList) => {
      Array.from(fileList).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => onAddFile(file.name, String(reader.result ?? ''));
        reader.readAsText(file);
      });
    },
    [onAddFile],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files.length > 0) readFiles(event.dataTransfer.files);
    },
    [readFiles],
  );

  const handlePasteSubmit = useCallback(() => {
    if (pastedContent.trim().length === 0) return;
    onAddFile('pasted-content', pastedContent);
    setPastedContent('');
  }, [pastedContent, onAddFile]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
          isDragging ? 'border-emerald-400 bg-emerald-950/20' : 'border-slate-700 bg-slate-900/40'
        }`}
      >
        <UploadCloud className="mb-3 h-10 w-10 text-slate-400" />
        <p className="text-sm text-slate-300">Drag & drop vercel.json, package.json, Dockerfile, or .gitignore</p>
        <label className="mt-3 cursor-pointer text-sm text-emerald-400 hover:text-emerald-300">
          or browse files
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) readFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
          <FilePlus2 className="h-4 w-4" />
          Or paste file content
        </div>
        <textarea
          value={pastedContent}
          onChange={(event) => setPastedContent(event.target.value)}
          placeholder="Paste the raw file content here..."
          rows={4}
          className="w-full resize-y rounded border border-slate-700 bg-slate-950 p-2 font-mono text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handlePasteSubmit}
          className="mt-2 rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Analyze pasted content
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/FileCard.tsx`**

```tsx
import { FileCode2, FileJson, FileWarning, X } from 'lucide-react';
import type { FileType } from '../engine/types';

interface FileCardProps {
  filename: string;
  fileType: FileType;
  parseError: string | null;
  findingCount: number;
  onRemove: () => void;
}

const FILE_TYPE_LABELS: Record<FileType, string> = {
  vercelJson: 'vercel.json',
  packageJson: 'package.json',
  dockerfile: 'Dockerfile',
  gitignore: '.gitignore',
  unknown: 'Unrecognized',
};

export function FileCard({ filename, fileType, parseError, findingCount, onRemove }: FileCardProps) {
  const Icon = fileType === 'dockerfile' ? FileCode2 : fileType === 'unknown' ? FileWarning : FileJson;

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-200">{filename}</p>
          <p className="text-xs text-slate-500">{FILE_TYPE_LABELS[fileType]}</p>
          {parseError && <p className="mt-1 text-xs text-red-400">{parseError}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!parseError && (
          <span className="text-xs text-slate-400">
            {findingCount} finding{findingCount === 1 ? '' : 's'}
          </span>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-500 hover:text-red-400"
          aria-label={`Remove ${filename}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Modify `src/App.tsx`**

```tsx
import { ShieldCheck } from 'lucide-react';
import { FileDropzone } from './components/FileDropzone';
import { FileCard } from './components/FileCard';
import { useAnalysis } from './hooks/useAnalysis';

export function App() {
  const { fileAnalyses, addFile, removeFile } = useAnalysis();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold">Config Security Audit</h1>
            <p className="text-sm text-slate-400">
              Static security analysis for vercel.json, package.json, Dockerfile, and .gitignore.
            </p>
          </div>
        </header>

        <FileDropzone onAddFile={addFile} />

        {fileAnalyses.length > 0 && (
          <div className="space-y-2">
            {fileAnalyses.map(({ file, findings, parseError }) => (
              <FileCard
                key={file.id}
                filename={file.filename}
                fileType={file.fileType}
                parseError={parseError}
                findingCount={findings.length}
                onRemove={() => removeFile(file.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev`, open the printed local URL.
Paste this into the textarea and click "Analyze pasted content": `{"dependencies":{"lodash":"4.17.20"}}`
Expected: a `FileCard` appears labeled "package.json" showing "1 finding". Remove it with the X button and confirm it disappears.

- [ ] **Step 5: Commit**

```bash
git add src/components/FileDropzone.tsx src/components/FileCard.tsx src/App.tsx
git commit -m "feat: wire file dropzone and file list into App"
```

---

## Task 10: ScoreGauge + SeverityBreakdown + App Wiring

**Files:**
- Create: `src/components/ScoreGauge.tsx`
- Create: `src/components/SeverityBreakdown.tsx`
- Modify: `src/App.tsx` (add score dashboard row)

**Interfaces:**
- Consumes: `result: AnalysisResult` from `useAnalysis` (Task 8).
- Produces: `ScoreGauge({ score: number })`; `SeverityBreakdown({ counts: { critical: number; medium: number; low: number } })`.

- [ ] **Step 1: Create `src/components/ScoreGauge.tsx`**

```tsx
interface ScoreGaugeProps {
  score: number;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="78" textAnchor="middle" fontSize="32" fontWeight="700" fill="white">
          {score}
        </text>
      </svg>
      <p className="mt-2 text-sm text-slate-400">Security Score</p>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/SeverityBreakdown.tsx`**

```tsx
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface SeverityBreakdownProps {
  counts: { critical: number; medium: number; low: number };
}

export function SeverityBreakdown({ counts }: SeverityBreakdownProps) {
  const items = [
    { label: 'Critical', value: counts.critical, Icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-950/40' },
    { label: 'Medium', value: counts.medium, Icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-950/40' },
    { label: 'Low', value: counts.low, Icon: Info, color: 'text-sky-400', bg: 'bg-sky-950/40' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, Icon, color, bg }) => (
        <div key={label} className={`rounded-lg border border-slate-800 ${bg} p-3 text-center`}>
          <Icon className={`mx-auto mb-1 h-5 w-5 ${color}`} />
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Modify `src/App.tsx`** — add score dashboard row after the file list block, before the closing `</div></div>`

```tsx
import { ShieldCheck } from 'lucide-react';
import { FileDropzone } from './components/FileDropzone';
import { FileCard } from './components/FileCard';
import { ScoreGauge } from './components/ScoreGauge';
import { SeverityBreakdown } from './components/SeverityBreakdown';
import { useAnalysis } from './hooks/useAnalysis';

export function App() {
  const { fileAnalyses, result, addFile, removeFile } = useAnalysis();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold">Config Security Audit</h1>
            <p className="text-sm text-slate-400">
              Static security analysis for vercel.json, package.json, Dockerfile, and .gitignore.
            </p>
          </div>
        </header>

        <FileDropzone onAddFile={addFile} />

        {fileAnalyses.length > 0 && (
          <div className="space-y-2">
            {fileAnalyses.map(({ file, findings, parseError }) => (
              <FileCard
                key={file.id}
                filename={file.filename}
                fileType={file.fileType}
                parseError={parseError}
                findingCount={findings.length}
                onRemove={() => removeFile(file.id)}
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto,1fr]">
          <div className="flex justify-center md:justify-start">
            <ScoreGauge score={result.score} />
          </div>
          <SeverityBreakdown counts={result.counts} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev` (if not already running).
Paste `{"dependencies":{"lodash":"4.17.20"}}` and analyze.
Expected: `ScoreGauge` shows `85`. `SeverityBreakdown` shows Critical: 1, Medium: 0, Low: 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/ScoreGauge.tsx src/components/SeverityBreakdown.tsx src/App.tsx
git commit -m "feat: add score gauge and severity breakdown dashboard"
```

---

## Task 11: CodeSnippet + FindingsList + Final App Wiring

**Files:**
- Create: `src/components/CodeSnippet.tsx`
- Create: `src/components/FindingsList.tsx`
- Modify: `src/App.tsx` (add findings list, completing the full app)

**Interfaces:**
- Consumes: `Finding`, `Severity` from `src/engine/types.ts`; `result.findings` from `useAnalysis` (Task 8).
- Produces: `CodeSnippet({ code: string })`; `FindingsList({ findings: Finding[] })`.

- [ ] **Step 1: Create `src/components/CodeSnippet.tsx`**

```tsx
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
}

export function CodeSnippet({ code }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied - nothing to recover, user can select text manually
    }
  };

  return (
    <div className="relative rounded border border-slate-700 bg-slate-950">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded bg-slate-800 p-1.5 text-slate-400 hover:text-emerald-400"
        aria-label="Copy fix snippet"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre className="overflow-x-auto p-3 pr-10 font-mono text-xs text-slate-200">{code}</pre>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/FindingsList.tsx`**

```tsx
import { CodeSnippet } from './CodeSnippet';
import type { Finding, Severity } from '../engine/types';

interface FindingsListProps {
  findings: Finding[];
}

const SEVERITY_ORDER: Severity[] = ['critical', 'medium', 'low'];
const SEVERITY_LABELS: Record<Severity, string> = { critical: 'Critical', medium: 'Medium', low: 'Low' };
const SEVERITY_BORDER: Record<Severity, string> = {
  critical: 'border-red-500/40',
  medium: 'border-amber-500/40',
  low: 'border-sky-500/40',
};

export function FindingsList({ findings }: FindingsListProps) {
  if (findings.length === 0) {
    return <p className="text-sm text-slate-500">No findings yet. Add a configuration file to begin.</p>;
  }

  return (
    <div className="space-y-3">
      {SEVERITY_ORDER.flatMap((severity) =>
        findings
          .filter((finding) => finding.severity === severity)
          .map((finding) => (
            <details key={finding.id} className={`rounded-lg border ${SEVERITY_BORDER[severity]} bg-slate-900/60 p-4`}>
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-100">{finding.title}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {SEVERITY_LABELS[severity]} · {finding.sourceFile}
                  </span>
                </div>
              </summary>
              <div className="mt-3 space-y-3">
                <p className="text-sm text-slate-400">{finding.description}</p>
                <CodeSnippet code={finding.fixSnippet} />
              </div>
            </details>
          )),
      )}
    </div>
  );
}
```

- [ ] **Step 3: Modify `src/App.tsx`** — add `FindingsList` after the dashboard row

```tsx
import { ShieldCheck } from 'lucide-react';
import { FileDropzone } from './components/FileDropzone';
import { FileCard } from './components/FileCard';
import { ScoreGauge } from './components/ScoreGauge';
import { SeverityBreakdown } from './components/SeverityBreakdown';
import { FindingsList } from './components/FindingsList';
import { useAnalysis } from './hooks/useAnalysis';

export function App() {
  const { fileAnalyses, result, addFile, removeFile } = useAnalysis();

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold">Config Security Audit</h1>
            <p className="text-sm text-slate-400">
              Static security analysis for vercel.json, package.json, Dockerfile, and .gitignore.
            </p>
          </div>
        </header>

        <FileDropzone onAddFile={addFile} />

        {fileAnalyses.length > 0 && (
          <div className="space-y-2">
            {fileAnalyses.map(({ file, findings, parseError }) => (
              <FileCard
                key={file.id}
                filename={file.filename}
                fileType={file.fileType}
                parseError={parseError}
                findingCount={findings.length}
                onRemove={() => removeFile(file.id)}
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto,1fr]">
          <div className="flex justify-center md:justify-start">
            <ScoreGauge score={result.score} />
          </div>
          <SeverityBreakdown counts={result.counts} />
        </div>

        <FindingsList findings={result.findings} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev` (if not already running).
Paste `{"dependencies":{"lodash":"4.17.20"}}` and analyze.
Expected: `FindingsList` shows one Critical entry "lodash@4.17.20 is below known-safe version". Expand it, click the copy icon on the `CodeSnippet`, confirm the icon switches to a checkmark briefly, and paste elsewhere to confirm `"lodash": "^4.17.21"` was copied.

- [ ] **Step 5: Commit**

```bash
git add src/components/CodeSnippet.tsx src/components/FindingsList.tsx src/App.tsx
git commit -m "feat: add findings list with copyable fix snippets, completing the dashboard"
```

---

## Task 12: End-to-End Verification & Documentation

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: the complete app from Tasks 1-11.
- Produces: nothing new — this task is verification plus a project README.

- [ ] **Step 1: Create `README.md`**

```markdown
# Config Security Audit Tool

Client-side static security auditor for `vercel.json`, `package.json`,
`Dockerfile`, and `.gitignore`. Drag and drop files or paste their
contents; the tool detects the file type, runs the matching analyzer,
and shows a 0-100 security score with copy-ready fixes.

Everything runs in the browser — no backend, no network calls, no
telemetry.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Design

See `docs/superpowers/specs/2026-09-05-config-security-audit-tool-design.md`.
```

- [ ] **Step 2: Full build check**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

- [ ] **Step 3: End-to-end manual walkthrough against spec success criteria**

Run: `npm run preview`, open the printed URL, and verify each in the browser:

1. Paste a `vercel.json` with an empty `headers` array → 4 Critical/Medium findings appear for HSTS, CSP, X-Frame-Options, X-Content-Type-Options.
2. Paste a `package.json` with `{"dependencies":{"axios":"1.0.0","nodemon":"3.0.0"},"scripts":{}}` → Critical axios finding, Medium nodemon finding, Low missing-audit-script finding.
3. Paste a Dockerfile `FROM ubuntu\nRUN apt-get update` → Critical root-user finding, Medium unpinned-tag finding.
4. Paste `.gitignore` content `dist/` → Critical missing-`.env`, Low missing-`node_modules`, Medium missing-`*.pem/*.key` findings.
5. With all four loaded, confirm the `ScoreGauge` and `SeverityBreakdown` reflect the combined total across all files.
6. Remove one file via its `FileCard` X button and confirm the score and findings recompute immediately.
7. Reload the page and confirm the score/severity/findings from before the reload are still shown (the file list itself is empty again — only the last `AnalysisResult`, not the files, is persisted to `localStorage`). Adding or removing any file after reload immediately recomputes and overwrites that stored result.
8. Paste invalid JSON as `package.json` → confirm a red parse-error banner appears on that file's card and it contributes no findings, while other loaded files are unaffected.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add project README"
```
