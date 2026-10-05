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

/** Labels and descriptions live in the i18n messages, keyed by `path`. */
export interface NavItem {
  path: string;
  group: 'Audit' | 'Toolkit' | 'Learn';
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', group: 'Audit', icon: LayoutDashboard },
  { path: '/scanner', group: 'Audit', icon: ScanSearch },
  { path: '/history', group: 'Audit', icon: History },
  { path: '/secrets', group: 'Toolkit', icon: KeyRound },
  { path: '/jwt', group: 'Toolkit', icon: Fingerprint },
  { path: '/headers', group: 'Toolkit', icon: ShieldCheck },
  { path: '/passwords', group: 'Toolkit', icon: LockKeyhole },
  { path: '/rules', group: 'Learn', icon: BookOpen },
];

export const NAV_GROUPS: NavItem['group'][] = ['Audit', 'Toolkit', 'Learn'];
