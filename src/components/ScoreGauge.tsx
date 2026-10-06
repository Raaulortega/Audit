import { useEffect, useId, useRef, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { SHIELD_PATH } from './Logo';

interface ScoreGaugeProps {
  score: number;
}

type Tier = 'strong' | 'attention' | 'critical';

const TIER_COLOR: Record<Tier, string> = {
  strong: 'var(--tint)',
  attention: 'var(--medium)',
  critical: 'var(--critical)',
};

function scoreTier(score: number): Tier {
  if (score >= 80) return 'strong';
  if (score >= 50) return 'attention';
  return 'critical';
}

/**
 * The signature element: the LocalAudit shield fills up with the score.
 * At 80 or more the check is cut out of it, which is exactly the logo: "audit passed".
 */
export function ScoreGauge({ score }: ScoreGaugeProps) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const tier = scoreTier(score);
  const color = TIER_COLOR[tier];

  const [displayScore, setDisplayScore] = useState(score);
  const shownRef = useRef(0);
  useEffect(() => {
    if (reduceMotion) {
      shownRef.current = score;
      setDisplayScore(score);
      return;
    }
    const controls = animate(shownRef.current, score, {
      duration: 0.9,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (value) => {
        shownRef.current = value;
        setDisplayScore(Math.round(value));
      },
    });
    return () => controls.stop();
  }, [score, reduceMotion]);

  return (
    <div
      role="img"
      aria-label={`${t.score.title}: ${score} / 100. ${t.score[tier]}`}
      className="card flex h-full items-center gap-5 p-5"
    >
      <svg viewBox="0 0 64 64" className="h-28 w-28 shrink-0" aria-hidden="true">
        <defs>
          <clipPath id={`shield-${id}`}>
            <path d={SHIELD_PATH} />
          </clipPath>
          <mask id={`check-${id}`}>
            <rect width="64" height="64" fill="white" />
            {tier === 'strong' && (
              <path
                d="M21.5 31.5 28.8 38.8 43 24.5"
                fill="none"
                stroke="black"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </mask>
        </defs>
        <g clipPath={`url(#shield-${id})`} mask={`url(#check-${id})`}>
          <rect width="64" height="64" fill="var(--fill-strong)" />
          <motion.rect
            x="0"
            y="4"
            width="64"
            height="56"
            fill={color}
            style={{ originY: 1, transformBox: 'fill-box' }}
            initial={{ scaleY: reduceMotion ? score / 100 : 0 }}
            animate={{ scaleY: score / 100 }}
            transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.32, 0.72, 0, 1] }}
          />
        </g>
      </svg>
      <div className="min-w-0">
        <p className="text-footnote font-medium text-label-2">{t.score.title}</p>
        <p className="font-rounded text-[3.5rem] font-bold leading-none tabular-nums tracking-tight text-label">
          {displayScore}
          <span className="ml-1 text-title3 font-semibold text-label-2">/100</span>
        </p>
        <p className="mt-1.5 text-subhead font-semibold" style={{ color }}>
          {t.score[tier]}
        </p>
      </div>
    </div>
  );
}
