import type { LegalModalType } from '../data/legalContent';

interface FooterProps {
  onOpenModal: (type: LegalModalType) => void;
}

const LEGAL_LINKS: Array<{ type: LegalModalType; label: string }> = [
  { type: 'legal', label: 'Legal Notice' },
  { type: 'privacy', label: 'Privacy' },
  { type: 'cookies', label: 'Cookies' },
];

export function Footer({ onOpenModal }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 py-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <p>© {year} Config Security Audit. All analysis runs locally in your browser.</p>
        <nav className="flex items-center gap-4">
          {LEGAL_LINKS.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => onOpenModal(type)}
              className="transition-colors hover:text-emerald-300"
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
