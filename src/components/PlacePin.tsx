import { useId } from 'react';
import { formatScore } from '../lib/scores';
import { TIER_LABEL, type Place, type Tier } from '../lib/types';

// Shape encodes tier (circle = Local, shield = State Treasure, star = Legendary), never color alone.
// Collected = filled with the tier color; not collected = white with a colored outline (section 12).

export const TIER_COLOR: Record<Tier, string> = {
  local: 'var(--tier-local)',
  state: 'var(--tier-state)',
  legendary: 'var(--tier-legendary)',
};

const SHIELD = 'M18 4 L29 8 V17 C29 24.5 24 29.5 18 32.5 C12 29.5 7 24.5 7 17 V8 Z';

const STAR = (() => {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = ((-90 + 36 * k) * Math.PI) / 180;
    const r = k % 2 === 0 ? 12 : 5.2;
    pts.push(`${(18 + r * Math.cos(a)).toFixed(2)},${(18.5 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
})();

export function TierShape({ tier, collected, size = 36 }: { tier: Tier; collected: boolean; size?: number }) {
  const ringId = useId();
  const color = TIER_COLOR[tier];
  const fill = collected ? color : '#fff';
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      {tier === 'local' && <circle cx="18" cy="18" r="11" fill={fill} stroke={color} strokeWidth="3.5" />}
      {tier === 'state' && <path d={SHIELD} fill={fill} stroke={color} strokeWidth="3" strokeLinejoin="round" />}
      {tier === 'legendary' && (
        <>
          {collected && (
            <>
              <defs>
                <linearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#F4D9F5" />
                  <stop offset="0.5" stopColor="#D9F0F7" />
                  <stop offset="1" stopColor="#F7F0D2" />
                </linearGradient>
              </defs>
              <circle cx="18" cy="18" r="16" fill="#fff" stroke={`url(#${ringId})`} strokeWidth="3.5" />
            </>
          )}
          <polygon points={STAR} fill={fill} stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className="tier-badge" style={{ color: tier === 'state' ? 'var(--tier-state)' : 'var(--ink)' }}>
      <TierShape tier={tier} collected size={18} />
      {TIER_LABEL[tier]}
    </span>
  );
}

interface PinProps {
  place: Place;
  collected: boolean;
  score: number | null;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function PlacePin({ place, collected, score, selected, onSelect }: PinProps) {
  const label = `${place.name}, ${TIER_LABEL[place.tier]}, ${collected ? 'collected' : 'not collected'}${
    score !== null ? `, friends' average ${formatScore(score)}` : ''
  }`;
  return (
    <button
      type="button"
      className={`pin${selected ? ' selected' : ''}`}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(place.id);
      }}
    >
      <TierShape tier={place.tier} collected={collected} size={28} />
      {score !== null && <span className="pin-score">{formatScore(score)}</span>}
    </button>
  );
}
