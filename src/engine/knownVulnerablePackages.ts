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
