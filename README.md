# LocalAudit

**Security toolkit that never leaves your browser** — <https://localaudit.dev>

A multi-page, client-side security toolkit for web developers. Built with
React, React Router and Vite. Everything runs in the browser — no backend,
no network calls, no telemetry — so you can safely drop in configs, logs
and tokens.

## Pages

| Route | Page | What it does |
| --- | --- | --- |
| `/` | Overview | Dashboard with your last score and links into every tool. |
| `/scanner` | Config scanner | Audits config files against 75+ rules; every scan is auto-saved to history. |
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

## Languages and persistence

The UI is available in English and Spanish (switcher in the sidebar or the
mobile header; defaults to the browser language). Rule titles and finding
details stay in English, the language of CWE/OWASP.

Without a backend, state lives in the browser: the loaded files in IndexedDB (large quota), everything else in `localStorage`:

| Storage | Contents |
| --- | --- |
| IndexedDB `config-audit` → `scanner` | Files loaded in the scanner, so a reload (F5) restores the scan |
| `config-audit:history` | Scan history (max 50 entries) |
| `config-audit:active-scan` | Which history entry mirrors the files currently loaded |
| `config-audit:lang` | Chosen language |

Files larger than 5 MB are rejected. Loaded files can contain secrets:
"Clear all" in the scanner and history removes them from the browser.

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

## Deploy

`npm run build` builds the client, then an SSR bundle
(`src/entry-server.tsx`), and `scripts/prerender.mjs` writes one static
HTML file per page and language (`index.html`, `scanner.html`,
`es.html`, `es/scanner.html`, …) plus `404.html`, `sitemap.xml` and
`robots.txt`. The browser hydrates that HTML, so crawlers and link
previews get the full content and `<head>` without running JavaScript.

`vercel.json` serves those files without the `.html` extension
(`cleanUrls`), sets the security headers (CSP, HSTS, framing, COOP/CORP)
and long-lived caching for hashed assets. The site URL defaults to
`https://localaudit.dev`; override it with the `SITE_URL` environment
variable. Fill in `SITE_OWNER` in `src/data/legalContent.ts` for the
Legal Notice.

## SEO

- One URL per language: English at `/…`, Spanish at `/es/…`, linked with
  `hreflang` (plus `x-default`) in the `<head>` and in `sitemap.xml`.
- Per-page title, description, canonical, Open Graph/Twitter tags and
  JSON-LD (`WebSite`, `WebApplication`, `FAQPage`, `BreadcrumbList`),
  all defined in `src/i18n/{en,es}.ts` and `src/seo/seo.ts`; tests keep
  titles ≤ 60 and descriptions ≤ 160 characters.
- `/history` (personal data) and unknown URLs are `noindex`; unknown URLs
  return a real 404.
- Icons: `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, PWA
  manifest with regular and maskable icons, Open Graph image per language.

## Design

See `docs/superpowers/specs/2026-09-05-config-security-audit-tool-design.md`.
