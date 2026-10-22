import { useEffect, useMemo, useRef, useState } from 'react';
import { Globe, LocateFixed, MapPin } from 'lucide-react';
import { MapView, type MapViewHandle, type PinData } from '../components/MapView';
import { PlaceSheet } from '../components/PlaceSheet';
import { TierShape } from '../components/PlacePin';
import { friendsAverageFor, getPlace, places } from '../lib/data';
import { refreshHere, useHere } from '../lib/location';
import { useStore } from '../lib/store';
import { TIER_SHORT, TIERS, type Tier } from '../lib/types';

type TierFilter = Tier | 'all';
type StatusFilter = 'all' | 'collected' | 'not';

// Filters survive tab switches within a session.
let savedFilters: { tier: TierFilter; status: StatusFilter } = { tier: 'all', status: 'all' };

export function MapScreen() {
  const collections = useStore((s) => s.collections);
  const seenIntro = useStore((s) => s.settings.seenLocationIntro);
  const here = useHere((s) => s.pos);
  const [tier, setTier] = useState<TierFilter>(savedFilters.tier);
  const [status, setStatus] = useState<StatusFilter>(savedFilters.status);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<MapViewHandle>(null);
  useEffect(() => {
    savedFilters = { tier, status };
  }, [tier, status]);

  const pins: PinData[] = useMemo(
    () =>
      places.map((place) => {
        const collected = !!collections[place.id];
        const visible =
          (tier === 'all' || place.tier === tier) &&
          (status === 'all' || (status === 'collected' ? collected : !collected));
        return { place, collected, score: friendsAverageFor(place.id)?.average ?? null, visible };
      }),
    [collections, tier, status],
  );

  const selected = getPlace(selectedId ?? undefined);
  const selectedVisible = selected && pins.find((p) => p.place.id === selected.id)?.visible;

  const pickTier = (t: TierFilter) => {
    setTier(t);
    if (t === 'legendary') mapRef.current?.showUS();
    else if (tier === 'legendary') mapRef.current?.showAustin();
  };

  return (
    <div className="map-screen">
      <MapView ref={mapRef} pins={pins} selectedId={selectedId} onSelect={setSelectedId} here={here} />

      <div className="map-filters">
        <div className="chip-row" role="group" aria-label="Filter by tier">
          {(['all', ...TIERS] as TierFilter[]).map((t) => (
            <button key={t} className="chip" aria-pressed={tier === t} onClick={() => pickTier(t)}>
              {t !== 'all' && <TierShape tier={t} collected={tier !== t} size={16} />}
              {t === 'all' ? 'All' : TIER_SHORT[t]}
            </button>
          ))}
        </div>
        <div className="chip-row" role="group" aria-label="Filter by status">
          {(
            [
              ['all', 'Everything'],
              ['collected', 'Collected'],
              ['not', 'Not yet'],
            ] as [StatusFilter, string][]
          ).map(([s, label]) => (
            <button key={s} className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={`map-controls${selectedVisible ? ' raised' : ''}`}>
        <button className="icon-btn" aria-label="Show the whole US" title="Whole US" onClick={() => mapRef.current?.showUS()}>
          <Globe size={20} />
        </button>
        <button
          className="icon-btn"
          aria-label={here ? 'Go to my location' : 'Show Austin'}
          title={here ? 'My location' : 'Austin'}
          onClick={() => {
            if (here) mapRef.current?.flyTo(here.lat, here.lng);
            else mapRef.current?.showAustin();
            if (seenIntro) refreshHere();
          }}
        >
          {here ? <LocateFixed size={20} /> : <MapPin size={20} />}
        </button>
      </div>

      {selected && selectedVisible && <PlaceSheet key={selected.id} place={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
