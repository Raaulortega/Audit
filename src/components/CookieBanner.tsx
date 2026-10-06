import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { Button } from './PageHeader';

const STORAGE_KEY = 'config-audit:cookie-consent';

function readConsent(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

interface CookieBannerProps {
  onLearnMore: () => void;
}

export function CookieBanner({ onLearnMore }: CookieBannerProps) {
  const { t } = useI18n();
  // Hidden until mounted: the prerendered HTML cannot know whether this visitor already accepted.
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => setDismissed(readConsent()), []);

  const handleAccept = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage unavailable (e.g. private browsing) - consent just won't persist
    }
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          role="region"
          aria-label={t.footer.cookies}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="glass fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] z-40 mx-auto flex max-w-md flex-col gap-3 rounded-[22px] p-4 sm:flex-row sm:items-center lg:bottom-6 lg:left-[17.5rem]"
        >
          <Cookie className="h-5 w-5 shrink-0 text-label-2" aria-hidden="true" />
          <p className="text-footnote text-label">
            {t.cookieBanner.text}{' '}
            <button type="button" onClick={onLearnMore} className="font-semibold text-tint hover:underline">
              {t.cookieBanner.learnMore}
            </button>
          </p>
          <Button variant="primary" onClick={handleAccept}>
            {t.cookieBanner.accept}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
