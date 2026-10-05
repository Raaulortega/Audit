# Config Security Audit Tool

A multi-page, client-side security toolkit for web developers. Built with
React, React Router and Vite. Everything runs in the browser — no backend,
no network calls, no telemetry — so you can safely drop in configs, logs
and tokens.

## Pages

| Route | Page | What it does |
| --- | --- | --- |
| `/` | Overview | Dashboard with your last score and links into every tool. |
| `/scanner` | Config scanner | Audits config files against 80+ rules; save scans to history. |
| `/history` | Scan history | Tracks the score over time and diffs two scans (fixed vs. introduced). |
| `/secrets` | Secret scanner | Highlights credentials in any pasted text and emits a redacted copy. |
| `/jwt` | JWT inspector | Decodes a token, audits its claims, and verifies an HMAC signing secret. |
| `/headers` | Header builder | Interactive builder exporting to Vercel, nginx, Netlify, Apache or Express. |
| `/passwords` | Password lab | Password strength/crack-time estimate and CSPRNG secret/passphrase generators. |
| `/rules` | Rule catalog | Every detection rule with severity and CWE/OWASP mapping. |

## What the scanner checks

| File | Checks |
| --- | --- |
| Any file | Secret scanner: private keys, AWS/GitHub/GitLab/Slack/Stripe/Google/OpenAI/Anthropic/npm/SendGrid tokens, JWTs, credentials in connection URLs, high-entropy generic secrets (values are masked in the report) |
| `vercel.json` | Missing security headers, permissive CSP, short HSTS, wildcard CORS (critical with credentials), `X-Powered-By` |
| `package.json` | Known-vulnerable versions, compromised releases (event-stream, ua-parser-js, colors…), typosquats, HTTP/git sources, unbounded ranges, suspicious install hooks |
| `Dockerfile` | Root user, unpinned base image, secrets in `ENV`/`ARG`, `ADD` from URL, `curl \| sh`, `chmod 777`, `sudo`, SSH port, `COPY .`, missing `HEALTHCHECK` |
| `.gitignore` | Missing `.env`/key/credential exclusions, `!.env` negations |
| `.env` | Server secrets behind public prefixes (`NEXT_PUBLIC_`, `VITE_`…), default passwords, short signing secrets, debug mode, disabled TLS verification, `sslmode=disable`, wildcard CORS |
| `docker-compose.yml` | `privileged`, Docker socket and host-path mounts, dangerous capabilities, host namespaces, unconfined seccomp/AppArmor, databases published on `0.0.0.0`, default passwords |
| `nginx.conf` | Deprecated TLS/weak ciphers, alias off-by-slash path traversal, `autoindex`, `server_tokens`, HTTP-only, missing headers, wildcard CORS |

Findings carry line numbers and CWE/OWASP references, and can be
exported as Markdown, JSON or SARIF 2.1.0 (upload to GitHub code
scanning with `github/codeql-action/upload-sarif`).

## Development

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Build

```bash
npm run build
npm run preview
```

## Design

See `docs/superpowers/specs/2026-09-05-config-security-audit-tool-design.md`.
