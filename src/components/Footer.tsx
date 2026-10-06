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
    <footer className="mx-auto w-full max-w-5xl px-4 pb-32 pt-4 sm:px-6 lg:pb-8">
      <div className="flex flex-col items-center gap-2 border-t border-separator pt-5 text-footnote text-label-2 sm:flex-row sm:justify-between">
        <p>
          © {year} {t.meta.title}. {t.footer.rights}
        </p>
        <nav className="flex items-center gap-1">
          {LEGAL_LINKS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onOpenModal(type)}
              className="min-h-11 rounded-full px-3 transition-colors hover:bg-fill hover:text-label lg:min-h-8"
            >
              {t.footer[type]}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
