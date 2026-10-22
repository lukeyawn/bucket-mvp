import { Link, useSearchParams } from 'react-router-dom';
import { PlacePhoto } from '../components/PlacePhoto';
import { TierShape } from '../components/PlacePin';
import { getPlace } from '../lib/data';
import { scoreAt, formatScore } from '../lib/scores';
import { isRanked, useStore } from '../lib/store';
import { SENTIMENT_LABEL, SENTIMENTS, TIER_SHORT, TIERS, type Tier } from '../lib/types';

export function RankingsScreen() {
  const [params, setParams] = useSearchParams();
  const tier = (TIERS.includes(params.get('tier') as Tier) ? params.get('tier') : 'local') as Tier;
  const collections = useStore((s) => s.collections);
  const rankings = useStore((s) => s.rankings);
  const ranking = rankings[tier];

  const unranked = Object.values(collections)
    .map((c) => getPlace(c.placeId)!)
    .filter((p) => p && p.tier === tier && !isRanked(rankings, tier, p.id));
  const total = SENTIMENTS.reduce((n, s) => n + ranking.groups[s].length, 0);
  let position = 0;

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
      <h1>Rankings</h1>
      <div className="segmented" role="group" aria-label="Tier">
        {TIERS.map((t) => (
          <button key={t} aria-pressed={t === tier} onClick={() => setParams({ tier: t }, { replace: true })}>
            {TIER_SHORT[t]}
          </button>
        ))}
      </div>

      {unranked.length > 0 && (
        <div className="section">
          <div className="eyebrow">Not ranked yet</div>
          <div className="rows">
            {unranked.map((p) => (
              <div key={p.id} className="row" style={{ cursor: 'default' }}>
                <Link to={`/place/${p.id}`} className="thumb">
                  <PlacePhoto place={p} collection={collections[p.id]} small showTags={false} />
                </Link>
                <Link to={`/place/${p.id}`} className="row-main" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <div className="row-title">{p.name}</div>
                </Link>
                <Link to={`/rank/${p.id}`} className="btn btn-primary" style={{ minHeight: 40, padding: '0 16px', fontSize: 14 }}>
                  Rank it
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && unranked.length === 0 && (
        <div className="empty">
          <TierShape tier={tier} collected={false} size={48} />
          <p>Collect a place to start your rankings.</p>
        </div>
      )}

      {SENTIMENTS.map((s) => {
        const group = ranking.groups[s];
        if (group.length === 0) return null;
        return (
          <div key={s} className="section">
            <div className="eyebrow">{SENTIMENT_LABEL[s]}</div>
            <div className="rows">
              {group.map((pid, i) => {
                const p = getPlace(pid);
                if (!p) return null;
                position++;
                return (
                  <Link key={pid} to={`/place/${pid}`} className="row">
                    <span className="row-pos">{position}</span>
                    <span className="thumb">
                      <PlacePhoto place={p} collection={collections[pid]} small showTags={false} />
                    </span>
                    <span className="row-main">
                      <span className="row-title" style={{ display: 'block' }}>{p.name}</span>
                      <span className="muted small">{p.area}</span>
                    </span>
                    <span className="row-score">{formatScore(scoreAt(s, i, group.length))}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
