import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Camera, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  Square,
  Clock,
  Radio,
  Eye
} from "lucide-react";
import { predictCrop } from "../services/api";
import ScannerOverlay from "../components/ScannerOverlay";

export default function LiveMonitorPage() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sourceType, setSourceType] = useState("webcam");
  const [currentFrame, setCurrentFrame] = useState(null);
  const [monitorStats, setMonitorStats] = useState({
    crop: "Tomato",
    disease: "Healthy Canopy",
    health_status: "Healthy",
    risk_level: "Low",
    confidence: 95.2,
    last_updated: "Just now",
    fps: 0,
    frames_processed: 0
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsMonitoring(true);

      // Start periodic frame capture and inference every 3.5s
      intervalRef.current = setInterval(processLiveFrame, 3500);
    } catch (err) {
      alert("Camera access denied or unavailable: " + err.message);
    }
  };

  const stopMonitoring = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsMonitoring(false);
  };

  const processLiveFrame = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "live_frame.jpg", { type: "image/jpeg" });
      try {
        const res = await predictCrop(file);
        setMonitorStats(prev => ({
          crop: res.crop,
          disease: res.disease,
          health_status: res.health_status,
          risk_level: res.risk_level,
          confidence: res.confidence,
          last_updated: new Date().toLocaleTimeString(),
          fps: 15,
          frames_processed: prev.frames_processed + 1
        }));
      } catch (err) {
        console.error("Live inference frame error:", err);
      }
    }, "image/jpeg", 0.7);
  };

  useEffect(() => {
    return () => stopMonitoring();
  }, []);

  return (
    <div className="space-y-10 py-6 text-left">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-2">
          <Activity className="w-3.5 h-3.5" />
          <span>EDGE IOT & WEBCAM LIVESTREAM</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Live Crop Health Telemetry
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Continuous camera feed monitoring designed for field edge sensors or drone video downlinks. 
          Samples video frames periodically to run through the ACRNN inference pipeline.
        </p>
      </div>

      {/* Main Monitoring Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Video Feed Screen */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center shadow-2xl">
            {isMonitoring ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <ScannerOverlay scanning={true} label="Continuous Live Telemetry..." />

                {/* HUD Live Dot */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-xs font-mono text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>LIVE FEED ACTIVE</span>
                </div>

                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-[11px] font-mono text-slate-300">
                  Frames: {monitorStats.frames_processed}
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
                  <Radio className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-300">Continuous Stream Standby</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect your webcam or camera feed to initiate continuous edge monitoring.
                  </p>
                </div>
                <button
                  onClick={startMonitoring}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start Live Monitor</span>
                </button>
              </div>
            )}
          </div>

          {isMonitoring && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                Sampling Rate: 1 frame every 3.5s (Bandwidth optimized)
              </span>
              <button
                onClick={stopMonitoring}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-rose-300" />
                <span>Stop Stream</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Live Diagnostics HUD */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-emerald-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isMonitoring ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}></span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  TELEMETRY HUD
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {isMonitoring ? "ACTIVE" : "OFFLINE"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Latest Detection</span>
                <span className="text-base font-extrabold text-white mt-0.5 block">
                  {monitorStats.crop} — {monitorStats.disease}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Health Status</span>
                  <span className={`text-xs font-bold font-mono mt-1 block uppercase ${
                    monitorStats.health_status === "Healthy" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {monitorStats.health_status}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Risk Level</span>
                  <span className={`text-xs font-bold font-mono mt-1 block uppercase ${
                    monitorStats.risk_level === "Low" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {monitorStats.risk_level}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Confidence</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{monitorStats.confidence}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${monitorStats.confidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Updated</span>
                </span>
                <span className="font-mono text-slate-300">{monitorStats.last_updated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
