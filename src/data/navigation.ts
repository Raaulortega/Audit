import {
  BookOpen,
  Fingerprint,
  History,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  description: string;
  group: 'Audit' | 'Toolkit' | 'Learn';
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Overview',
    description: 'Your security posture at a glance.',
    group: 'Audit',
    icon: LayoutDashboard,
  },
  {
    path: '/scanner',
    label: 'Config scanner',
    description: 'Audit Dockerfiles, compose files, nginx, .env, package.json and more against 80+ rules.',
    group: 'Audit',
    icon: ScanSearch,
  },
  {
    path: '/history',
    label: 'Scan history',
    description: 'Track your score over time and diff two scans to see what got fixed.',
    group: 'Audit',
    icon: History,
  },
  {
    path: '/secrets',
    label: 'Secret scanner',
    description: 'Find API keys and tokens in any text, then redact them before sharing logs.',
    group: 'Toolkit',
    icon: KeyRound,
  },
  {
    path: '/jwt',
    label: 'JWT inspector',
    description: 'Decode tokens, spot insecure claims and test them against weak signing secrets.',
    group: 'Toolkit',
    icon: Fingerprint,
  },
  {
    path: '/headers',
    label: 'Header builder',
    description: 'Design HTTP security headers and export them for Vercel, nginx, Netlify, Apache or Express.',
    group: 'Toolkit',
    icon: ShieldCheck,
  },
  {
    path: '/passwords',
    label: 'Password lab',
    description: 'Estimate crack times and generate cryptographically secure secrets.',
    group: 'Toolkit',
    icon: LockKeyhole,
  },
  {
    path: '/rules',
    label: 'Rule catalog',
    description: 'Browse every detection rule with its severity and CWE/OWASP mapping.',
    group: 'Learn',
    icon: BookOpen,
  },
];

export const NAV_GROUPS: NavItem['group'][] = ['Audit', 'Toolkit', 'Learn'];
