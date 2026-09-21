import React, { useState, useRef } from "react";
import {
  Upload,
  Camera,
  Scan,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Activity,
  Layers,
  ChevronRight,
  HelpCircle,
  FileImage,
  Flame,
  Check,
  TrendingUp,
  Leaf,
  Droplets,
  ArrowRight,
  XCircle,
  AlertOctagon,
  Eye
} from "lucide-react";

import { preprocessImage, predictCrop } from "../services/api";
import ScannerOverlay from "../components/ScannerOverlay";
import CameraModal from "../components/CameraModal";

// Interactive presets for instant demonstration & testing of both crops and non-crop objects
const SAMPLE_PRESETS = [
  {
    name: "Healthy Plant Leaf",
    type: "healthy_leaf",
    category: "Crop",
    color: "#22c55e",
    desc: "Vibrant green chlorophyll foliar tissue without lesions."
  },
  {
    name: "Diseased Leaf (Late Blight)",
    type: "late_blight_leaf",
    category: "Crop",
    color: "#ef4444",
    desc: "Foliar specimen showing water-soaked necrotic lesions."
  },
  {
    name: "Granite Rock / Stone",
    type: "granite_rock",
    category: "Non-Crop Test",
    color: "#78716c",
    desc: "Inorganic mineral rock surface. Tests strict non-crop rejection."
  },
  {
    name: "Automobile / Car",
    type: "sports_car",
    category: "Non-Crop Test",
    color: "#3b82f6",
    desc: "Metallic vehicle shape. Tests vehicle rejection."
  },
  {
    name: "Severely Blurry Leaf",
    type: "blurry_image",
    category: "Quality Test",
    color: "#f59e0b",
    desc: "Severely blurred capture. Tests image quality gate."
  }
];

function generatePresetCanvasFile(preset) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");

  if (preset.type === "granite_rock") {
    // Synthetic rock texture (achromatic gray noise and fissures)
    ctx.fillStyle = "#78716c";
    ctx.fillRect(0, 0, 320, 320);
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 320;
      const y = Math.random() * 320;
      const gray = Math.floor(60 + Math.random() * 110);
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
    // Fissure cracks
    ctx.strokeStyle = "#292524";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(50, 40);
    ctx.lineTo(180, 160);
    ctx.lineTo(270, 280);
    ctx.stroke();
  } else if (preset.type === "sports_car") {
    // Metallic vehicle chassis
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, 0, 320, 320);
    // Blue car body
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(40, 140, 240, 70);
    // Windshield / Cabin
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(80, 140);
    ctx.lineTo(120, 90);
    ctx.lineTo(200, 90);
    ctx.lineTo(240, 140);
    ctx.closePath();
    ctx.fill();
    // Wheels
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(90, 210, 25, 0, Math.PI * 2);
    ctx.arc(230, 210, 25, 0, Math.PI * 2);
    ctx.fill();
  } else if (preset.type === "blurry_image") {
    // Blurry field
    ctx.fillStyle = "#22543d";
    ctx.fillRect(0, 0, 320, 320);
    ctx.filter = "blur(18px)";
    ctx.fillStyle = "#48bb78";
    ctx.beginPath();
    ctx.arc(160, 160, 100, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Plant Leaf
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 320, 320);
    // Leaf body
    ctx.beginPath();
    ctx.moveTo(160, 30);
    ctx.bezierCurveTo(280, 80, 290, 230, 160, 290);
    ctx.bezierCurveTo(30, 230, 40, 80, 160, 30);
    ctx.fillStyle = "#15803d";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#166534";
    ctx.stroke();

    // Veins
    ctx.beginPath();
    ctx.moveTo(160, 40);
    ctx.lineTo(160, 280);
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    for (let y = 80; y <= 240; y += 35) {
      ctx.beginPath();
      ctx.moveTo(160, y);
      ctx.quadraticCurveTo(200, y - 10, 230, y + 15);
      ctx.moveTo(160, y);
      ctx.quadraticCurveTo(120, y - 10, 90, y + 15);
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    if (preset.type === "late_blight_leaf") {
      // Necrotic lesions
      ctx.beginPath();
      ctx.ellipse(180, 140, 35, 25, Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "#451a03";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(130, 210, 30, 20, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fillStyle = "#78350f";
      ctx.fill();
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], `${preset.type}.jpg`, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 0.9);
  });
}

export default function CropScanPage({ setActivePage, setSelectedCrop }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("report");

  // Processing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingStage, setProcessingStage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fileInputRef = useRef(null);

  const STAGES = [
    "IMAGE RECEIVED",
    "IMAGE QUALITY CHECK",
    "PLANT/CROP VALIDATION",
    "PREPROCESSING",
    "CROP IDENTIFICATION",
    "DISEASE ANALYSIS",
    "GROWTH ANALYSIS",
    "FINAL REPORT"
  ];

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (JPG, JPEG, or PNG).");
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePresetSelect = async (preset) => {
    const file = await generatePresetCanvasFile(preset);
    handleFileSelect(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      // Simulate stepped progression indicator across stages
      for (let i = 0; i < STAGES.length - 1; i++) {
        setProcessingStage(STAGES[i]);
        await new Promise((r) => setTimeout(r, 140));
      }

      const result = await predictCrop(selectedFile);
      setProcessingStage("FINAL REPORT");
      setScanResult(result);
      if (result.is_crop && result.crop && setSelectedCrop) {
        setSelectedCrop(result.crop);
      }
    } catch (err) {
      setErrorMsg(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setProcessingStage(null);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setScanResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <Scan className="w-3.5 h-3.5" />
            <span>PRIMARY DIAGNOSTIC WORKBENCH</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Crop Health Scanner
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Gated multi-crop analysis with strict unrelated-image detection, lesion diagnosis, and growth staging.
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 font-mono mr-1">Demo Presets:</span>
          {SAMPLE_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handlePresetSelect(p)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-emerald-500 text-[11px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
              title={p.desc}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }}></span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Live Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`relative rounded-3xl border-2 border-dashed transition-all p-6 text-center flex flex-col items-center justify-center min-h-[340px] overflow-hidden ${
              isDragging
                ? "border-emerald-400 bg-emerald-950/20"
                : imagePreview
                ? "border-slate-800 bg-slate-950"
                : "border-slate-800 hover:border-emerald-500/50 bg-slate-900/40 hover:bg-slate-900/70 cursor-pointer"
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/jpeg,image/png,image/jpg" 
              onChange={(e) => handleFileSelect(e.target.files?.[0])} 
              className="hidden" 
            />

            {imagePreview ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={imagePreview} 
                  alt="Upload Preview" 
                  className="max-h-[300px] w-auto rounded-xl object-contain shadow-2xl border border-slate-800"
                />

                {isAnalyzing && (
                  <ScannerOverlay scanning={true} label={processingStage || "Analyzing Specimen..."} />
                )}

                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                    className="p-2 rounded-xl bg-slate-950/80 hover:bg-rose-950 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-300 text-xs shadow-lg transition-all"
                    title="Remove image"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-200">
                    Drag and drop your image here
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports JPG, JPEG, and PNG up to 20MB
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
                  >
                    Select File
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsCameraOpen(true); }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className={`flex-1 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                !selectedFile || isAnalyzing
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60 cursor-pointer hover:scale-[1.02]"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing {processingStage}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ANALYZE CROP IMAGE</span>
                </>
              )}
            </button>

            {selectedFile && (
              <button
                onClick={handleClear}
                disabled={isAnalyzing}
                className="px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
              >
                Clear
              </button>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Processing Stages Indicator */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-semibold">
                <span>Active Step: {processingStage}</span>
                <span className="animate-pulse">Running Vision Gate...</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-3/4 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Output Display */}
        <div className="lg:col-span-7">
          {!scanResult ? (
            /* Idle Guide State */
            <div className="h-full min-h-[380px] rounded-3xl bg-slate-900/30 border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                <Eye className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-slate-300">Ready for Agricultural Analysis</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload an image or pick a demo preset to inspect crop species, 
                  disease status, growth phenology, and explainable attention maps.
                </p>
              </div>
            </div>
          ) : !scanResult.is_quality_valid ? (
            /* ============================================================ */
            /* SECTION 28: IMAGE QUALITY TOO LOW STATE                      */
            /* ============================================================ */
            <div className="rounded-3xl bg-slate-900/90 border border-amber-500/30 p-8 space-y-6 text-left shadow-2xl">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <AlertOctagon className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    ⚠️ IMAGE QUALITY TOO LOW
                  </h2>
                  <p className="text-xs text-amber-400 font-mono">
                    VALIDATION CODE: QUALITY_REJECTED
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                {scanResult.message || "Please upload a clearer image showing the plant or leaf."}
              </div>

              {/* Quality Metrics Breakdown */}
              {scanResult.quality_metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Sharpness</span>
                    <span className="text-sm font-bold text-amber-400">{scanResult.quality_metrics.sharpness || "Blurry"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Blur Score</span>
                    <span className="text-sm font-mono text-slate-300">{scanResult.quality_metrics.blur_score || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Brightness</span>
                    <span className="text-sm font-mono text-slate-300">{scanResult.quality_metrics.brightness || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Contrast</span>
                    <span className="text-sm font-mono text-slate-300">{scanResult.quality_metrics.contrast || 0}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs text-slate-400">
                <p className="font-semibold text-slate-300">Truthful AI Policy Enforcement:</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Crop: <span className="font-mono text-slate-200">Unknown / Low Confidence</span></li>
                  <li>Disease: <span className="font-mono text-slate-200">Unknown / Low Confidence</span></li>
                  <li>Growth Stage: <span className="font-mono text-slate-200">Unknown / Low Confidence</span></li>
                </ul>
              </div>

              <button
                onClick={handleClear}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
              >
                UPLOAD CLEARER IMAGE
              </button>
            </div>
          ) : !scanResult.is_crop ? (
            /* ============================================================ */
            /* SECTION 27: CRITICAL NOT A CROP IMAGE STATE                  */
            /* ============================================================ */
            <div className="rounded-3xl bg-slate-900/90 border border-rose-500/40 p-8 space-y-6 text-left shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    ⚠️ NOT A CROP IMAGE
                  </h2>
                  <p className="text-xs text-rose-400 font-mono">
                    UNRELATED IMAGE GATE ENFORCED
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm text-rose-200 leading-relaxed font-medium">
                The uploaded image does not appear to contain a recognizable crop or plant. 
                Please upload a clear image of a plant, leaf, fruit, stem, or crop.
              </div>

              {/* Detected Non-Crop Object */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Detected Non-Crop Content:</span>
                  <span className="text-rose-400 font-bold font-mono">
                    {scanResult.detected_object || "Unrelated Object / Surface"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {scanResult.rejection_reason}
                </p>
              </div>

              {/* Strict Zero Guessing Enforcement Callout */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-300">Agricultural Safety Directives Followed:</p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                  <span className="text-slate-400">❌ Crop identification: Suppressed</span>
                  <span className="text-slate-400">❌ Disease diagnosis: Suppressed</span>
                  <span className="text-slate-400">❌ Growth stage estimation: Suppressed</span>
                  <span className="text-slate-400">❌ Chemical recommendations: Suppressed</span>
                </div>
              </div>

              <button
                onClick={handleClear}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg cursor-pointer"
              >
                UPLOAD ANOTHER IMAGE
              </button>
            </div>
          ) : (
            /* ============================================================ */
            /* SECTION 26: VALID CROP ANALYSIS RESULT                       */
            /* ============================================================ */
            <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 space-y-6 text-left shadow-2xl">
              {/* Header Status Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Image status: Plant / Crop detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                    scanResult.health_status === "Healthy"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : scanResult.health_status === "Diseased"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}>
                    {scanResult.health_status}
                  </span>
                  <span className="text-slate-500 text-xs font-mono">
                    {scanResult.processing_time_ms}ms
                  </span>
                </div>
              </div>

              {/* Primary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Crop Identified</span>
                  <span className="text-sm font-bold text-white block mt-0.5 truncate">{scanResult.crop || "Unknown"}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {scanResult.crop_confidence > 0 ? `${scanResult.crop_confidence}% conf` : "Low Confidence"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Disease Diagnosis</span>
                  <span className="text-sm font-bold text-white block mt-0.5 truncate">{scanResult.disease || "None"}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {scanResult.disease_confidence > 0 ? `${scanResult.disease_confidence}% conf` : "Diagnostic"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Risk / Severity</span>
                  <span className={`text-sm font-bold block mt-0.5 ${
                    scanResult.risk_level === "High" ? "text-rose-400" : scanResult.risk_level === "Medium" ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {scanResult.risk_level || "Low"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{scanResult.affected_ratio}% lesion area</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Growth Stage</span>
                  <span className="text-sm font-bold text-teal-300 block mt-0.5 truncate">
                    {scanResult.growth_stage || "Vegetative"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Phenological</span>
                </div>
              </div>

              {/* Sub-View Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {["report", "visual_ai", "next_steps"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* TAB 1: Report & Symptoms */}
              {activeTab === "report" && (
                <div className="space-y-4 text-xs">
                  {/* Visible Symptoms */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                      VISIBLE SYMPTOMS & SPECTRUM
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      {scanResult.visible_symptoms}
                    </p>
                    {scanResult.pathogen && (
                      <p className="text-slate-400 font-mono text-[11px] pt-1">
                        Associated Pathogen: <span className="text-emerald-400">{scanResult.pathogen}</span>
                      </p>
                    )}
                  </div>

                  {/* Growth Stage Summary */}
                  {scanResult.growth_stage_info && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                          GROWTH STAGE: {scanResult.growth_stage_info.stage_name}
                        </h4>
                        <button
                          onClick={() => setActivePage("growth")}
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View Full Timeline <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-slate-300">
                        {scanResult.growth_stage_info.description}
                      </p>
                      <p className="text-slate-400 text-[11px] italic">
                        {scanResult.growth_stage_info.note}
                      </p>
                    </div>
                  )}

                  {/* Sustainable Care Snapshot */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                        SUSTAINABLE / NATURAL CARE PRACTICES
                      </h4>
                      <button
                        onClick={() => setActivePage("sustainable")}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Explore Natural Care <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <ul className="space-y-1.5 text-slate-300">
                      {(scanResult.sustainable_care || []).slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: Visual AI Analysis */}
              {activeTab === "visual_ai" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Original Image</span>
                      <img 
                        src={scanResult.original_b64} 
                        alt="Original" 
                        className="rounded-lg w-full aspect-square object-cover"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">OpenCV Preprocessed</span>
                      <img 
                        src={scanResult.enhanced_b64 || scanResult.resized_b64 || scanResult.original_b64} 
                        alt="Preprocessed" 
                        className="rounded-lg w-full aspect-square object-cover"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-center">
                      <span className="text-[10px] font-mono text-emerald-400 block uppercase">Attention Heatmap</span>
                      <img 
                        src={scanResult.overlay_b64 || scanResult.attention_heatmap_b64 || scanResult.original_b64} 
                        alt="Attention Overlay" 
                        className="rounded-lg w-full aspect-square object-cover border border-emerald-500/30"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                    Highlighted regions indicate areas that contributed to the model's visual feature analysis. 
                    (Does not claim to be a pixel-exact disease boundary).
                  </p>
                </div>
              )}

              {/* TAB 3: Next Steps */}
              {activeTab === "next_steps" && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    RECOMMENDED NEXT STEPS
                  </h4>
                  <ul className="space-y-2 text-slate-300">
                    {(scanResult.recommendations || scanResult.next_steps || []).map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                    <strong>Pesticide Safety Advisory:</strong> Do not automatically apply chemical pesticides from a photograph. 
                    Always verify symptoms with local agricultural extension officers and read product labels before spraying.
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons to other 10 pages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setActivePage("growth")}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-emerald-400 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Growth Stages</span>
                </button>

                <button
                  onClick={() => setActivePage("disease")}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-emerald-400 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Disease Explorer</span>
                </button>

                <button
                  onClick={() => setActivePage("sustainable")}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-emerald-400 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Natural Care</span>
                </button>

                <button
                  onClick={() => setActivePage("care")}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-emerald-400 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Crop Care</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraModal 
          isOpen={isCameraOpen} 
          onClose={() => setIsCameraOpen(false)} 
          onCapture={(file) => {
            setIsCameraOpen(false);
            handleFileSelect(file);
          }} 
        />
      )}
    </div>
  );
}
