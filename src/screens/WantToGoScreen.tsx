import { Bookmark, Check, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PlacePhoto } from '../components/PlacePhoto';
import { getPlace } from '../lib/data';
import { useStore } from '../lib/store';

export function WantToGoScreen() {
  const navigate = useNavigate();
  const wantToGo = useStore((s) => s.wantToGo);
  const collections = useStore((s) => s.collections);

  // Most recently saved first.
  const saved = Object.entries(wantToGo)
    .sort(([, a], [, b]) => b.localeCompare(a))
    .map(([pid]) => getPlace(pid))
    .filter((p) => p !== undefined);
  const collected = saved.filter((p) => collections[p.id]).length;

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', paddingTop: 'var(--s3)' }}>
      <div>
        <button className="icon-btn" aria-label="Back to Discover" onClick={() => navigate('/')}>
          <ChevronLeft size={22} />
        </button>
      </div>
      <div>
        <h1>Want to go</h1>
        {saved.length > 0 && (
          <p className="bucket-count" style={{ marginTop: 4 }}>
            {collected}/{saved.length} collected
          </p>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="empty">
          <Bookmark size={40} aria-hidden="true" />
          <p>Tap Want to go on a place in Discover to save it here.</p>
        </div>
      ) : (
        <div className="rows">
          {saved.map((p) => {
            const collection = collections[p.id];
            return (
              <Link key={p.id} to={`/place/${p.id}`} className="row">
                <span className="thumb">
                  <PlacePhoto place={p} collection={collection} small showTags={false} />
                </span>
                <span className="row-main">
                  <span className="row-title" style={{ display: 'block' }}>{p.name}</span>
                  <span className="muted small">{p.area}</span>
                </span>
                {collection ? (
                  <span className="collected-tag">
                    <Check size={18} /> Collected
                  </span>
                ) : (
                  <span className="muted small">Not yet</span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
