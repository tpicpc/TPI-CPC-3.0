"use client";

import { Camera, CameraOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Camera QR scanner. Uses the native BarcodeDetector when available and falls back
 * to jsQR (loaded on demand). Calls onScan(text) at most once per 2.5s per payload.
 */
export default function QrScanner({ onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const lastRef = useRef({ text: "", at: 0 });
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);
  useEffect(() => stop, [stop]);

  const start = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setActive(true);

      let detector = null;
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try { detector = new window.BarcodeDetector({ formats: ["qr_code"] }); } catch {}
      }
      const jsQR = detector ? null : (await import("jsqr")).default;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const emit = (text) => {
        const now = Date.now();
        if (text === lastRef.current.text && now - lastRef.current.at < 2500) return;
        lastRef.current = { text, at: now };
        onScan(text);
      };
      const tick = async () => {
        if (!streamRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          try {
            if (detector) {
              const codes = await detector.detect(video);
              if (codes[0]?.rawValue) emit(codes[0].rawValue);
            } else {
              const w = (canvas.width = video.videoWidth);
              const h = (canvas.height = video.videoHeight);
              ctx.drawImage(video, 0, 0, w, h);
              const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
              if (code?.data) emit(code.data);
            }
          } catch {}
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      setError(e?.name === "NotAllowedError" ? "Camera permission was denied." : "No camera available — use the manual code box.");
      stop();
    }
  };

  return (
    <div>
      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center">
        <video ref={videoRef} playsInline muted className={`absolute inset-0 w-full h-full object-cover ${active ? "" : "hidden"}`} />
        <canvas ref={canvasRef} className="hidden" />
        {active ? (
          <div className="absolute inset-[18%] border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        ) : (
          <div className="text-center text-gray-400 px-6">
            <Camera className="mx-auto mb-2" size={32} />
            <p className="text-sm">Point the camera at a member&apos;s QR pass</p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <button type="button" onClick={active ? stop : start}
        className={`mt-3 w-full h-10 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ${active ? "border border-input hover:bg-accent" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
        {active ? <><CameraOff size={16} /> Stop camera</> : <><Camera size={16} /> Start scanning</>}
      </button>
    </div>
  );
}
