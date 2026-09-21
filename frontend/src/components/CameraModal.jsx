import React, { useRef, useState, useEffect } from "react";
import { Camera, X, RefreshCw, AlertCircle } from "lucide-react";

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // back camera preferred for leaf

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access was denied or not supported by this browser. Please grant camera permission.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        stopCamera();
        onClose();
      }
    }, "image/jpeg", 0.92);
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Live Crop Leaf Scanner</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-sm">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
              <p className="text-xs text-rose-300 mb-2">{error}</p>
              <button
                onClick={startCamera}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Center Targeting Box */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <span className="text-[11px] font-mono text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded">
                    Position Leaf Here
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={toggleCamera}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Flip Camera</span>
          </button>

          <button
            onClick={takeSnapshot}
            disabled={!!error}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-900/40 transition-all hover:scale-105"
          >
            <Camera className="w-4 h-4" />
            <span>Capture & Analyze</span>
          </button>
        </div>
      </div>
    </div>
  );
}
