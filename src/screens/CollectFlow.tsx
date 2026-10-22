import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { LoaderCircle, MapPinOff, Navigation, WifiOff, X } from 'lucide-react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BucketFill } from '../components/BucketFill';
import { CameraCapture } from '../components/CameraCapture';
import { pickAnimatedList, progressOf, type ListProgress } from '../lib/buckets';
import { getPlace, listsContaining } from '../lib/data';
import { collectCheck, formatDistance, MAX_ACCURACY_M, simulatedPosition, type Position } from '../lib/geo';
import { getPosition, type LocationError } from '../lib/location';
import { savePhoto } from '../lib/photos';
import { useStore } from '../lib/store';
import type { Place } from '../lib/types';
import { NotFound } from './NotFound';

type Step =
  | { kind: 'locating' }
  | { kind: 'tooFar'; distanceM: number }
  | { kind: 'weakSignal'; accuracyM: number }
  | { kind: 'approximate' }
  | { kind: 'error'; error: LocationError }
  | { kind: 'camera'; pos: Position }
  | { kind: 'saved'; main: ListProgress | null; others: ListProgress[] };

export function CollectFlow() {
  const { id } = useParams();
  const place = getPlace(id);
  if (!place) return <NotFound />;
  return <Collect key={place.id} place={place} />;
}

function Collect({ place }: { place: Place }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const simulate = useStore((s) => s.settings.simulateLocation);
  const alreadyCollected = useStore((s) => !!s.collections[place.id]);
  const addCollection = useStore((s) => s.addCollection);
  const [step, setStep] = useState<Step>({ kind: 'locating' });
  const [saving, setSaving] = useState(false);

  const locate = useCallback(async () => {
    setStep({ kind: 'locating' });
    let pos: Position;
    try {
      pos = simulate ? simulatedPosition(place) : await getPosition();
    } catch (error) {
      setStep({ kind: 'error', error: error as LocationError });
      return;
    }
    const result = collectCheck(place, pos);
    if (result.kind === 'ok') setStep({ kind: 'camera', pos });
    else if (result.kind === 'tooFar') setStep({ kind: 'tooFar', distanceM: result.distanceM });
    else if (result.kind === 'weakSignal') setStep({ kind: 'weakSignal', accuracyM: result.accuracyM });
    else setStep({ kind: 'approximate' });
  }, [place, simulate]);

  useEffect(() => {
    if (!alreadyCollected) locate();
    // Run once on open; retries are explicit.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (alreadyCollected && step.kind !== 'saved') return <Navigate to={`/place/${place.id}`} replace />;

  const save = async (photo: Blob, pos: Position) => {
    setSaving(true);
    const photoKey = await savePhoto(place.id, photo);
    const isCollected = (pid: string) => pid === place.id || !!useStore.getState().collections[pid];
    const after = listsContaining(place.id).map((l) => progressOf(l, isCollected));
    const main = pickAnimatedList(after, params.get('from'));
    // Show the saved step before the store marks the place collected, so the redirect above doesn't fire.
    setStep({ kind: 'saved', main, others: after.filter((p) => p !== main) });
    addCollection({
      placeId: place.id,
      collectedAt: new Date().toISOString(),
      photoKey,
      lat: pos.lat,
      lng: pos.lng,
      accuracyM: pos.accuracy,
      source: simulate ? 'simulated' : 'live',
    });
    setSaving(false);
  };

  const close = () => navigate(`/place/${place.id}`, { replace: true });

  return (
    <div className="flow">
      <div className="flow-top">
        <span className="eyebrow">Collect · {place.name}</span>
        {step.kind !== 'saved' && (
          <button className="icon-btn" aria-label="Cancel" onClick={close} style={{ boxShadow: 'none', background: 'none' }}>
            <X size={22} />
          </button>
        )}
      </div>

      {step.kind === 'locating' && (
        <Status icon={<LoaderCircle size={34} className="spin" />} title="Checking your location…" />
      )}

      {step.kind === 'tooFar' && (
        <Status
          icon={<Navigation size={30} />}
          title={`You're ${formatDistance(step.distanceM)} from ${place.name}.`}
          body={`Get within ${place.radiusM} m to collect.`}
          onRetry={locate}
        />
      )}

      {step.kind === 'weakSignal' && (
        <Status
          icon={<WifiOff size={30} />}
          title={`Your location is only accurate to ${Math.round(step.accuracyM)} m; collecting needs ${MAX_ACCURACY_M} m or better.`}
          body="Move near a window, make sure Wi-Fi is on, and try again."
          onRetry={locate}
        />
      )}

      {step.kind === 'approximate' && (
        <Status
          icon={<WifiOff size={30} />}
          title="Your location is only approximate."
          body="Turn on Wi-Fi and location services, then try again."
          onRetry={locate}
        />
      )}

      {step.kind === 'error' && (
        <Status
          icon={<MapPinOff size={30} />}
          title={step.error === 'blocked' ? 'Location is blocked for this site.' : "Couldn't get your location."}
          body={step.error === 'blocked' ? "Allow it in your browser's site settings to collect." : 'Try again.'}
          onRetry={locate}
        />
      )}

      {step.kind === 'camera' && (
        <div className="flow-body" style={{ paddingTop: 'var(--s2)' }}>
          <p className="muted small">You're here. Take or choose a photo to collect {place.name}.</p>
          {saving ? (
            <Status icon={<LoaderCircle size={34} className="spin" />} title="Saving…" />
          ) : (
            <CameraCapture onConfirm={(blob) => save(blob, step.pos)} />
          )}
        </div>
      )}

      {step.kind === 'saved' && (
        <>
          <div className="flow-center">
            <span className="eyebrow">Collected</span>
            <h1>{place.name}</h1>
            {step.main && (
              <>
                <BucketFill
                  size={150}
                  from={(step.main.collected - 1) / step.main.total}
                  level={step.main.collected / step.main.total}
                  complete={step.main.collected === step.main.total}
                />
                <h2>{step.main.list.name}</h2>
                <p className="muted" style={{ fontWeight: 700 }}>
                  {step.main.collected === step.main.total ? 'Bucket complete!' : `${step.main.collected}/${step.main.total}`}
                </p>
              </>
            )}
            {step.others.length > 0 && (
              <div className="bucket-chips">
                {step.others.map((p) => (
                  <span key={p.list.id} className="bucket-chip">
                    +1 {p.list.name} · {p.collected}/{p.total}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flow-actions">
            <button className="btn btn-primary btn-block" onClick={() => navigate(`/rank/${place.id}`, { replace: true })}>
              Rank it
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Status({ icon, title, body, onRetry }: { icon: ReactNode; title: string; body?: string; onRetry?: () => void }) {
  return (
    <>
      <div className="flow-center" role="status">
        <div className="status-icon">{icon}</div>
        <h2 style={{ maxWidth: 320 }}>{title}</h2>
        {body && <p className="muted" style={{ maxWidth: 320 }}>{body}</p>}
      </div>
      {onRetry && (
        <div className="flow-actions">
          <button className="btn btn-primary btn-block" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </>
  );
}
