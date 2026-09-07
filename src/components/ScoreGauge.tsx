import { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
}

interface ScoreTier {
  color: string;
  glow: string;
  label: string;
}

function scoreTier(score: number): ScoreTier {
  if (score >= 80) return { color: '#34d399', glow: 'rgba(52,211,153,0.55)', label: 'Strong posture' };
  if (score >= 50) return { color: '#fbbf24', glow: 'rgba(251,191,36,0.5)', label: 'Needs attention' };
  return { color: '#f87171', glow: 'rgba(248,113,113,0.55)', label: 'Critical exposure' };
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { color, glow, label } = scoreTier(score);

  const motionScore = useMotionValue(0);
  const roundedScore = useTransform(motionScore, (value) => Math.round(value));
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(motionScore, score, { duration: 1.1, ease: 'easeOut' });
    const unsubscribe = roundedScore.on('change', setDisplayScore);
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [score, motionScore, roundedScore]);

  const isCritical = score < 50;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ filter: `drop-shadow(0 0 24px ${glow})` }}>
        {isCritical && (
          <motion.div
            animate={{ opacity: [0.35, 0, 0.35], scale: [1, 1.25, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-red-500/30"
          />
        )}
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums text-white">{displayScore}</span>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">/ 100</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-300">Security Score</p>
      <p className="text-xs" style={{ color }}>
        {label}
      </p>
    </div>
  );
}
