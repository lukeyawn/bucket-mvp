import { Bookmark, BookmarkCheck, Check, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlacePhoto } from '../components/PlacePhoto';
import { TierBadge } from '../components/PlacePin';
import { friendsAverageFor, friendsRankFor, places } from '../lib/data';
import { formatScore } from '../lib/scores';
import { useStore } from '../lib/store';
import { TIER_SHORT, type Place } from '../lib/types';

// Friends' favorites first; places no friend has ranked keep their seed order at the end.
const feed = [...places].sort(
  (a, b) => (friendsAverageFor(b.id)?.average ?? -1) - (friendsAverageFor(a.id)?.average ?? -1),
);

export function FeedScreen() {
  const wantCount = useStore((s) => Object.keys(s.wantToGo).length);

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s3)' }}>
        <h1>Discover</h1>
        <Link to="/want-to-go" className="btn btn-secondary" style={{ minHeight: 'var(--tap)', padding: '0 16px', fontSize: 14 }}>
          <Bookmark size={16} aria-hidden="true" /> Want to go{wantCount > 0 && ` · ${wantCount}`}
        </Link>
      </div>
      <div className="feed">
        {feed.map((place) => (
          <FeedCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}

function FeedCard({ place }: { place: Place }) {
  const collection = useStore((s) => s.collections[place.id]);
  const wanted = useStore((s) => !!s.wantToGo[place.id]);
  const toggleWantToGo = useStore((s) => s.toggleWantToGo);
  const rank = friendsRankFor(place.id);
  const friends = friendsAverageFor(place.id);

  return (
    <article className="feed-card">
      <Link to={`/place/${place.id}`} className="feed-link">
        <div className="feed-photo">
          <PlacePhoto place={place} collection={collection} />
        </div>
        <div className="feed-body">
          <TierBadge tier={place.tier} />
          <h2>{place.name}</h2>
          <p className="feed-why muted">{place.why}</p>
          {rank && friends && (
            <p className="feed-rank">
              <Users size={16} aria-hidden="true" />
              #{rank.rank} of {rank.of} {TIER_SHORT[place.tier]} among friends · {formatScore(friends.average)}
            </p>
          )}
        </div>
      </Link>
      <div className="feed-actions">
        {collection ? (
          <span className="collected-tag">
            <Check size={18} /> Collected
          </span>
        ) : (
          <button
            className="btn btn-secondary want-btn"
            aria-pressed={wanted}
            onClick={() => toggleWantToGo(place.id)}
            style={{ minHeight: 'var(--tap)', padding: '0 16px', fontSize: 14 }}
          >
            {wanted ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
            Want to go
          </button>
        )}
      </div>
    </article>
  );
}
