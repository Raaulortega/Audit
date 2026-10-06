import { useEffect } from 'react';

/**
 * Content layer wallpaper plus the refraction filter the glass uses.
 *
 * Brand color lives here, beneath the glass sidebar and bars, so the material has
 * something to pick up. It is still: no looping animation.
 *
 * The SVG filter bends the backdrop like a lens (low-frequency noise driving a displacement
 * map). Only Chromium applies SVG filters inside `backdrop-filter`, so the class that turns it
 * on is added there and nowhere else; other browsers keep the plain blur.
 */
export function AmbientBackground() {
  useEffect(() => {
    const brands = (navigator as Navigator & { userAgentData?: { brands?: Array<{ brand: string }> } }).userAgentData?.brands;
    if (brands?.some(({ brand }) => brand === 'Chromium')) {
      document.documentElement.classList.add('glass-refraction');
    }
  }, []);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" style={{ background: 'var(--wallpaper)' }} />
      <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
        <filter id="liquid-glass" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2.5" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="46" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </>
  );
}
