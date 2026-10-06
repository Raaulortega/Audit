const plural = (count: number, one: string, other: string) => (count === 1 ? one : other);

export const en = {
  meta: {
    title: 'LocalAudit',
    htmlLang: 'en',
    dateLocale: 'en-US',
    ogLocale: 'en_US',
  },
  /** Search-result titles (≤ 60 chars) and descriptions (≤ 160 chars) per page. */
  seo: {
    pages: {
      '/': {
        title: 'LocalAudit — Free Security Toolkit That Runs in Your Browser',
        description:
          'Scan Dockerfile, .env, nginx and package.json for misconfigurations, find leaked API keys, decode JWTs and build security headers. Free, private, 100% local.',
      },
      '/scanner': {
        title: 'Config Scanner: Dockerfile, .env, nginx | LocalAudit',
        description:
          'Audit Dockerfile, docker-compose, nginx.conf, .env, package.json and vercel.json against 75+ CWE/OWASP rules. Runs in your browser; nothing is uploaded.',
      },
      '/history': {
        title: 'Scan History | LocalAudit',
        description: 'Your saved LocalAudit scans: track your security score over time and compare two scans.',
      },
      '/secrets': {
        title: 'Secret Scanner & Log Redactor Online | LocalAudit',
        description:
          'Find leaked API keys, tokens and passwords in logs or code, then copy a redacted version safe to share. Detects AWS, GitHub, Stripe, OpenAI keys and more.',
      },
      '/jwt': {
        title: 'JWT Decoder & Security Checker | LocalAudit',
        description:
          'Decode JSON Web Tokens and audit them for alg none, missing expiry and sensitive claims. Verify HS256 secrets locally: your token never leaves the browser.',
      },
      '/headers': {
        title: 'HTTP Security Headers Generator (CSP, HSTS) | LocalAudit',
        description:
          'Build Content-Security-Policy, HSTS, Permissions-Policy and more, then export ready-to-paste config for Vercel, nginx, Netlify, Apache or Express.',
      },
      '/passwords': {
        title: 'Password Strength Checker & Secret Generator | LocalAudit',
        description:
          'Estimate how long a password survives an offline attack and generate cryptographically secure secrets and passphrases. Nothing is sent anywhere.',
      },
      '/rules': {
        title: 'Security Rule Catalog with CWE & OWASP Mapping | LocalAudit',
        description:
          'Browse every check LocalAudit runs: 75+ rules for Docker, nginx, .env, npm and Vercel configs, each with its severity and CWE/OWASP references.',
      },
    } as Record<string, { title: string; description: string }>,
    notFound: {
      title: 'Page not found | LocalAudit',
      description: 'This page does not exist. Go back to the LocalAudit security toolkit.',
    },
    appDescription:
      'Free, privacy-first security toolkit that runs entirely in the browser: config scanner, secret scanner, JWT inspector, security header builder and password lab.',
    features: [
      'Security scanner for Dockerfile, docker-compose, nginx, .env, .gitignore, package.json and vercel.json',
      'Secret and API key detection with log redaction',
      'JWT decoder and security audit',
      'HTTP security header generator (CSP, HSTS, Permissions-Policy)',
      'Password strength estimation and secure secret generator',
      'SARIF, JSON and Markdown report export',
    ],
    breadcrumbHome: 'Home',
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        question: 'Is LocalAudit free?',
        answer: 'Yes. Every tool is free to use, with no account, no limits and no ads.',
      },
      {
        question: 'Are my files or secrets uploaded anywhere?',
        answer:
          'No. All analysis runs in your browser with JavaScript; there is no backend. Loaded files are kept in your browser storage so a reload does not lose your scan, and "Clear all" deletes them. Once the page has loaded it even works offline.',
      },
      {
        question: 'Which files can LocalAudit scan?',
        answer:
          'Dockerfile, docker-compose.yml, nginx.conf, .env, .gitignore, package.json and vercel.json get dedicated rules. Any other text file, up to 5 MB, is scanned for leaked secrets such as AWS, GitHub, Stripe or OpenAI keys.',
      },
      {
        question: 'How is the security score calculated?',
        answer:
          'Every scan starts at 100. Each finding subtracts points by severity: 15 for critical, 8 for medium and 3 for low. Findings are mapped to CWE and OWASP and come with a copy-ready fix.',
      },
      {
        question: 'Can I use the results in CI or GitHub?',
        answer:
          'Yes. Export a report as Markdown for pull requests, JSON for other tools, or SARIF 2.1.0 to upload to GitHub code scanning.',
      },
    ],
  },
  notFound: {
    eyebrow: '404',
    title: 'Page not found',
    body: 'The page you are looking for does not exist or has moved.',
    home: 'Back to the overview',
  },
  language: {
    label: 'Language',
    en: 'English',
    es: 'Español',
  },
  brand: {
    tagline: 'Security · 100% local',
    localTitle: '100% local',
    localBody: 'Files and secrets never leave your browser. No backend, no telemetry.',
  },
  layout: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mainNav: 'Main',
    loadingPage: 'Loading page',
    tabs: { overview: 'Overview', scanner: 'Scan', tools: 'Tools', history: 'History', rules: 'Rules' },
    toolsTitle: 'Toolkit',
  },
  nav: {
    groups: { Audit: 'Audit', Toolkit: 'Toolkit', Learn: 'Learn' },
    items: {
      '/': { label: 'Overview', description: 'Your security posture at a glance.' },
      '/scanner': {
        label: 'Config scanner',
        description: 'Audit Dockerfiles, compose files, nginx, .env, package.json and more against 75+ rules.',
      },
      '/history': {
        label: 'Scan history',
        description: 'Every scan is saved automatically. Track your score over time and diff two scans.',
      },
      '/secrets': {
        label: 'Secret scanner',
        description: 'Find API keys and tokens in any text, then redact them before sharing logs.',
      },
      '/jwt': {
        label: 'JWT inspector',
        description: 'Decode tokens, spot insecure claims and test them against weak signing secrets.',
      },
      '/headers': {
        label: 'Header builder',
        description: 'Design HTTP security headers and export them for Vercel, nginx, Netlify, Apache or Express.',
      },
      '/passwords': {
        label: 'Password lab',
        description: 'Estimate crack times and generate cryptographically secure secrets.',
      },
      '/rules': {
        label: 'Rule catalog',
        description: 'Browse every detection rule with its severity and CWE/OWASP mapping.',
      },
    } as Record<string, { label: string; description: string }>,
  },
  common: {
    clear: 'Clear',
    clearAll: 'Clear all',
    close: 'Close',
    loadSample: 'Load sample',
    regenerate: 'Regenerate',
    copied: 'Copied!',
    copyPatch: 'Copy patch',
    none: 'None',
    open: 'Open',
    severity: { critical: 'Critical', medium: 'Medium', low: 'Low', varies: 'Varies' },
  },
  footer: {
    rights: 'All analysis runs locally in your browser.',
    legal: 'Legal Notice',
    privacy: 'Privacy',
    cookies: 'Cookies',
  },
  cookieBanner: {
    text: 'No tracking cookies here — only local storage to keep your scans and preferences.',
    learnMore: 'Learn more',
    accept: 'Accept',
  },
  legal: {
    legal: {
      title: 'Legal Notice',
      paragraphs: [
        'LocalAudit is a security toolkit built for portfolio and educational purposes. It performs static analysis of configuration files entirely inside your browser.',
        'It is provided "as is", without warranty of any kind. No guarantee is made about the completeness or accuracy of the findings it reports, and it should not be treated as a substitute for a professional security review.',
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      paragraphs: [
        'This application does not collect or transmit any personal data. There is no backend: every file you drop or paste is analyzed locally in your browser and never leaves your device.',
        'To survive a page reload, the files you load in the scanner, your scan history and your preferences (language, notice dismissal) are stored in your browser\'s local storage on this device only. Files may contain secrets, so use "Clear all" in the scanner and history when you are done, especially on a shared computer.',
      ],
    },
    cookies: {
      title: 'Cookie Policy',
      paragraphs: [
        'This site does not use tracking cookies, advertising cookies, or third-party analytics of any kind.',
        'It uses your browser\'s local storage — not cookies — for strictly functional purposes: keeping your loaded files, scan history and preferences. You can delete it at any time by clearing your browser\'s site data.',
      ],
    },
    owner: 'Owner',
    contact: 'Contact',
    source: 'Source code',
  },
  errorBoundary: {
    title: 'Something went wrong',
    body: 'The page failed to load. This usually happens right after a new version is deployed.',
    reload: 'Reload page',
  },
  home: {
    badge: '100% client-side',
    title: 'A security toolkit for your configs, secrets and tokens',
    intro: (rules: number) =>
      `Scan deployment files against ${rules}+ rules, hunt for leaked credentials, inspect JWTs, build hardened HTTP headers and generate strong secrets — all without anything leaving your browser.`,
    startScan: 'Start a scan',
    browseRules: 'Browse the rules',
    stats: { lastScore: 'Last score', critical: 'Critical', files: 'Files loaded', saved: 'Saved scans' },
    whatYouCanDo: 'What you can do',
    whyTitle: 'Why client-side?',
    whyBody:
      'Security tooling that uploads your configs and secrets to a server creates the exact risk it is meant to reduce. Everything here runs in your browser with the Web Crypto API — no backend, no network calls, no telemetry. You can disconnect from the internet and it still works.',
  },
  scanner: {
    eyebrow: 'Audit',
    title: 'Config scanner',
    description:
      'Drop configuration files to get a 0–100 security score, findings mapped to CWE/OWASP, and copy-ready patches. Files are analyzed in memory and never uploaded.',
    filesAnalyzed: (count: number) => `${count} ${plural(count, 'file', 'files')} analyzed`,
    autoSaved: 'Auto-saved to history · kept after reload',
    storageFull: 'Too large to keep in this browser — these files will be lost on reload.',
    labelPlaceholder: 'Name this scan, e.g. “before hardening”',
    labelAria: 'Scan name',
    saveCheckpoint: 'Save checkpoint',
    saved: 'Saved',
    history: 'History',
  },
  dropzone: {
    dropHint: 'Drag & drop vercel.json, package.json, Dockerfile, .gitignore, .env, docker-compose.yml or nginx.conf',
    otherFiles: 'Any other text file is scanned for leaked secrets. Nothing leaves your browser.',
    browse: 'or browse files',
    pasteTitle: 'Or paste file content',
    pastePlaceholder: 'Paste the raw file content here...',
    analyzePasted: 'Analyze pasted content',
    tooLarge: (name: string, maxMb: number) => `${name} is larger than ${maxMb} MB and was skipped.`,
    unreadable: (name: string) => `${name} could not be read as text.`,
  },
  emptyState: {
    title: 'No configuration files analyzed yet',
    body: 'Drop a file above, paste raw content, or load a ready-made example below to see the audit engine in action.',
    tryExample: 'Try an example — no upload needed',
    presets: {
      'this-site': { label: 'This website', description: 'Our own vercel.json' },
      vercel: { label: 'vercel.json', description: 'Missing security headers' },
      package: { label: 'package.json', description: 'Vulnerable dependency' },
      dockerfile: { label: 'Dockerfile', description: 'Root user, unpinned tag' },
      gitignore: { label: '.gitignore', description: 'Secrets not excluded' },
      env: { label: '.env', description: 'Leaked & weak secrets' },
      compose: { label: 'docker-compose.yml', description: 'Privileged, exposed DB' },
      nginx: { label: 'nginx.conf', description: 'Old TLS, alias traversal' },
      'full-project': { label: 'Full project', description: 'All 7 files at once' },
    } as Record<string, { label: string; description: string }>,
  },
  fileCard: {
    genericType: 'Generic text · secret scan only',
    parseError: 'Failed to parse file content.',
    findings: (count: number) => `${count} ${plural(count, 'finding', 'findings')}`,
    remove: (name: string) => `Remove ${name}`,
  },
  score: {
    title: 'Security Score',
    strong: 'Strong posture',
    attention: 'Needs attention',
    critical: 'Critical exposure',
  },
  exportReport: {
    title: 'Export report',
    markdownHint: 'Share in a PR or ticket',
    jsonHint: 'Feed other tools',
    sarifHint: 'Upload to GitHub code scanning',
  },
  findings: {
    empty: 'No findings yet. Add a configuration file to begin.',
    search: 'Search findings',
    searchPlaceholder: 'Search title, file, CWE…',
    noMatch: 'No findings match the selected filters or search.',
  },
  history: {
    eyebrow: 'Audit',
    title: 'Scan history',
    emptyDescription: 'Every scan you run shows up here automatically.',
    emptyBody: 'No scans yet. Load files in the scanner — each scan is saved here automatically, even across reloads.',
    goToScanner: 'Go to the scanner →',
    description:
      'Every scan is saved automatically. Select two scans to see which findings were fixed and which were introduced. Stored only in this browser.',
    autoLabel: (files: string[]) =>
      files.length <= 2 ? `Scan of ${files.join(', ')}` : `Scan of ${files.length} files`,
    files: (count: number) => `${count} ${plural(count, 'file', 'files')}`,
    live: 'Current',
    select: (label: string) => `Select ${label}`,
    delete: (label: string) => `Delete ${label}`,
    comparison: 'Comparison',
    points: 'pts',
    fixed: 'Fixed',
    introduced: 'Introduced',
    stillOpen: 'Still open',
  },
  secrets: {
    eyebrow: 'Toolkit',
    title: 'Secret scanner & redactor',
    description:
      'Paste logs, stack traces, CI output or source code. Detected credentials are highlighted and you get a redacted copy that is safe to paste into a ticket, chat or AI assistant.',
    loadSample: 'Load sample log',
    input: 'Input',
    inputHint: (lines: number) => `${lines} ${plural(lines, 'line', 'lines')} · scanned locally`,
    placeholder: 'Paste any text…',
    inputAria: 'Text to scan for secrets',
    detected: (count: number) =>
      `${count} ${plural(count, 'secret', 'secrets')} detected. Rotate them — anything that reached a log should be treated as leaked.`,
    none: 'No known secret patterns detected.',
    mask: 'Mask values',
    reveal: 'Reveal values',
    highlighted: 'Highlighted input',
    detections: 'Detections',
    rotateHint: 'Rotate each credential',
    line: (line: number) => `line ${line}`,
    redacted: 'Redacted output',
    safeToShare: 'Safe to share',
    copyRedacted: 'Copy redacted',
  },
  jwt: {
    eyebrow: 'Toolkit',
    title: 'JWT inspector',
    description:
      'Decode a JSON Web Token, review its header and claims, and audit it for insecure configuration (alg none, missing expiry, sensitive data in the payload). Tokens are decoded in your browser only.',
    token: 'Token',
    tokenHint: "Paste a JWT — never paste production tokens you don't own",
    tokenAria: 'JWT to inspect',
    invalid: 'Invalid token.',
    header: 'Header',
    headerHint: 'Algorithm & key id',
    payload: 'Payload',
    payloadHint: 'Claims',
    timeClaims: { iat: 'Issued at', nbf: 'Not before', exp: 'Expires' } as Record<string, string>,
    audit: 'Security audit',
    issues: (count: number) => `${count} ${plural(count, 'issue', 'issues')}`,
    noIssues: 'No static issues found. Always verify the signature server-side against a pinned key.',
    signingCheck: 'Signing-secret check',
    nonHmacBefore: 'Signature checks here apply to HMAC tokens (HS256/384/512). This token uses',
    nonHmacAfter: '; verifying it needs the issuer’s public key.',
    signingIntro:
      'Paste your signing secret to confirm the token verifies and that the secret is not a known default. Everything runs locally.',
    secretPlaceholder: 'HMAC signing secret',
    verify: 'Verify signature',
    valid: 'Signature is valid for this secret.',
    invalidSignature: 'Signature does not match this secret.',
    weakSecret:
      'This is a well-known default secret. Replace it with 32+ random bytes immediately — a predictable secret defeats the whole point of signing.',
  },
  headers: {
    eyebrow: 'Toolkit',
    title: 'Security header builder',
    description:
      'Toggle the headers you need and copy a ready-to-deploy snippet for your platform. Defaults follow OWASP’s Secure Headers project.',
    reset: 'Reset',
    transport: 'Transport',
    maxAge: 'max-age (seconds)',
    enableCsp: 'Enable CSP',
    unset: '(unset)',
    framing: 'Framing & typing',
    permissionsHint: 'Block browser features',
    enablePermissions: 'Enable Permissions-Policy',
    permissionsNote: 'Highlighted features are disabled for the whole origin.',
    crossOrigin: 'Cross-origin isolation',
    output: 'Output',
    headerCount: (count: number) => `${count} ${plural(count, 'header', 'headers')}`,
    copyConfig: 'Copy config',
    enableOne: 'Enable at least one header.',
  },
  passwords: {
    eyebrow: 'Toolkit',
    title: 'Password & secret lab',
    description:
      'Estimate how long a password resists an offline attack, and generate cryptographically secure secrets and passphrases. All computation happens in your browser.',
    checker: 'Strength checker',
    checkerHint: 'Runs locally — nothing is sent anywhere',
    placeholder: 'Type or paste a password to test',
    aria: 'Password to test',
    show: 'Show password',
    hide: 'Hide password',
    bitsChars: (bits: number, chars: number) => `${bits} bits · ${chars} chars`,
    timeToGuess: 'Estimated time to guess (offline attack)',
    labels: ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'],
    scenarios: {
      online: 'Online login, rate-limited',
      bcrypt: 'Offline, bcrypt (cost 12)',
      sha256: 'Offline, SHA-256',
      md5: 'Offline, MD5 / NTLM',
    } as Record<string, string>,
    warnings: {
      breached: 'Appears in public breach wordlists — cracked instantly.',
      repeated: 'Contains repeated characters (e.g. "aaa").',
      sequence: 'Contains a keyboard or alphabet sequence (e.g. "1234", "qwer").',
      year: 'Contains a year — a favourite of rule-based attacks.',
      short: 'Shorter than 12 characters.',
      singleClass: 'Uses a single character class.',
    } as Record<string, string>,
    generator: 'Secret generator',
    entropy: (bits: number) => `${bits} bits of entropy`,
    generatorBefore: 'Uses the browser’s cryptographic RNG (',
    generatorAfter: '). Ideal for JWT secrets, API keys and session keys.',
    kinds: { base64url: 'Base64url', hex: 'Hex', alphanumeric: 'Alphanumeric', symbols: 'With symbols' } as Record<
      string,
      string
    >,
    length: (length: number) => `Length: ${length}`,
    copySecret: 'Copy secret',
    passphrase: 'Passphrase generator',
    passphraseBits: (bits: number) => `~${bits} bits`,
    passphraseIntro: 'Memorable and strong — good for disk encryption or a password manager’s master password.',
    words: (count: number) => `Words: ${count}`,
    separator: (name: string) => `Separator ${name}`,
    space: 'space',
    copyPassphrase: 'Copy passphrase',
    howTitle: 'How the estimate works',
    how1: 'Entropy is estimated from the character set and length, then reduced for patterns an attacker tries first: dictionary words, keyboard runs, repeats and years.',
    how2: 'Crack times assume an attacker already has the password hash and runs a single modern GPU rig. A slow hash like bcrypt buys enormous time; a fast one like MD5 buys almost none.',
    how3: 'Figures are order-of-magnitude guidance, not a guarantee. When in doubt, add length.',
  },
  rules: {
    eyebrow: 'Learn',
    title: 'Rule catalog',
    description: (count: number) =>
      `Every detection rule in the scanner — ${count} in total — with its severity and CWE/OWASP mapping. Use it to understand what each finding means and to teach a checklist.`,
    all: 'All',
    anyFile: 'Any file',
    search: 'Search rules',
    searchPlaceholder: 'Search title, id, CWE…',
    noMatch: 'No rules match your filters.',
    englishNote: '',
  },
};

export type Messages = typeof en;
