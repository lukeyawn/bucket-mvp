import { useEffect, useRef, useState } from 'react';
import { ImagePlus, RotateCcw } from 'lucide-react';
import { fileToJpeg, toJpeg } from '../lib/photos';

// Live webcam preview with a shutter button (desktop browsers ignore the file input's `capture`),
// plus a picker for a photo from the library.

interface Props {
  onConfirm: (photo: Blob) => void;
}

type CamState = 'starting' | 'live' | 'blocked' | 'unavailable';

export function CameraCapture({ onConfirm }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cam, setCam] = useState<CamState>(() => ('mediaDevices' in navigator ? 'starting' : 'unavailable'));
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    if (!('mediaDevices' in navigator)) return;
    navigator.mediaDevices
      .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const video = videoRef.current;
        if (video) {
          video.srcObject = s;
          video.play().catch(() => {});
        }
        setCam('live');
      })
      .catch((err: DOMException) => setCam(err.name === 'NotAllowedError' ? 'blocked' : 'unavailable'));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);

  const shoot = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const blob = await toJpeg(video, video.videoWidth, video.videoHeight);
    setPhoto({ blob, url: URL.createObjectURL(blob) });
  };

  const pick = async (file: File | undefined) => {
    if (!file) return;
    const blob = await fileToJpeg(file);
    setPhoto({ blob, url: URL.createObjectURL(blob) });
  };

  return (
    <>
      <div className="camera">
        <video ref={videoRef} playsInline muted style={{ visibility: photo ? 'hidden' : 'visible' }} />
        {photo && <img src={photo.url} alt="Your photo" />}
        {!photo && cam === 'starting' && <div className="camera-msg">Starting camera…</div>}
        {!photo && cam === 'blocked' && (
          <div className="camera-msg">Camera is blocked for this site. Allow it in your browser's site settings, then try again.</div>
        )}
        {!photo && cam === 'unavailable' && <div className="camera-msg">Couldn't start the camera.</div>}
      </div>

      {photo ? (
        <div className="flow-actions">
          <button className="btn btn-primary btn-block" onClick={() => onConfirm(photo.blob)}>
            Use photo
          </button>
          <button className="btn btn-secondary btn-block" onClick={() => setPhoto(null)}>
            <RotateCcw size={18} /> Retake
          </button>
        </div>
      ) : (
        <div className="flow-actions" style={{ alignItems: 'center' }}>
          <button className="shutter" aria-label="Take photo" disabled={cam !== 'live'} onClick={shoot} />
          <button className="btn btn-secondary btn-block" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={18} /> Choose from library
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
      )}
    </>
  );
}
