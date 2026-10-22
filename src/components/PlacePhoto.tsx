import { usePhotoUrl } from '../lib/photos';
import type { Collection, Place } from '../lib/types';
import { TierShape } from './PlacePin';

// Your photo if collected; otherwise the place's sourced photo if it has one, else a neutral
// placeholder; an illustrated tile in the tier color for demo-profile collections (section 5).

const TILE_BG = {
  local: ['#2E86DE', '#1F5FA8'],
  state: ['#C49A45', '#8A6418'],
  legendary: ['#3A4856', '#1D2731'],
} as const;

interface Props {
  place: Place;
  collection: Collection | undefined;
  small?: boolean; // thumbnails: smaller tags
  showTags?: boolean;
  credit?: boolean; // show the photographer and license over a sourced photo
}

export function PlacePhoto({ place, collection, small = false, showTags = true, credit = false }: Props) {
  const url = usePhotoUrl(collection?.photoKey);
  const cls = `photo-tile${small ? ' small' : ''}`;
  const isDemo = collection?.source === 'demo' || (collection && !collection.photoKey);

  if (place.photo && (!collection || isDemo)) {
    const { src, author, license, licenseUrl, sourceUrl } = place.photo;
    return (
      <div className={cls}>
        <img src={src} alt={place.name} />
        {credit && (
          <span className="photo-credit">
            Photo: <a href={sourceUrl} target="_blank" rel="noreferrer">{author}</a>
            {', '}
            {licenseUrl ? <a href={licenseUrl} target="_blank" rel="noreferrer">{license}</a> : license}
          </span>
        )}
        {showTags && isDemo && <span className="tag">Demo</span>}
      </div>
    );
  }

  if (isDemo) {
    const [a, b] = TILE_BG[place.tier];
    return (
      <div className={cls} style={{ background: `linear-gradient(160deg, ${a}, ${b})` }}>
        <Hills color="rgba(255,255,255,0.18)" />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '50%', padding: small ? 4 : 10, display: 'grid' }}>
            <TierShape tier={place.tier} collected size={small ? 18 : 40} />
          </div>
        </div>
        {showTags && <span className="tag">Demo</span>}
      </div>
    );
  }

  if (collection && url) {
    return (
      <div className={cls}>
        <img src={url} alt={`Your photo of ${place.name}`} />
        {showTags && collection.source === 'simulated' && <span className="tag tag-sim">Simulated</span>}
      </div>
    );
  }

  return (
    <div className={cls} style={{ background: '#E9E6DF' }}>
      <Hills color="#DCD8CF" />
      {!collection && !small && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 0.55 }}>
          <TierShape tier={place.tier} collected={false} size={44} />
        </div>
      )}
    </div>
  );
}

function Hills({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '55%' }}
      aria-hidden="true"
    >
      <path d="M0 40 C 20 20, 35 22, 50 34 S 80 18, 100 30 V60 H0 Z" fill={color} />
      <path d="M0 50 C 25 38, 45 44, 60 48 S 85 40, 100 46 V60 H0 Z" fill={color} />
    </svg>
  );
}
