import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AmbientBackground } from './components/AmbientBackground';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { CookieBanner } from './components/CookieBanner';
import { FileDropzone } from './components/FileDropzone';
import { FileCard } from './components/FileCard';
import { ScoreGauge } from './components/ScoreGauge';
import { SeverityBreakdown } from './components/SeverityBreakdown';
import { FindingsList } from './components/FindingsList';
import { EmptyState } from './components/EmptyState';
import { useAnalysis } from './hooks/useAnalysis';
import type { PresetFile } from './data/examplePresets';
import { LEGAL_CONTENT, type LegalModalType } from './data/legalContent';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function App() {
  const { fileAnalyses, result, addFile, removeFile } = useAnalysis();
  const [openModal, setOpenModal] = useState<LegalModalType | null>(null);

  const handleLoadPreset = (files: PresetFile[]) => {
    files.forEach((file) => addFile(file.filename, file.content));
  };

  return (
    <div className="relative flex min-h-screen flex-col text-slate-100">
      <AmbientBackground />
      <Header />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-6 py-10"
      >
        <motion.div variants={itemVariants}>
          <FileDropzone onAddFile={addFile} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnimatePresence mode="wait">
            {fileAnalyses.length === 0 ? (
              <EmptyState key="empty-state" onLoadPreset={handleLoadPreset} />
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <motion.div layout className="space-y-2">
                  <AnimatePresence>
                    {fileAnalyses.map(({ file, findings, parseError }) => (
                      <FileCard
                        key={file.id}
                        filename={file.filename}
                        fileType={file.fileType}
                        parseError={parseError}
                        findingCount={findings.length}
                        onRemove={() => removeFile(file.id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto,1fr]">
                  <div className="flex justify-center md:justify-start">
                    <ScoreGauge score={result.score} />
                  </div>
                  <SeverityBreakdown counts={result.counts} />
                </div>

                <FindingsList findings={result.findings} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.main>

      <Footer onOpenModal={setOpenModal} />
      <CookieBanner onLearnMore={() => setOpenModal('cookies')} />
      <LegalModal section={openModal ? LEGAL_CONTENT[openModal] : null} onClose={() => setOpenModal(null)} />
    </div>
  );
}
