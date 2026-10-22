import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BucketFill } from '../components/BucketFill';
import { progressOf } from '../lib/buckets';
import { lists } from '../lib/data';
import { useStore } from '../lib/store';

export function BucketsScreen() {
  const collections = useStore((s) => s.collections);
  const progress = lists.map((l) => progressOf(l, (pid) => !!collections[pid]));
  const anyCollected = progress.some((p) => p.collected > 0);

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
      <h1>Buckets</h1>
      {!anyCollected && <p className="muted">Collect your first place to start filling a bucket.</p>}
      <div className="bucket-grid">
        {progress.map(({ list, collected, total }) => {
          const complete = collected === total;
          return (
            <Link key={list.id} to={`/buckets/${list.id}`} className="bucket-card">
              <BucketFill size={96} level={collected / total} complete={complete} label={`${list.name}: ${collected} of ${total} collected`} />
              <span className="bucket-name">{list.name}</span>
              {complete ? (
                <span className="complete-label">
                  <Sparkles size={14} /> Complete
                </span>
              ) : (
                <span className="bucket-count">
                  {collected}/{total}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
