import { useId, useLayoutEffect, useRef } from 'react';

// Water filling a plain bucket (section 12). The level animates over ~900 ms with a slight
// overshoot and settle; the surface keeps a gentle wave. With reduce motion on, it just shows the level.

const BODY = 'M14 40 L106 40 L95 118 Q94 126 86 126 L34 126 Q26 126 25 118 Z';
const TOP_Y = 46; // water surface when full
const BOTTOM_Y = 126;
const RISE_MS = 900;

interface Props {
  level: number; // 0..1
  from?: number; // animate from this level on mount
  size?: number; // width in px
  complete?: boolean;
  label?: string;
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function surfaceY(level: number) {
  return BOTTOM_Y - Math.max(0, Math.min(1.08, level)) * (BOTTOM_Y - TOP_Y);
}

function waterPath(level: number, t: number, amp: number): string {
  if (level <= 0.001) return '';
  const y0 = surfaceY(level);
  let d = '';
  for (let x = 8; x <= 112; x += 4) {
    const y = y0 + amp * Math.sin(x * 0.09 + t * 2.1) + amp * 0.5 * Math.sin(x * 0.05 - t * 1.3);
    d += `${d ? 'L' : 'M'}${x} ${y.toFixed(2)} `;
  }
  return `${d}L112 132 L8 132 Z`;
}

/** 1 − e^(−6p)·cos(9p): rises past the target by ~12%, then settles. */
function slosh(p: number): number {
  return p >= 1 ? 1 : 1 - Math.exp(-6 * p) * Math.cos(9 * p);
}

export function BucketFill({ level, from, size = 120, complete = false, label }: Props) {
  const ids = useId();
  const clipId = `${ids}-clip`;
  const gradId = `${ids}-grad`;
  const shineId = `${ids}-shine`;
  const pathRef = useRef<SVGPathElement>(null);
  const shown = useRef(from ?? level);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    if (reducedMotion()) {
      shown.current = level;
      path.setAttribute('d', waterPath(level, 0, 0));
      return;
    }
    const start = performance.now();
    const startLevel = shown.current;
    const delta = level - startLevel;
    let raf = 0;
    path.setAttribute('d', waterPath(startLevel, performance.now() / 1000, 1.4));
    const frame = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / RISE_MS);
      const current = startLevel + delta * slosh(p);
      shown.current = current;
      // Extra wave height right after the water moves, decaying back to a gentle ripple.
      const amp = 1.4 + (delta !== 0 ? 4 * Math.exp(-elapsed / 500) : 0);
      path.setAttribute('d', waterPath(current, now / 1000, amp));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [level]);

  return (
    <svg
      width={size}
      height={(size * 132) / 120}
      viewBox="0 0 120 132"
      role="img"
      aria-label={label ?? `Bucket ${Math.round(level * 100)}% full`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={BODY} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--water)" />
          <stop offset="1" stopColor="var(--water-deep)" />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M20 40 C 20 2, 100 2, 100 40" fill="none" stroke="var(--ink-muted)" strokeWidth="3.5" strokeLinecap="round" />
      <path d={BODY} fill="#fff" />
      <g clipPath={`url(#${clipId})`}>
        <path ref={pathRef} fill={`url(#${gradId})`} />
        {complete && (
          <g transform="skewX(-15)">
            <rect className="bucket-shimmer" x="0" y="30" width="40" height="110" fill={`url(#${shineId})`} />
          </g>
        )}
      </g>
      <path d={BODY} fill="none" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
      <line x1="10" y1="40" x2="110" y2="40" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
