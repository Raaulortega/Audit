/**
 * Brand color lives in the content layer: a still wash at the top of the page that
 * runs beneath the glass sidebar and bars, so the material has something to pick up.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]"
      style={{ background: 'var(--sheen)' }}
    />
  );
}
