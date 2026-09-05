# Config Security Audit Tool — Design Spec

Date: 2026-09-05

## Purpose

A client-side single-page web application, embedded in a portfolio, that
statically analyzes common configuration files (`vercel.json`,
`package.json`, `Dockerfile`, `.gitignore`) for security misconfigurations.
Users drag-and-drop or paste file contents; the tool detects file type,
runs the matching analyzer, and renders a security score, severity
breakdown, and copy-ready fixed code snippets.

No backend, no network calls, no telemetry. All analysis runs in the
browser against static, hardcoded rule sets.

## Success Criteria

- Detects missing security headers in `vercel.json` (HSTS, CSP,
  X-Frame-Options, X-Content-Type-Options).
- Detects insecure/known-vulnerable dependencies, missing security
  scripts, and stale versions in `package.json` against a static
  dictionary.
- Detects missing non-root `USER` and unpinned `:latest` tags in a
  `Dockerfile`.
- Detects missing `.env`/secret-file exclusions in `.gitignore`.
- Combines findings from all uploaded files into one 0–100 score and a
  Critical/Medium/Low breakdown.
- Every finding includes a fixed code snippet the user can copy.
- Dark, minimal, professional visual design suitable for a portfolio.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS (dark theme)
- lucide-react for icons
- No backend, no test framework included (not requested; engine is
  pure functions so it stays independently testable later if needed)

## Architecture

```
src/
  engine/                       # pure logic, no React, framework-agnostic
    types.ts                    # Finding, Severity, FileType, AnalysisResult
    detectFileType.ts           # filename + content heuristics
    scoring.ts                  # aggregates Finding[] -> score 0-100
    knownVulnerablePackages.ts  # static dict: package -> min safe version
    analyzers/
      vercelAnalyzer.ts
      packageJsonAnalyzer.ts
      dockerfileAnalyzer.ts
      gitignoreAnalyzer.ts
      index.ts                  # registry: FileType -> analyzer fn
  components/
    FileDropzone.tsx            # drag&drop + paste-textarea toggle
    FileCard.tsx                # per-file badge, parse-error banner, remove button
    ScoreGauge.tsx               # radial 0-100 score, color-coded
    SeverityBreakdown.tsx       # Critical/Medium/Low counts
    FindingsList.tsx             # grouped, expandable findings
    CodeSnippet.tsx               # copyable fixed-code block
  hooks/
    useAnalysis.ts               # orchestrates detect -> analyze -> score, localStorage persist
  App.tsx
  main.tsx
```

### Analyzer Contract

Each analyzer is a pure function:

```ts
type Analyzer = (content: string) => Finding[];
```

Analyzers never throw for malformed input — parse failures are caught
by the caller (`useAnalysis`) and surfaced as a per-file parse error,
not as a security `Finding`.

`engine/analyzers/index.ts` exposes a registry:

```ts
const analyzerRegistry: Record<FileType, Analyzer> = {
  vercelJson: analyzeVercelConfig,
  packageJson: analyzePackageJson,
  dockerfile: analyzeDockerfile,
  gitignore: analyzeGitignore,
};
```

### File Type Detection

`detectFileType(filename, content)`:

1. Match by filename first (`vercel.json`, `package.json`, `Dockerfile`,
   `.gitignore`, case-insensitive, ignoring path prefixes).
2. If filename is ambiguous or missing (pasted content with no name),
   fall back to content heuristics:
   - Valid JSON with `"headers"` or `"redirects"` keys → `vercelJson`.
   - Valid JSON with `"dependencies"` or `"scripts"` keys → `packageJson`.
   - Contains `FROM ` at line start → `dockerfile`.
   - Lines starting with `#` and glob-like patterns, no other match →
     `gitignore`.
3. Unrecognized content → `unknown`, shown as an error state on the
   `FileCard`, excluded from analysis and scoring.

## Analyzer Rules

### `vercelAnalyzer`

Parses `vercel.json`, inspects `headers[].headers[]` entries (applied
across all `source` route blocks). For each of the following, missing
→ one `Finding`:

- `Strict-Transport-Security` (missing → Critical)
- `Content-Security-Policy` (missing → Critical)
- `X-Frame-Options` (missing → Medium)
- `X-Content-Type-Options` (missing → Medium)

Each finding's `fixSnippet` includes the missing header block ready to
merge into the existing `headers` array. Malformed JSON → parse error,
no findings.

### `packageJsonAnalyzer`

Parses `package.json`:

- For each entry in `dependencies`/`devDependencies` matching a key in
  `knownVulnerablePackages` where the declared range resolves below
  the dict's minimum safe version → Critical finding with the safe
  version as `fixSnippet`.
- Missing `"audit"` or `"security"` script in `scripts` → Low finding
  suggesting `"audit": "npm audit --audit-level=moderate"`.
- `dependencies` containing a dev-only tool (e.g. `nodemon`,
  `webpack-dev-server`) → Medium finding recommending it move to
  `devDependencies`.

Malformed JSON → parse error, no findings.

### `dockerfileAnalyzer`

Line-by-line scan:

- No `USER <non-root>` instruction anywhere after the last `FROM` →
  Critical finding, fix snippet adds `USER appuser` (with a preceding
  `RUN adduser` example).
- Any `FROM image:latest` (or `FROM image` with no tag) → Medium
  finding, fix snippet pins an explicit version tag.

### `gitignoreAnalyzer`

Line-based check for missing common secret-exposure patterns:

- No `.env` (or `.env*`) entry → Critical finding.
- No `node_modules` entry → Low finding.
- No `*.pem` / `*.key` entry → Medium finding.

Fix snippet: the missing lines to append.

## Scoring

`computeScore(findings: Finding[]): number`

- Start at 100.
- Subtract per finding by severity: Critical −15, Medium −8, Low −3.
- Floor at 0 (never negative).
- Score, and Critical/Medium/Low counts, are recomputed from the
  combined `Finding[]` across all currently-loaded files every time
  the file set changes.

## UI / Data Flow

1. User drags a file or pastes content into `FileDropzone`.
2. New entry pushed to `files` state: `{ id, filename, content }`.
3. `useAnalysis` reacts to `files` changes: for each file, run
   `detectFileType`, then the matching analyzer (wrapped in try/catch
   for parse errors), collect `Finding[]` and any per-file parse error.
4. All findings combined → `computeScore` → `AnalysisResult` held in
   state and written to `localStorage` (key: `config-audit:last-result`)
   so the last analysis persists across reloads.
5. `ResultsDashboard` (composed of `ScoreGauge` + `SeverityBreakdown` +
   `FindingsList`) renders from `AnalysisResult`.
6. Each `Finding` in `FindingsList` expands to show description and a
   `CodeSnippet` with a copy-to-clipboard button.
7. Removing a `FileCard` removes its findings and triggers rescoring.

## Error Handling

- Parse failure (invalid JSON, empty content) on one file → red error
  banner on that file's `FileCard`; that file contributes zero
  findings and is excluded from scoring; other files unaffected.
- Unknown/unsupported file type → same treatment, banner says type
  could not be detected.
- `localStorage` write/read failures (e.g. private browsing) are
  caught and silently ignored — persistence is a convenience, not a
  requirement.

## Visual Design

Dark theme, minimal, professional:

- Near-black background, single accent color for score/branding.
- Severity color coding: Critical = red, Medium = amber, Low = blue/gray.
- Radial/circular gauge for the 0–100 score as the dashboard's focal
  point.
- Monospace font for all code snippets, syntax-neutral (no highlighting
  library — keeps bundle small).
- lucide-react icons for severity markers, file type badges, copy
  button, drag-and-drop zone.

## Out of Scope (YAGNI)

- No backend, no real npm registry lookups, no live CVE feeds.
- No authentication, no multi-user state, no file upload size limits
  beyond browser defaults.
- No automated test suite (not requested); engine kept as pure
  functions so tests can be added later without refactoring.
- No support for file types beyond the four specified.
