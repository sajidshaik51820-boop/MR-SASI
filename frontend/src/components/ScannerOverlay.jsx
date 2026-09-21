import React from "react";

export default function ScannerOverlay({ scanning = true, label = "AI Scanning..." }) {
  if (!scanning) return null;

  return (
    <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden border-2 border-emerald-500/60 z-20">
      {/* Corner targeting brackets */}
      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-emerald-400"></div>
      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-emerald-400"></div>
      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-emerald-400"></div>
      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-emerald-400"></div>

      {/* Laser horizontal sweep line */}
      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scanline"></div>

      {/* Center Reticle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border border-emerald-400/40 rounded-full animate-ping opacity-30"></div>
      </div>

      {/* HUD Badge */}
      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/40 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{label}</span>
      </div>
    </div>
  );
}
