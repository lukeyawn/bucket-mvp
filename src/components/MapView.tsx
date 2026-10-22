import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { Map as MapLibreMap, Marker, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Position } from '../lib/geo';
import type { Place } from '../lib/types';
import { PlacePin } from './PlacePin';

// MapLibre resolves its worker relative to its own module, which breaks once Vite bundles it.
setWorkerUrl(workerUrl);

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const AUSTIN = { center: [-97.7565, 30.2715] as [number, number], zoom: 12.6 };
const US_BOUNDS: [[number, number], [number, number]] = [
  [-125, 24],
  [-66.5, 49.5],
];

// Survives remounts so returning to the Map tab keeps the view.
let lastView = AUSTIN;

export interface PinData {
  place: Place;
  collected: boolean;
  score: number | null;
  visible: boolean;
}

export interface MapViewHandle {
  showUS: () => void;
  showAustin: () => void;
  flyTo: (lat: number, lng: number) => void;
}

interface Props {
  pins: PinData[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  here: Position | null;
  ref?: Ref<MapViewHandle>;
}

export function MapView({ pins, selectedId, onSelect, here, ref }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const hereRef = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);
  // One DOM node per pin; MapLibre positions it and React renders into it via a portal.
  const [elements] = useState(() => Object.fromEntries(pins.map((p) => [p.place.id, document.createElement('div')])));
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const map = new MapLibreMap({
      container: containerRef.current!,
      style: STYLE_URL,
      center: lastView.center,
      zoom: lastView.zoom,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;

    map.on('load', () => {
      // Nudge the muted style toward Bucket's palette.
      const paint = [
        ['background', 'background-color', '#F3F1EA'],
        ['water', 'fill-color', '#CFE2F3'],
        ['park', 'fill-color', '#E1EADA'],
      ] as const;
      for (const [layer, prop, value] of paint) {
        if (map.getLayer(layer)) map.setPaintProperty(layer, prop, value);
      }
      setReady(true);
    });
    map.on('moveend', () => {
      const c = map.getCenter();
      lastView = { center: [c.lng, c.lat], zoom: map.getZoom() };
    });
    map.on('click', () => onSelectRef.current(null));

    for (const [id, el] of Object.entries(elements)) {
      markersRef.current[id] = new Marker({ element: el, anchor: 'top', offset: [0, -18] }); // centers the 28 px shape on the point
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
      hereRef.current = null;
    };
  }, [elements]);

  // Show or hide markers as the filters change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const pin of pins) {
      const marker = markersRef.current[pin.place.id];
      if (!marker) continue;
      if (pin.visible) marker.setLngLat([pin.place.lng, pin.place.lat]).addTo(map);
      else marker.remove();
    }
  }, [pins, ready]);

  // Keep the selected pin above its neighbors.
  useEffect(() => {
    for (const [id, el] of Object.entries(elements)) el.style.zIndex = id === selectedId ? '10' : '';
  }, [selectedId, elements]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !here) return;
    if (!hereRef.current) {
      const el = document.createElement('div');
      el.className = 'here-dot';
      el.setAttribute('aria-label', 'You are here');
      hereRef.current = new Marker({ element: el, anchor: 'center' });
    }
    hereRef.current.setLngLat([here.lng, here.lat]).addTo(map);
  }, [here, ready]);

  useImperativeHandle(ref, () => ({
    showUS: () => mapRef.current?.fitBounds(US_BOUNDS, { padding: 24, duration: 1200 }),
    showAustin: () => mapRef.current?.flyTo({ center: AUSTIN.center, zoom: AUSTIN.zoom, duration: 1200 }),
    flyTo: (lat, lng) => mapRef.current?.flyTo({ center: [lng, lat], zoom: Math.max(mapRef.current.getZoom(), 13) }),
  }));

  return (
    <>
      <div ref={containerRef} className="map" />
      {pins.map((pin) =>
        createPortal(
          <PlacePin
            place={pin.place}
            collected={pin.collected}
            score={pin.score}
            selected={pin.place.id === selectedId}
            onSelect={(id) => onSelect(id)}
          />,
          elements[pin.place.id],
          pin.place.id,
        ),
      )}
    </>
  );
}
