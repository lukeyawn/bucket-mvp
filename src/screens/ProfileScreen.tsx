import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PlacePhoto } from '../components/PlacePhoto';
import { getPlace } from '../lib/data';
import { useStore } from '../lib/store';
import { TIER_SHORT, TIERS } from '../lib/types';

type Pending = 'demo' | 'reset' | null;

export function ProfileScreen() {
  const collections = useStore((s) => s.collections);
  const simulate = useStore((s) => s.settings.simulateLocation);
  const setSimulate = useStore((s) => s.setSimulateLocation);
  const loadDemo = useStore((s) => s.loadDemoProfile);
  const resetAll = useStore((s) => s.resetAll);
  const [pending, setPending] = useState<Pending>(null);

  const collected = Object.values(collections)
    .sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
    .map((c) => ({ c, place: getPlace(c.placeId) }))
    .filter((x) => x.place);
  const counts = TIERS.map((t) => `${TIER_SHORT[t]} ${collected.filter((x) => x.place!.tier === t).length}`).join(' · ');

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
        <div className="avatar" aria-hidden="true">L</div>
        <div>
          <h1>Luke</h1>
          <p className="muted" style={{ fontWeight: 600 }}>{counts}</p>
        </div>
      </div>

      <div className="section">
        <div className="eyebrow">Collected</div>
        {collected.length === 0 ? (
          <div className="card muted">Nothing collected yet. Find a place on the map and go collect it.</div>
        ) : (
          <div className="photo-grid">
            {collected.map(({ c, place }) => (
              <Link key={c.placeId} to={`/place/${c.placeId}`} aria-label={place!.name}>
                <PlacePhoto place={place!} collection={c} small />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="eyebrow">Settings</div>
        <div className="card" style={{ paddingTop: 'var(--s1)', paddingBottom: 'var(--s1)' }}>
          <div className="setting">
            <div>
              <div style={{ fontWeight: 650 }} id="sim-label">Simulate location</div>
              <div className="muted small">Collect any place as if you were standing there. Shows a banner.</div>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={simulate}
              aria-labelledby="sim-label"
              onClick={() => setSimulate(!simulate)}
            />
          </div>
        </div>
        <button className="btn btn-secondary btn-block" onClick={() => setPending('demo')}>
          Load demo profile
        </button>
        <button className="btn btn-danger btn-block" onClick={() => setPending('reset')}>
          Reset all data
        </button>
      </div>

      {pending === 'demo' && (
        <ConfirmDialog
          title="Load demo profile?"
          body="This replaces your collections, rankings, and photos with 12 seeded places."
          confirmLabel="Load demo profile"
          onConfirm={() => loadDemo().then(() => setPending(null))}
          onCancel={() => setPending(null)}
        />
      )}
      {pending === 'reset' && (
        <ConfirmDialog
          title="Reset all data?"
          body="This deletes every collection, ranking, and photo on this device. It can't be undone."
          confirmLabel="Reset everything"
          danger
          onConfirm={() => resetAll().then(() => setPending(null))}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
