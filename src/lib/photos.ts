import { useEffect, useState } from 'react';
import { clear, del, get, set } from 'idb-keyval';

// Photos are blobs in IndexedDB; everything else is JSON in localStorage (section 9).

const LONG_EDGE = 1280;
const QUALITY = 0.8;

/** Draws the source to a canvas with the long edge at most 1280 px and exports a JPEG. */
export function toJpeg(source: CanvasImageSource, width: number, height: number): Promise<Blob> {
  const scale = Math.min(1, LONG_EDGE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas is not available'));
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode photo'))), 'image/jpeg', QUALITY),
  );
}

/** Resizes a file picked from the library. */
export async function fileToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    return await toJpeg(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

export async function savePhoto(placeId: string, blob: Blob): Promise<string> {
  const key = `photo:${placeId}:${Date.now()}`;
  await set(key, blob);
  return key;
}

export function deletePhoto(key: string): Promise<void> {
  return del(key);
}

export function clearPhotos(): Promise<void> {
  return clear();
}

/** Object URL for a stored photo, revoked on unmount. */
export function usePhotoUrl(key: string | null | undefined): string | null {
  const [loaded, setLoaded] = useState<{ key: string; url: string } | null>(null);
  useEffect(() => {
    if (!key) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    get<Blob>(key).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setLoaded({ key, url: objectUrl });
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key]);
  return loaded && loaded.key === key ? loaded.url : null;
}
