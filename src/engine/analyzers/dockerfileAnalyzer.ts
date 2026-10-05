import type { Finding } from '../types';
import { splitLines } from '../lineUtils';

interface Instruction {
  text: string;
  line: number;
}

const SECRET_NAME = /(PASSWORD|PASSWD|SECRET|TOKEN|API_?KEY|PRIVATE_?KEY|ACCESS_?KEY|CREDENTIALS?)/i;

/** Joins backslash continuations so multi-line RUN commands are analyzed as one instruction. */
function parseInstructions(content: string): Instruction[] {
  const instructions: Instruction[] = [];
  let buffer = '';
  let startLine = 0;

  splitLines(content).forEach((raw, index) => {
    const line = raw.trim();
    if (buffer.length === 0 && (line.length === 0 || line.startsWith('#'))) return;
    if (buffer.length === 0) startLine = index + 1;
    if (line.endsWith('\\')) {
      buffer += `${line.slice(0, -1)} `;
      return;
    }
    buffer += line;
    instructions.push({ text: buffer.trim(), line: startLine });
    buffer = '';
  });
  if (buffer.length > 0) instructions.push({ text: buffer.trim(), line: startLine });

  return instructions;
}

export function analyzeDockerfile(content: string): Finding[] {
  const instructions = parseInstructions(content);
  const findings: Finding[] = [];
  const base = { sourceFile: 'Dockerfile' };

  const lastFromIndex = instructions.reduce(
    (lastIndex, { text }, index) => (/^FROM\s+/i.test(text) ? index : lastIndex),
    -1,
  );
  const finalStage = lastFromIndex === -1 ? instructions : instructions.slice(lastFromIndex);

  const hasNonRootUser = finalStage.some(({ text }) => /^USER\s+(?!root\b|0\b)\S+/i.test(text));
  if (!hasNonRootUser) {
    findings.push({
      ...base,
      id: 'docker-root-user',
      severity: 'critical',
      category: 'Container Privilege',
      title: 'Container runs as root',
      description: 'Running as root inside a container widens the blast radius of any code-execution vulnerability.',
      fixSnippet: `RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser`,
      references: ['CWE-250', 'CIS Docker 4.1'],
    });
  }

  const fromInstructions = instructions.filter(({ text }) => /^FROM\s+/i.test(text));
  const stageNames = new Set(
    fromInstructions.map(({ text }) => /\s+AS\s+(\S+)/i.exec(text)?.[1]?.toLowerCase()).filter(Boolean),
  );
  const unpinned = fromInstructions
    .map(({ text, line }) => ({ ref: text.replace(/^FROM\s+(--platform=\S+\s+)?/i, '').split(/\s+/)[0], line }))
    .find(({ ref }) => {
      if (stageNames.has(ref.toLowerCase()) || ref === 'scratch' || ref.includes('@sha256:')) return false;
      const tag = (ref.split('/').pop() ?? ref).split(':')[1];
      return !tag || tag === 'latest';
    });

  if (unpinned) {
    const [image] = unpinned.ref.split(':');
    findings.push({
      ...base,
      id: 'docker-latest-tag',
      severity: 'medium',
      category: 'Unpinned Base Image',
      title: `Base image "${image}" is unpinned or uses :latest`,
      description: 'Unpinned tags make builds non-reproducible and can silently pull in breaking or vulnerable updates.',
      fixSnippet: `FROM ${image}:<pinned-version>  # replace with a specific released tag`,
      line: unpinned.line,
      references: ['CWE-1357', 'CWE-494'],
    });
  }

  for (const { text, line } of instructions) {
    const envMatch = /^(ENV|ARG)\s+(.+)$/i.exec(text);
    if (envMatch) {
      const keyword = envMatch[1].toUpperCase();
      const names = envMatch[2]
        .split(/\s+/)
        .map((pair) => pair.split('=')[0])
        .filter((name) => /^[A-Za-z_]\w*$/.test(name));
      const secretName = names.find((name) => SECRET_NAME.test(name));
      if (secretName) {
        const secretId = secretName.toLowerCase();
        findings.push({
          ...base,
          id: `docker-secret-${keyword.toLowerCase()}-${secretName}`,
          severity: keyword === 'ENV' ? 'critical' : 'medium',
          category: 'Secret Exposure',
          title: `${keyword} ${secretName} bakes a secret into the image`,
          description:
            keyword === 'ENV'
              ? 'ENV values are stored in the image config and visible to anyone who can run `docker inspect` or pull the image.'
              : 'ARG values are recorded in the image history (`docker history`) of every layer that uses them.',
          fixSnippet: `# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=${secretId} \\
    ${secretName}="$(cat /run/secrets/${secretId})" ./build.sh
# build with: docker build --secret id=${secretId},env=${secretName} .`,
          line,
          references: ['CWE-538', 'CWE-798'],
        });
      }
    }

    if (/^ADD\s+(--\S+\s+)*https?:\/\//i.test(text) && !/--checksum=/i.test(text)) {
      findings.push({
        ...base,
        id: `docker-add-remote-L${line}`,
        severity: 'medium',
        category: 'Supply Chain',
        title: 'ADD downloads a remote file without integrity check',
        description:
          'Remote files fetched with ADD are not verified; a compromised or hijacked URL injects arbitrary content into the image.',
        fixSnippet: `ADD --checksum=sha256:<expected-hash> https://example.com/file.tar.gz /tmp/`,
        line,
        references: ['CWE-494', 'OWASP A08:2021'],
      });
    }

    if (/^RUN\s/i.test(text) && /\b(curl|wget)\b[^|;&]*\|\s*(sudo\s+)?(ba|z)?sh\b/i.test(text)) {
      findings.push({
        ...base,
        id: `docker-curl-pipe-shell-L${line}`,
        severity: 'medium',
        category: 'Supply Chain',
        title: 'Remote script piped straight into a shell',
        description: 'curl | sh executes whatever the server returns at build time, with no pinning or integrity verification.',
        fixSnippet: `RUN curl -fsSLo install.sh https://example.com/install.sh \\
 && echo "<sha256>  install.sh" | sha256sum -c - \\
 && sh install.sh`,
        line,
        references: ['CWE-494', 'OWASP A08:2021'],
      });
    }

    if (/^RUN\s/i.test(text) && /chmod\s+(-R\s+)?(0?777|a\+rwx)\b/i.test(text)) {
      findings.push({
        ...base,
        id: `docker-chmod-777-L${line}`,
        severity: 'medium',
        category: 'File Permissions',
        title: 'World-writable permissions (chmod 777)',
        description:
          'Any process in the container can modify these files, enabling persistence or code tampering after a compromise.',
        fixSnippet: 'RUN chown -R appuser:appgroup /app && chmod -R u=rwX,go=rX /app',
        line,
        references: ['CWE-732'],
      });
    }

    if (/^RUN\s/i.test(text) && /\bsudo\b/.test(text)) {
      findings.push({
        ...base,
        id: `docker-sudo-L${line}`,
        severity: 'low',
        category: 'Container Privilege',
        title: 'sudo used inside the Dockerfile',
        description: 'sudo adds a setuid binary to the image; switch USER explicitly around privileged steps instead.',
        fixSnippet: `USER root
RUN <privileged step>
USER appuser`,
        line,
        references: ['CWE-250'],
      });
    }

    if (/^EXPOSE\s/i.test(text) && /(^|\s)22(\/tcp)?(\s|$)/.test(text.slice(6))) {
      findings.push({
        ...base,
        id: 'docker-expose-ssh',
        severity: 'medium',
        category: 'Network Exposure',
        title: 'Container exposes SSH (port 22)',
        description: 'Running sshd inside a container adds attack surface and credentials to manage; use `docker exec` instead.',
        fixSnippet: '# Remove EXPOSE 22 and the sshd install; debug with: docker exec -it <container> sh',
        line,
        references: ['CWE-1327'],
      });
    }

    if (/^COPY\s+(--\S+\s+)*\.\s+\S+$/i.test(text)) {
      findings.push({
        ...base,
        id: 'docker-copy-all',
        severity: 'low',
        category: 'Secret Exposure',
        title: 'COPY . copies the whole build context',
        description:
          'Without a strict .dockerignore, .env files, .git history and local credentials end up inside the image layers.',
        fixSnippet: `# .dockerignore
.git
.env*
*.pem
*.key
node_modules`,
        line,
        references: ['CWE-538'],
      });
    }
  }

  if (!instructions.some(({ text }) => /^HEALTHCHECK\s/i.test(text))) {
    findings.push({
      ...base,
      id: 'docker-no-healthcheck',
      severity: 'low',
      category: 'Availability',
      title: 'No HEALTHCHECK instruction',
      description: 'Without a health check the orchestrator cannot detect a hung container and restart it.',
      fixSnippet: 'HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1',
      references: ['CIS Docker 4.6'],
    });
  }

  return findings;
}
