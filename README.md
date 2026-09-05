# Config Security Audit Tool

Client-side static security auditor for `vercel.json`, `package.json`,
`Dockerfile`, and `.gitignore`. Drag and drop files or paste their
contents; the tool detects the file type, runs the matching analyzer,
and shows a 0-100 security score with copy-ready fixes.

Everything runs in the browser — no backend, no network calls, no
telemetry.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Design

See `docs/superpowers/specs/2026-09-05-config-security-audit-tool-design.md`.
