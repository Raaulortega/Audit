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
  'follow-redirects': {
    minSafeVersion: '1.15.6',
    advisory: 'Proxy-Authorization header leaked across hosts on redirect (CVE-2024-28849), fixed in 1.15.6.',
  },
  braces: { minSafeVersion: '3.0.3', advisory: 'Uncontrolled resource consumption (CVE-2024-4068), fixed in 3.0.3.' },
  micromatch: { minSafeVersion: '4.0.8', advisory: 'ReDoS (CVE-2024-4067), fixed in 4.0.8.' },
  'body-parser': { minSafeVersion: '1.20.3', advisory: 'Denial of service via URL encoding (CVE-2024-45590), fixed in 1.20.3.' },
  'tough-cookie': { minSafeVersion: '4.1.3', advisory: 'Prototype pollution (CVE-2023-26136), fixed in 4.1.3.' },
  xml2js: { minSafeVersion: '0.5.0', advisory: 'Prototype pollution (CVE-2023-0842), fixed in 0.5.0.' },
  ejs: { minSafeVersion: '3.1.10', advisory: 'Pollution protection bypass (CVE-2024-33883), fixed in 3.1.10.' },
  handlebars: { minSafeVersion: '4.7.7', advisory: 'Remote code execution via template compilation (CVE-2021-23369), fixed in 4.7.7.' },
  marked: { minSafeVersion: '4.0.10', advisory: 'ReDoS in inline parsing (CVE-2022-21681), fixed in 4.0.10.' },
  'cross-spawn': { minSafeVersion: '7.0.5', advisory: 'ReDoS in argument escaping (CVE-2024-21538), fixed in 7.0.5.' },
};

/**
 * Exact releases that shipped malicious code after a maintainer account or
 * build pipeline was compromised. Any match is an active supply-chain incident.
 */
export const COMPROMISED_VERSIONS: Record<string, { versions: string[]; incident: string }> = {
  'event-stream': { versions: ['3.3.6'], incident: 'Injected flatmap-stream payload that stole bitcoin wallets (2018).' },
  'ua-parser-js': { versions: ['0.7.29', '0.8.0', '1.0.0'], incident: 'Hijacked release installed a cryptominer and password stealer (2021).' },
  coa: { versions: ['2.0.3', '2.0.4', '2.1.1', '2.1.3', '3.0.1', '3.1.3'], incident: 'Hijacked release dropped credential-stealing malware (2021).' },
  rc: { versions: ['1.2.9', '1.3.9', '2.3.9'], incident: 'Hijacked release dropped credential-stealing malware (2021).' },
  colors: { versions: ['1.4.1', '1.4.2'], incident: 'Protestware infinite loop that broke dependent apps (2022).' },
  faker: { versions: ['6.6.6'], incident: 'Sabotaged release published by its maintainer (2022).' },
  'node-ipc': { versions: ['10.1.1', '10.1.2', '10.1.3'], incident: 'Protestware that overwrote files on Russian/Belarusian IPs (2022).' },
};

/** Well-known typosquats and malicious packages removed from npm. */
export const MALICIOUS_PACKAGES = new Set([
  'flatmap-stream',
  'getcookies',
  'crossenv',
  'cross-env.js',
  'babelcli',
  'd3.js',
  'fabric-js',
  'ffmepg',
  'gruntcli',
  'http-proxy.js',
  'jquery.js',
  'mongose',
  'mssql.js',
  'mssql-node',
  'mysqljs',
  'nodecaffe',
  'nodefabric',
  'node-fabric',
  'nodeffmpeg',
  'nodemailer-js',
  'nodemailer.js',
  'nodemssql',
  'node-opencv',
  'node-opensl',
  'node-openssl',
  'noderequest',
  'nodesass',
  'nodesqlite',
  'node-sqlite',
  'node-tkinter',
  'opencv.js',
  'openssl.js',
  'proxy.js',
  'shadowsock',
  'smb',
  'sqlite.js',
  'sqliter',
  'sqlserver',
  'tkinter',
]);

export const DEV_ONLY_TOOLS = new Set([
  'nodemon',
  'webpack-dev-server',
  'vite',
  'eslint',
  'prettier',
  'jest',
  'vitest',
]);
