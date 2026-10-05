import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

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
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-[0_0_32px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:flex-row sm:items-center"
        >
          <Cookie className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-xs text-slate-400">
            {t.cookieBanner.text}{' '}
            <button type="button" onClick={onLearnMore} className="font-medium text-emerald-400 hover:text-emerald-300">
              {t.cookieBanner.learnMore}
            </button>
          </p>
          <motion.button
            type="button"
            onClick={handleAccept}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-[0_0_14px_rgba(52,211,153,0.35)] transition-colors hover:bg-emerald-400"
          >
            {t.cookieBanner.accept}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
