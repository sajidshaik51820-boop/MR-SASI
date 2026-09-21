import React, { useState, useRef } from "react";
import { 
  Satellite, 
  Plane, 
  MapPin, 
  Layers, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  Upload, 
  FileImage, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { analyzeRemoteSensing } from "../services/api";
import ScannerOverlay from "../components/ScannerOverlay";

const FIELD_PRESETS = [
  {
    name: "Drone Field Survey — Localized Corn Blight",
    index: "VARI",
    desc: "UAV orthomosaic field with active necrotic spots in southern quadrant.",
    drawType: "drone_blight"
  },
  {
    name: "Satellite Sentinel-2 — Orchard Moisture Stress",
    index: "VARI",
    desc: "Macro canopy view showing moisture and chlorosis gradient across blocks.",
    drawType: "satellite_stress"
  },
  {
    name: "UAV Vineyard Canopy — Excess Green (ExG)",
    index: "EXG",
    desc: "Row-crop vineyard separating vine canopy from inter-row bare soil.",
    drawType: "vineyard_exg"
  }
];

function generateFieldSampleFile(preset) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");

  // Soil/Field Base
  ctx.fillStyle = "#574133";
  ctx.fillRect(0, 0, 600, 400);

  if (preset.drawType === "vineyard_exg") {
    // Parallel crop rows
    for (let x = 40; x < 600; x += 55) {
      ctx.fillStyle = "#15803d";
      ctx.fillRect(x, 20, 24, 360);
      // foliage clumps
      for (let y = 30; y < 380; y += 18) {
        ctx.beginPath();
        ctx.arc(x + 12, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = y > 240 && x > 300 ? "#854d0e" : "#16a34a";
        ctx.fill();
      }
    }
  } else if (preset.drawType === "satellite_stress") {
    // Large field parcels
    ctx.fillStyle = "#166534"; // Parcel A (Healthy)
    ctx.fillRect(30, 30, 250, 340);

    ctx.fillStyle = "#84cc16"; // Parcel B (Moderate)
    ctx.fillRect(310, 30, 260, 160);

    ctx.fillStyle = "#b45309"; // Parcel C (Stress/Dry)
    ctx.fillRect(310, 210, 260, 160);

    // Grid lines / farm roads
    ctx.strokeStyle = "#a8a29e";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 250, 340);
    ctx.strokeRect(310, 30, 260, 160);
    ctx.strokeRect(310, 210, 260, 160);
  } else {
    // Continuous crop canopy with blight patch
    ctx.fillStyle = "#15803d";
    ctx.fillRect(20, 20, 560, 360);

    // Texture dots
    for (let i = 0; i < 600; i++) {
      const rx = 30 + Math.random() * 540;
      const ry = 30 + Math.random() * 340;
      ctx.beginPath();
      ctx.arc(rx, ry, 3 + Math.random() * 5, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e";
      ctx.fill();
    }

    // Diseased stress pocket (Southern / Center-Right)
    const g = ctx.createRadialGradient(420, 260, 10, 420, 260, 110);
    g.addColorStop(0, "#7f1d1d"); // Severe necrotic red/brown
    g.addColorStop(0.5, "#d97706"); // Chlorotic yellow
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(420, 260, 110, 0, Math.PI * 2);
    ctx.fill();
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], `${preset.name.replace(/\s+/g, "_")}.jpg`, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 0.9);
  });
}

export default function RemoteSensingPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [indexType, setIndexType] = useState("VARI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file.");
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
  };

  const handlePresetSelect = async (preset) => {
    setIndexType(preset.index);
    const file = await generateFieldSampleFile(preset);
    handleFileChange(file);
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage("Please upload or choose a remote-sensing field image first.");
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await analyzeRemoteSensing(selectedFile, indexType);
      setAnalysisResult(res);
    } catch (err) {
      console.error("Remote sensing error:", err);
      setErrorMessage(err.message || "Failed to process remote-sensing image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12 py-6 text-left">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium mb-2">
          <Satellite className="w-3.5 h-3.5" />
          <span>SATELLITE & DRONE CANOPY MAPPING</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Remote Sensing & Aerial Crop Health Analysis
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Survey field-scale imagery captured by drones (UAVs) or Sentinel-2 satellite missions. 
          Calculates real vegetative health indices (VARI & ExG), segments photosynthetic canopy, 
          and identifies localized disease outbreaks and moisture stress.
        </p>
      </div>

      {/* Scientific Authenticity Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">Scientific Authenticity Policy: </strong>
          Standard RGB imagery from drones operates in visible light. We compute real visible vegetation indices 
          like <span className="text-emerald-400 font-mono">VARI (G - R) / (G + R - B)</span> and 
          <span className="text-emerald-400 font-mono"> ExG (2G - R - B)</span> rather than simulating fake multispectral NIR channels. 
          When Sentinel-2 4-band GeoTIFF data is integrated, calibrated NIR/Red NDVI is computed.
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs underline hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Upload & Control Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upload Zone */}
        <div className="lg:col-span-7 space-y-6">
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
            }}
            className={`rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
              previewUrl 
                ? "border-cyan-500/40 bg-slate-900/40" 
                : "border-slate-700 hover:border-cyan-500/50 bg-slate-900/20"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative mx-auto max-w-md aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-black">
                  <img src={previewUrl} alt="Remote Sensing Input" className="w-full h-full object-contain" />
                  <ScannerOverlay scanning={isProcessing} label="Computing Vegetation Indices..." />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  {/* Data Type Selector */}
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 font-mono">DATA TYPE:</span>
                    <select
                      className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
                      defaultValue="Drone"
                    >
                      <option value="RGB" className="bg-slate-900 text-white">RGB Field</option>
                      <option value="Drone" className="bg-slate-900 text-white">Drone / UAV</option>
                      <option value="Satellite" className="bg-slate-900 text-white">Satellite</option>
                      <option value="Multispectral" className="bg-slate-900 text-white">Multispectral (Sim)</option>
                    </select>
                  </div>

                  {/* Index Selector */}
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 font-mono">Algorithm:</span>
                    <select
                      value={indexType}
                      onChange={(e) => setIndexType(e.target.value)}
                      className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="VARI" className="bg-slate-900 text-white">VARI (Atmospherically Resistant)</option>
                      <option value="EXG" className="bg-slate-900 text-white">ExG (Excess Green Canopy)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleRunAnalysis}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-900/40 transition-all hover:scale-105 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Remote Sensing...</span>
                      </>
                    ) : (
                      <>
                        <Satellite className="w-4 h-4" />
                        <span>Run Remote Sensing Analysis</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setAnalysisResult(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400">
                  <Plane className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">
                    Upload Drone (UAV) or Satellite Orthomosaic
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts geo-referenced or field crop photos (JPG, PNG)
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  Browse Field Image
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Verified Demo Orthomosaics */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Verified Field Presets (Instant Demo)
            </h4>
            <div className="space-y-2.5">
              {FIELD_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {preset.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{preset.desc}</p>
                    <span className="inline-block text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50 mt-1.5">
                      Algorithm: {preset.index}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Output Section */}
      {analysisResult && (
        <div className="space-y-8 animate-fade-in">
          {/* Summary Scorecard */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
                  REMOTE SENSING FIELD SURVEY REPORT
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  Field Canopy Health & Stress Distribution
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">
                  Index: <strong className="text-slate-200">{analysisResult.index_type}</strong>
                </span>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase ${
                  analysisResult.risk_level === "Low"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : analysisResult.risk_level === "Medium"
                    ? "bg-amber-950 text-amber-400 border border-amber-800"
                    : "bg-rose-950 text-rose-400 border border-rose-800"
                }`}>
                  Field Risk: {analysisResult.risk_level}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-500 block font-mono uppercase">Canopy Coverage</span>
                <span className="text-2xl font-black text-slate-100">
                  {analysisResult.vegetation_coverage_pct}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Surveyed field vegetation</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-emerald-500 block font-mono uppercase">Healthy Canopy</span>
                <span className="text-2xl font-black text-emerald-400">
                  {analysisResult.healthy_area_pct}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">High photosynthetic index</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-amber-500 block font-mono uppercase">Moderate Stress</span>
                <span className="text-2xl font-black text-amber-400">
                  {analysisResult.moderate_stress_pct}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Early chlorosis / moisture deficit</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-rose-500 block font-mono uppercase">Severe Stress / Blight</span>
                <span className="text-2xl font-black text-rose-400">
                  {analysisResult.severe_stress_pct}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Necrosis / pathogen alert</span>
              </div>
            </div>

            {/* Visual Heatmaps & Zoning Maps */}
            <div className="space-y-4 mb-8">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Multi-Spectral Vegetative Health Visualization
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map 1 */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">1. Canopy Segmentation Mask</span>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
                    <img src={analysisResult.vegetation_mask_b64} alt="Canopy Mask" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] text-slate-500">ExG binary threshold separating green crops from bare soil.</p>
                </div>

                {/* Map 2 */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">2. Discrete Health Zoning</span>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
                    <img src={analysisResult.health_map_b64} alt="Health Zoning" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded bg-emerald-500"></span>Healthy</span>
                    <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded bg-amber-500"></span>Moderate</span>
                    <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded bg-rose-500"></span>Severe</span>
                  </div>
                </div>

                {/* Map 3 */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">3. Continuous Stress Heatmap (JET)</span>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
                    <img src={analysisResult.stress_heatmap_b64} alt="Stress Heatmap" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] text-slate-500">Continuous index gradients overlaid on orthomosaic.</p>
                </div>
              </div>
            </div>

            {/* Agronomic Recommendations for Field Scale */}
            <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                FIELD SCOUTING & CROP MANAGEMENT DIRECTIVES
              </h4>
              <p className="text-xs text-slate-300 font-medium">{analysisResult.analysis_summary}</p>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-cyan-900/40">
                {analysisResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
