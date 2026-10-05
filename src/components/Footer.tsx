import type { LegalModalType } from '../data/legalContent';
import { useI18n } from '../i18n/I18nContext';

interface FooterProps {
  onOpenModal: (type: LegalModalType) => void;
}

const LEGAL_LINKS: LegalModalType[] = ['legal', 'privacy', 'cookies'];

export function Footer({ onOpenModal }: FooterProps) {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 py-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <p>
          © {year} {t.meta.title}. {t.footer.rights}
        </p>
        <nav className="flex items-center gap-4">
          {LEGAL_LINKS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onOpenModal(type)}
              className="transition-colors hover:text-emerald-300"
            >
              {t.footer[type]}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
