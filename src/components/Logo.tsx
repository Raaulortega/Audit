import { useId } from 'react';

interface LogoProps {
  className?: string;
}

/**
 * LocalAudit mark: a filled shield with a cut-out check ("audit passed").
 * Bold shapes only, so it stays legible down to a 16 px favicon.
 * Keep in sync with public/favicon.svg.
 */
export function Logo({ className = 'h-8 w-8' }: LogoProps) {
  // useId keeps gradient ids unique per instance and identical between prerender and hydration.
  const gradientId = `logo-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="14" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6ee7b7" />
          <stop offset="0.55" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path
        d="M32 4.5 53.5 12.5V30.5C53.5 44.5 44.6 54.8 32 59.5 19.4 54.8 10.5 44.5 10.5 30.5V12.5Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M21.5 31.5 28.8 38.8 43 24.5"
        fill="none"
        stroke="#020617"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
