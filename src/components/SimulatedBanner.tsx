import { MapPin } from 'lucide-react';
import { useStore } from '../lib/store';

export function SimulatedBanner() {
  const on = useStore((s) => s.settings.simulateLocation);
  if (!on) return null;
  return (
    <div className="sim-banner" role="status">
      <MapPin size={14} strokeWidth={2.5} aria-hidden="true" />
      Simulated location
    </div>
  );
}
