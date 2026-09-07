import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="logoCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
      </defs>
      <path
        d="M12 2.5 L19 5.5 V11.2 C19 16 15.9 19.8 12 21.3 C8.1 19.8 5 16 5 11.2 V5.5 L12 2.5 Z"
        fill="#020617"
        stroke="#34d399"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <motion.circle
        cx="12"
        cy="11.4"
        r="2.7"
        fill="url(#logoCore)"
        animate={{ opacity: [0.75, 1, 0.75], scale: [0.95, 1.08, 0.95] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '12px 11.4px' }}
      />
    </svg>
  );
}
