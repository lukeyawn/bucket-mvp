import { Check, ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PlacePhoto } from '../components/PlacePhoto';
import { TierBadge } from '../components/PlacePin';
import { progressOf } from '../lib/buckets';
import { friendsAverageFor, getPlace, listsContaining } from '../lib/data';
import { formatCollectedDate, useMyRank } from '../lib/hooks';
import { formatScore } from '../lib/scores';
import { useStore } from '../lib/store';
import { TIER_SHORT } from '../lib/types';
import { NotFound } from './NotFound';

export function PlaceScreen() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const from = params.get('from');
  const navigate = useNavigate();
  const place = getPlace(id);
  const collections = useStore((s) => s.collections);
  const myRank = useMyRank(place);
  if (!place) return <NotFound />;

  const collection = collections[place.id];
  const friends = friendsAverageFor(place.id);
  const inLists = listsContaining(place.id).map((l) => progressOf(l, (pid) => !!collections[pid]));
  const withFrom = (path: string) => (from ? `${path}?from=${from}` : path);

  return (
    <>
      <div className="place-hero">
        <button className="icon-btn back" aria-label="Back" onClick={() => (history.length > 1 ? navigate(-1) : navigate('/'))}>
          <ChevronLeft size={22} />
        </button>
        <PlacePhoto place={place} collection={collection} credit />
      </div>

      <div className="place-body">
        <div>
          <TierBadge tier={place.tier} />
          <h1 style={{ marginTop: 6 }}>{place.name}</h1>
          <p className="muted small" style={{ marginTop: 2 }}>
            {place.area} · {place.city}, {place.state}
          </p>
          <p style={{ marginTop: 'var(--s3)' }}>{place.description}</p>
        </div>

        <div className="card">
          <div className="eyebrow">Your rank</div>
          {myRank ? (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <h2>
                #{myRank.rank} of {myRank.of} · {TIER_SHORT[place.tier]}
              </h2>
              <span className="row-score">{formatScore(myRank.score)}</span>
            </div>
          ) : collection ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
              <p>Collected, not ranked yet.</p>
              <Link className="btn btn-primary" to={`/rank/${place.id}`} style={{ minHeight: 44 }}>
                Rank it
              </Link>
            </div>
          ) : (
            <p style={{ marginTop: 4 }}>Not collected yet</p>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="eyebrow">Friends</div>
            <span className="tag" style={{ background: 'var(--bg)' }}>Demo friends</span>
          </div>
          {friends ? (
            <>
              <h2 style={{ marginTop: 4 }}>
                {formatScore(friends.average)}{' '}
                <span className="muted small" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                  from {friends.count} friend{friends.count === 1 ? '' : 's'}
                </span>
              </h2>
              <p className="muted small" style={{ marginTop: 2 }}>
                {friends.names.join(', ')}
              </p>
            </>
          ) : (
            <p style={{ marginTop: 4 }}>None of your friends have been here yet.</p>
          )}
        </div>

        {inLists.length > 0 && (
          <div className="card">
            <div className="eyebrow">In buckets</div>
            {inLists.map(({ list, collected, total }) => (
              <Link key={list.id} to={`/buckets/${list.id}`} className="list-progress">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 6 }}>
                    <span>{list.name}</span>
                    <span className="muted">
                      {collected}/{total}
                    </span>
                  </div>
                  <div className="bar">
                    <div style={{ width: `${(collected / total) * 100}%` }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="sticky-action">
        {collection ? (
          <div className="collected-note">
            <Check size={20} /> Collected {formatCollectedDate(collection.collectedAt)}
          </div>
        ) : (
          <Link className="btn btn-primary btn-block" to={withFrom(`/collect/${place.id}`)}>
            Collect
          </Link>
        )}
      </div>
    </>
  );
}
