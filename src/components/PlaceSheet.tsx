import { useRef } from 'react';
import { ChevronUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { friendsAverageFor } from '../lib/data';
import { useMyRank } from '../lib/hooks';
import { formatScore } from '../lib/scores';
import { useStore } from '../lib/store';
import type { Place } from '../lib/types';
import { TierBadge } from './PlacePin';

const SWIPE_UP_PX = 50;

export function PlaceSheet({ place, onClose }: { place: Place; onClose: () => void }) {
  const navigate = useNavigate();
  const collection = useStore((s) => s.collections[place.id]);
  const myRank = useMyRank(place);
  const friends = friendsAverageFor(place.id);
  const dragStart = useRef<number | null>(null);
  const openPage = () => navigate(`/place/${place.id}`);

  return (
    <section
      className="sheet"
      aria-label={place.name}
      onPointerDown={(e) => (dragStart.current = e.clientY)}
      onPointerUp={(e) => {
        if (dragStart.current !== null && dragStart.current - e.clientY > SWIPE_UP_PX) openPage();
        dragStart.current = null;
      }}
    >
      <button className="sheet-handle" aria-label="Open place page" onClick={openPage} />
      <div className="sheet-head">
        <div style={{ minWidth: 0 }}>
          <TierBadge tier={place.tier} />
          <h2 style={{ marginTop: 4 }}>{place.name}</h2>
          <p className="muted small" style={{ marginTop: 4 }}>
            {place.description}
          </p>
        </div>
        <button className="icon-btn" aria-label="Close" onClick={onClose} style={{ flex: 'none', boxShadow: 'none', background: 'var(--bg)' }}>
          <X size={20} />
        </button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-value">
            {myRank ? `#${myRank.rank}` : collection ? 'Unranked' : '—'}
          </div>
          <div className="stat-label">
            {myRank ? `of ${myRank.of} · your rank` : collection ? 'Collected' : 'Not collected yet'}
          </div>
        </div>
        <div className="stat">
          <div className="stat-value">{friends ? formatScore(friends.average) : '—'}</div>
          <div className="stat-label">
            {friends ? `from ${friends.count} friend${friends.count === 1 ? '' : 's'}` : 'No friends yet'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--s2)' }}>
        <button className="btn btn-secondary" onClick={openPage} style={{ flex: 1 }}>
          <ChevronUp size={18} /> Details
        </button>
        {!collection && (
          <button className="btn btn-primary" onClick={() => navigate(`/collect/${place.id}`)} style={{ flex: 1.4 }}>
            Collect
          </button>
        )}
      </div>
    </section>
  );
}
