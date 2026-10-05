import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SITE_OWNER, type LegalModalType } from '../data/legalContent';
import { useI18n } from '../i18n/I18nContext';

interface LegalModalProps {
  type: LegalModalType | null;
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  const { t } = useI18n();
  const section = type ? t.legal[type] : null;

  useEffect(() => {
    if (!type) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [type, onClose]);

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-6 backdrop-blur-xs"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id="legal-modal-title" className="text-base font-semibold text-slate-100">
                {section.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.common.close}
                className="text-slate-500 transition-colors hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-slate-400">
                  {paragraph}
                </p>
              ))}
              {type === 'legal' && (
                <dl className="space-y-1 border-t border-white/10 pt-3 text-sm text-slate-400">
                  {SITE_OWNER.name && (
                    <div className="flex gap-2">
                      <dt className="text-slate-500">{t.legal.owner}:</dt>
                      <dd className="text-slate-300">{SITE_OWNER.name}</dd>
                    </div>
                  )}
                  {SITE_OWNER.email && (
                    <div className="flex gap-2">
                      <dt className="text-slate-500">{t.legal.contact}:</dt>
                      <dd>
                        <a href={`mailto:${SITE_OWNER.email}`} className="text-emerald-400 hover:text-emerald-300">
                          {SITE_OWNER.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="text-slate-500">{t.legal.source}:</dt>
                    <dd>
                      <a
                        href={SITE_OWNER.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        GitHub
                      </a>
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
