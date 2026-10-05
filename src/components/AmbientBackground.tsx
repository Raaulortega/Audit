import { motion } from 'framer-motion';

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <motion.div
        animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-40 -top-40 h-144 w-xl rounded-full bg-emerald-500/10 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute -right-32 top-0 h-120 w-120 rounded-full bg-sky-500/8 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute -bottom-40 left-1/3 h-112 w-md rounded-full bg-emerald-400/8 blur-3xl"
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[64px_64px]" />
    </div>
  );
}
