import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LegalSection } from '../data/legalContent';

interface LegalModalProps {
  section: LegalSection | null;
  onClose: () => void;
}

export function LegalModal({ section, onClose }: LegalModalProps) {
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
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-100">{section.title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
