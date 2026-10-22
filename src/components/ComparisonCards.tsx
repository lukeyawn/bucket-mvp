import { useStore } from '../lib/store';
import type { Place } from '../lib/types';
import { PlacePhoto } from './PlacePhoto';

interface Props {
  left: Place;  // the new place
  right: Place; // the place already ranked
  onPick: (side: 'left' | 'right') => void;
}

export function ComparisonCards({ left, right, onPick }: Props) {
  const collections = useStore((s) => s.collections);
  return (
    <div className="compare">
      {([['left', left], ['right', right]] as const).map(([side, place]) => (
        <button key={`${side}-${place.id}`} className="compare-card" onClick={() => onPick(side)}>
          <div className="photo">
            <PlacePhoto place={place} collection={collections[place.id]} showTags={false} />
          </div>
          <div className="name">{place.name}</div>
        </button>
      ))}
    </div>
  );
}
