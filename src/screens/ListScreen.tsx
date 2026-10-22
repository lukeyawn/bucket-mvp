import { Check, ChevronLeft, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BucketFill } from '../components/BucketFill';
import { TierShape } from '../components/PlacePin';
import { progressOf } from '../lib/buckets';
import { getList, getPlace } from '../lib/data';
import { useStore } from '../lib/store';
import { NotFound } from './NotFound';

export function ListScreen() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const list = getList(listId);
  const collections = useStore((s) => s.collections);
  if (!list) return <NotFound />;

  const { collected, total } = progressOf(list, (pid) => !!collections[pid]);
  const complete = collected === total;

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', paddingTop: 'var(--s3)' }}>
      <div>
        <button className="icon-btn" aria-label="Back to buckets" onClick={() => navigate('/buckets')}>
          <ChevronLeft size={22} />
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
        <BucketFill size={110} level={collected / total} complete={complete} />
        <div>
          <span className="eyebrow">{list.kind === 'destination' ? 'Destination' : 'Collection'}</span>
          <h1>{list.name}</h1>
          {complete ? (
            <span className="complete-label" style={{ marginTop: 4 }}>
              <Sparkles size={14} /> Complete
            </span>
          ) : (
            <p className="bucket-count" style={{ marginTop: 4 }}>
              {collected}/{total} collected
            </p>
          )}
        </div>
      </div>
      <p className="muted">{list.description}</p>

      <div className="rows">
        {list.placeIds.map((pid) => {
          const p = getPlace(pid);
          if (!p) return null;
          const got = !!collections[pid];
          return (
            <Link key={pid} to={`/place/${pid}?from=${list.id}`} className="row">
              <TierShape tier={p.tier} collected={got} size={28} />
              <span className="row-main">
                <span className="row-title" style={{ display: 'block' }}>{p.name}</span>
                <span className="muted small">{p.area}</span>
              </span>
              {got ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--water-deep)', fontWeight: 700, fontSize: 14 }}>
                  <Check size={18} /> Collected
                </span>
              ) : (
                <span className="muted small">Not yet</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
