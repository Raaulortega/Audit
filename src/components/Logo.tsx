import { useId } from 'react';

interface LogoProps {
  className?: string;
}

/** Shield outline shared by the logo and the score gauge. */
export const SHIELD_PATH = 'M32 4.5 53.5 12.5V30.5C53.5 44.5 44.6 54.8 32 59.5 19.4 54.8 10.5 44.5 10.5 30.5V12.5Z';

/**
 * LocalAudit mark: a filled shield with a cut-out check ("audit passed").
 * The check is a real cut-out (mask), so it reads on light and dark surfaces alike.
 * Keep in sync with public/favicon.svg.
 */
export function Logo({ className = 'h-8 w-8' }: LogoProps) {
  // useId keeps ids unique per instance and identical between prerender and hydration.
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`logo-fill-${id}`} x1="14" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5fe08a" />
          <stop offset="0.55" stopColor="#30c060" />
          <stop offset="1" stopColor="#167a40" />
        </linearGradient>
        <mask id={`logo-cut-${id}`}>
          <rect width="64" height="64" fill="white" />
          <path
            d="M21.5 31.5 28.8 38.8 43 24.5"
            fill="none"
            stroke="black"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <path d={SHIELD_PATH} fill={`url(#logo-fill-${id})`} mask={`url(#logo-cut-${id})`} />
    </svg>
  );
}
