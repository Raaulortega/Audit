import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SITE_OWNER, type LegalModalType } from '../data/legalContent';
import { useI18n } from '../i18n/I18nContext';

interface LegalModalProps {
  type: LegalModalType | null;
  onClose: () => void;
}

/** A sheet: bottom-anchored with a grabber on phones, centered on wide screens. */
export function LegalModal({ type, onClose }: LegalModalProps) {
  const { t } = useI18n();
  const section = type ? t.legal[type] : null;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!type) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-surface-raised px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-2 shadow-2xl sm:rounded-[28px] sm:pb-6 sm:pt-5"
          >
            <div aria-hidden="true" className="mx-auto mb-3 h-[5px] w-9 rounded-full bg-fill-strong sm:hidden" />
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="legal-modal-title" className="text-title3 font-semibold text-label">
                {section.title}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="min-h-11 shrink-0 rounded-full px-3 text-callout font-semibold text-tint hover:bg-fill lg:min-h-9"
              >
                {t.common.close}
              </button>
            </div>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-subhead leading-relaxed text-label-2">
                  {paragraph}
                </p>
              ))}
              {type === 'legal' && (
                <dl className="divide-y divide-separator overflow-hidden rounded-[14px] bg-fill text-subhead">
                  {SITE_OWNER.name && (
                    <div className="flex justify-between gap-3 px-4 py-3">
                      <dt className="text-label-2">{t.legal.owner}</dt>
                      <dd className="text-label">{SITE_OWNER.name}</dd>
                    </div>
                  )}
                  {SITE_OWNER.email && (
                    <div className="flex justify-between gap-3 px-4 py-3">
                      <dt className="text-label-2">{t.legal.contact}</dt>
                      <dd>
                        <a href={`mailto:${SITE_OWNER.email}`} className="text-tint hover:underline">
                          {SITE_OWNER.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3 px-4 py-3">
                    <dt className="text-label-2">{t.legal.source}</dt>
                    <dd>
                      <a href={SITE_OWNER.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-tint hover:underline">
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
