import type { Finding } from '../types';
import { splitLines } from '../lineUtils';

/** Default ports of data stores that should never be reachable from outside the host. */
const DATASTORE_PORTS: Record<string, string> = {
  '5432': 'PostgreSQL',
  '3306': 'MySQL/MariaDB',
  '27017': 'MongoDB',
  '6379': 'Redis',
  '9200': 'Elasticsearch',
  '11211': 'Memcached',
  '5984': 'CouchDB',
  '2375': 'Docker daemon (unencrypted)',
};
const DANGEROUS_CAPS = new Set(['ALL', 'SYS_ADMIN', 'SYS_PTRACE', 'SYS_MODULE', 'NET_ADMIN', 'DAC_READ_SEARCH']);
const SENSITIVE_HOST_PATHS = /^\s*-\s*["']?(\/|\/etc|\/root|\/proc|\/sys|\/var\/lib\/docker|~\/\.ssh|\/home)(\/)?["']?:/;
const WEAK_PASSWORD_ENV =
  /(PASSWORD|_PASS|ROOT_PASSWORD)["']?\s*[:=]\s*["']?(password|admin|root|postgres|mysql|example|secret|changeme|test|123456)["']?\s*$/i;

export function analyzeDockerCompose(content: string): Finding[] {
  const lines = splitLines(content);
  const findings: Finding[] = [];
  let currentService = 'compose';
  let inServices = false;
  let inPorts = false;
  let inCapAdd = false;

  lines.forEach((raw, index) => {
    const line = raw.replace(/\s+#.*$/, '');
    const lineNumber = index + 1;
    const base = { sourceFile: 'docker-compose.yml', line: lineNumber };

    if (/^services:\s*$/.test(line)) {
      inServices = true;
      return;
    }
    if (/^\S/.test(line)) inServices = false;
    const serviceMatch = /^ {2}([\w.-]+):\s*$/.exec(line);
    if (inServices && serviceMatch) currentService = serviceMatch[1];

    if (/^\s+\w[\w-]*:/.test(line) && !/^\s+-/.test(line)) {
      inPorts = /^\s+ports:\s*$/.test(line);
      inCapAdd = /^\s+cap_add:\s*$/.test(line);
    }

    if (/^\s+privileged:\s*true\b/.test(line)) {
      findings.push({
        ...base,
        id: `compose-privileged-${currentService}`,
        severity: 'critical',
        category: 'Container Privilege',
        title: `Service "${currentService}" runs privileged`,
        description:
          'A privileged container has every kernel capability and full device access. A compromise is equivalent to root on the host.',
        fixSnippet: `    privileged: false
    cap_drop: [ALL]
    cap_add: [NET_BIND_SERVICE]  # add back only what is required`,
        references: ['CWE-250', 'CIS Docker 5.4'],
      });
    }

    if (/docker\.sock/.test(line)) {
      findings.push({
        ...base,
        id: `compose-docker-socket-${currentService}`,
        severity: 'critical',
        category: 'Container Escape',
        title: `Service "${currentService}" mounts the Docker socket`,
        description:
          'Access to /var/run/docker.sock lets the container start new privileged containers and take over the host.',
        fixSnippet: `# Remove the mount. If the service needs the Docker API, use a filtering proxy:
#   image: tecnativa/docker-socket-proxy
#   environment: { CONTAINERS: 1, POST: 0 }`,
        references: ['CWE-668', 'CIS Docker 5.31'],
      });
    } else if (SENSITIVE_HOST_PATHS.test(line)) {
      findings.push({
        ...base,
        id: `compose-sensitive-mount-${currentService}-L${lineNumber}`,
        severity: 'critical',
        category: 'Container Escape',
        title: `Service "${currentService}" mounts a sensitive host path`,
        description: 'Mounting host system directories exposes credentials and lets a compromised container modify the host.',
        fixSnippet: `    volumes:
      - app-data:/data   # use a named volume, mount read-only (:ro) if a host path is unavoidable`,
        references: ['CWE-668', 'CIS Docker 5.5'],
      });
    }

    const namespaceMatch = /^\s+(network_mode|pid|ipc|userns_mode):\s*["']?host["']?/.exec(line);
    if (namespaceMatch) {
      findings.push({
        ...base,
        id: `compose-host-${namespaceMatch[1]}-${currentService}`,
        severity: 'medium',
        category: 'Container Isolation',
        title: `Service "${currentService}" shares the host ${namespaceMatch[1].replace('_mode', '')} namespace`,
        description: 'Sharing host namespaces removes a key isolation boundary between the container and the host.',
        fixSnippet: `# Remove "${namespaceMatch[1]}: host" and publish only the ports you need`,
        references: ['CWE-653', 'CIS Docker 5.9'],
      });
    }

    if (/seccomp[:=]unconfined|apparmor[:=]unconfined|label[:=]disable/.test(line)) {
      findings.push({
        ...base,
        id: `compose-unconfined-${currentService}-L${lineNumber}`,
        severity: 'medium',
        category: 'Container Isolation',
        title: `Service "${currentService}" disables a kernel security profile`,
        description: 'Seccomp/AppArmor/SELinux profiles block dangerous syscalls used in container escapes.',
        fixSnippet: `    security_opt:
      - no-new-privileges:true`,
        references: ['CWE-693', 'CIS Docker 5.21'],
      });
    }

    const capMatch = inCapAdd ? /^\s+-\s*["']?(?:CAP_)?([A-Z_]+)["']?\s*$/.exec(line) : null;
    const inlineCaps = /^\s+cap_add:\s*\[(.*)\]/
      .exec(line)?.[1]
      .split(',')
      .map((cap) => cap.trim().replace(/["']|CAP_/g, ''));
    for (const cap of capMatch ? [capMatch[1]] : inlineCaps ?? []) {
      if (DANGEROUS_CAPS.has(cap)) {
        findings.push({
          ...base,
          id: `compose-cap-${cap}-${currentService}`,
          severity: cap === 'ALL' || cap === 'SYS_ADMIN' ? 'critical' : 'medium',
          category: 'Container Privilege',
          title: `Service "${currentService}" adds capability ${cap}`,
          description: `${cap} grants kernel-level powers that are commonly abused to break out of containers.`,
          fixSnippet: `    cap_drop: [ALL]
    cap_add: [<only the capabilities you need>]`,
          references: ['CWE-250', 'CIS Docker 5.3'],
        });
      }
    }

    const portMatch = inPorts ? /^\s+-\s*["']?(?:([\d.]+):)?(\d+):(\d+)(?:\/\w+)?["']?\s*$/.exec(line) : null;
    if (portMatch) {
      const [, hostIp, hostPort, containerPort] = portMatch;
      const isPublic = !hostIp || hostIp === '0.0.0.0';
      const service = DATASTORE_PORTS[containerPort];
      if (service && isPublic) {
        findings.push({
          ...base,
          id: `compose-public-datastore-${currentService}-${containerPort}`,
          severity: containerPort === '2375' ? 'critical' : 'medium',
          category: 'Network Exposure',
          title: `${service} port ${containerPort} published on all interfaces`,
          description:
            'Docker writes its own iptables rules, so published ports bypass host firewalls like ufw. Internet-facing databases are scanned and ransomed within hours.',
          fixSnippet: `    ports:
      - "127.0.0.1:${hostPort}:${containerPort}"  # or remove it and use the internal network`,
          references: ['CWE-668', 'OWASP A05:2021'],
        });
      }
    }

    if (WEAK_PASSWORD_ENV.test(line)) {
      findings.push({
        ...base,
        id: `compose-weak-password-${currentService}-L${lineNumber}`,
        severity: 'critical',
        category: 'Weak Credential',
        title: `Service "${currentService}" uses a default password`,
        description: 'Default credentials on data stores are the first thing automated scanners try.',
        fixSnippet: `    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]`,
        references: ['CWE-1392', 'CWE-798'],
      });
    }

    const imageMatch = /^\s+image:\s*["']?([^\s"']+)["']?/.exec(line);
    if (imageMatch) {
      const ref = imageMatch[1];
      const lastSegment = ref.split('/').pop() ?? ref;
      const tag = lastSegment.includes('@') ? 'digest' : lastSegment.split(':')[1];
      if (!tag || tag === 'latest') {
        findings.push({
          ...base,
          id: `compose-unpinned-image-${currentService}`,
          severity: 'low',
          category: 'Unpinned Base Image',
          title: `Service "${currentService}" uses unpinned image "${ref}"`,
          description: 'Floating tags make deployments non-reproducible and can pull in compromised or breaking images.',
          fixSnippet: `    image: ${ref.split(':')[0]}:<version>@sha256:<digest>`,
          references: ['CWE-1357', 'CWE-494'],
        });
      }
    }
  });

  return findings;
}
