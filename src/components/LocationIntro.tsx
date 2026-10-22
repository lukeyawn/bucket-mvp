import { MapPin } from 'lucide-react';
import { refreshHere } from '../lib/location';
import { useStore } from '../lib/store';

/** First launch: a one-line explanation before the browser's location prompt (section 5). */
export function LocationIntro() {
  const seen = useStore((s) => s.settings.seenLocationIntro);
  const markSeen = useStore((s) => s.markLocationIntroSeen);
  if (seen) return null;

  const start = () => {
    markSeen();
    // Ask the browser not to evict photos and rankings when storage runs low.
    navigator.storage?.persist?.().catch(() => {});
    refreshHere();
  };

  return (
    <div className="overlay">
      <div className="dialog" role="dialog" aria-labelledby="intro-title">
        <div className="status-icon" style={{ width: 56, height: 56 }}>
          <MapPin size={28} />
        </div>
        <h2 id="intro-title">Welcome to Bucket</h2>
        <p className="muted">
          Bucket uses your location to show what's nearby and to check that you're actually there when you collect.
        </p>
        <button className="btn btn-primary btn-block" onClick={start} autoFocus>
          Continue
        </button>
      </div>
    </div>
  );
}
