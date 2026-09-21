import React from "react";
import { 
  Scan, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert,
  Cpu, 
  TrendingUp, 
  Leaf, 
  Satellite, 
  LayoutDashboard, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  Layers,
  History
} from "lucide-react";
import ScannerOverlay from "../components/ScannerOverlay";

export default function HomePage({ setActivePage }) {
  const workflowSteps = [
    { step: 1, title: "UPLOAD IMAGE", desc: "Drag & drop or capture leaf, fruit, or field photo." },
    { step: 2, title: "VALIDATE IMAGE", desc: "OpenCV quality & strict plant vs non-crop gate." },
    { step: 3, title: "AI ANALYSIS", desc: "Deep MobileNetV2 + Spatial Attention extraction." },
    { step: 4, title: "CROP ID", desc: "Multi-crop species identification with real confidence." },
    { step: 5, title: "DISEASE DIAGNOSIS", desc: "Pathogen, risk severity, and visible symptoms." },
    { step: 6, title: "GROWTH STAGE", desc: "Crop-specific phenological stage and checklist." },
    { step: 7, title: "SUSTAINABLE CARE", desc: "Natural IPM, bio-controls, and treatment advice." }
  ];

  const features = [
    {
      icon: Scan,
      title: "Crop Identification",
      desc: "Truthful multi-crop vision engine. Never guesses or defaults to hardcoded crops."
    },
    {
      icon: ShieldAlert,
      title: "Disease Detection",
      desc: "Real-time foliar lesion analysis, pathogen identification, and risk severity rating."
    },
    {
      icon: TrendingUp,
      title: "Growth-Stage Tracking",
      desc: "Crop-specific phenology frameworks for Rice, Tomato, Corn, Wheat, Potato, Apple, and more."
    },
    {
      icon: Leaf,
      title: "Sustainable Crop Care",
      desc: "Organic IPM, biological Trichoderma/Bacillus controls, mulching, and non-chemical practices."
    },
    {
      icon: Satellite,
      title: "Remote Sensing",
      desc: "Scientific drone & aerial vegetative indices (VARI, ExG, GLI) with RGB vs NIR clarity."
    },
    {
      icon: Eye,
      title: "AI Explainability",
      desc: "Spatial attention heatmaps and Grad-CAM highlighting exact regions influencing diagnosis."
    },
    {
      icon: History,
      title: "Scan History & Stats",
      desc: "SQLite-backed auditable records with real distribution metrics. No fabricated data."
    },
    {
      icon: AlertTriangle,
      title: "Unrelated Image Gate",
      desc: "Strictly rejects rocks, cars, people, animals, electronics, and furniture with zero guessing."
    }
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-emerald-950/40 via-slate-900/70 to-slate-950 border border-emerald-500/20 p-6 md:p-12 shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Title & Subtitle */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TRUTHFUL AGRICULTURAL ARTIFICIAL INTELLIGENCE</span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                SMART CROP <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                  HEALTH
                </span>
              </h1>
              <p className="text-emerald-400/90 font-mono text-xs sm:text-sm tracking-wider uppercase mt-2 font-semibold">
                AI-POWERED CROP DISEASE, GROWTH & HEALTH ANALYSIS
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              A comprehensive full-stack agronomic platform combining computer vision, 
              strict unrelated-image gating, crop-specific growth timelines, and sustainable 
              Integrated Pest Management.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActivePage("scan")}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-900/50 transition-all hover:scale-105 cursor-pointer"
              >
                <Scan className="w-4 h-4" />
                <span>ANALYZE MY CROP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage("knowledge")}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all hover:border-emerald-500/50 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>EXPLORE CROP KNOWLEDGE</span>
              </button>
            </div>

            {/* Unrelated Image Warning Notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Critical Validation Gate:</strong> If an uploaded image contains a rock, car, animal, 
                person, phone, or furniture, the system halts immediately with 
                <span className="font-mono text-amber-200"> "⚠️ NOT A CROP IMAGE"</span> and never guesses fake crop or disease data.
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Visual Scanner Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-slate-950/90 border border-emerald-500/30 p-4 shadow-2xl overflow-hidden">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                {/* SVG Leaf diagram */}
                <svg className="w-full h-full p-8 text-emerald-500/30" viewBox="0 0 200 200" fill="none">
                  <path 
                    d="M100 20 C140 50, 180 110, 100 180 C20 110, 60 50, 100 20 Z" 
                    fill="currentColor" 
                    stroke="#10b981" 
                    strokeWidth="2"
                  />
                  <path d="M100 20 L100 180" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M100 70 Q140 80, 150 100" stroke="#10b981" strokeWidth="1.5" />
                  <path d="M100 110 Q60 120, 50 140" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx="120" cy="95" r="14" fill="#ef4444" fillOpacity="0.6" stroke="#f87171" strokeWidth="1.5" />
                  <circle cx="75" cy="130" r="18" fill="#f59e0b" fillOpacity="0.5" stroke="#fbbf24" strokeWidth="1.5" />
                </svg>

                <ScannerOverlay scanning={true} label="Deep Vision + Biometrics Gating" />
              </div>

              {/* Status footer inside card */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Pipeline Status:</span>
                <span className="text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gated Computer Vision Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Workflow Stepper (Section 8 & 29) */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-semibold">
            SYSTEM ARCHITECTURE & PIPELINE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            How The Analysis Workflow Operates
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            From initial image validation to final sustainable recommendations, every step is executed transparently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {workflowSteps.map((s, idx) => (
            <div 
              key={s.step}
              className="relative p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    0{s.step}
                  </span>
                  {idx < workflowSteps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden lg:block -mr-1" />
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-200 tracking-wider mb-1">
                  {s.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-semibold">
            KEY CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built For Real Field Agriculture
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access CTAs */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <h3 className="text-lg font-bold text-white">Ready to inspect your crop health?</h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Upload your field photo for instant OpenCV preprocessing, non-crop validation, 
            disease severity assessment, and natural management protocols.
          </p>
        </div>
        <button
          onClick={() => setActivePage("scan")}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all cursor-pointer shrink-0"
        >
          OPEN CROP SCANNER
        </button>
      </div>
    </div>
  );
}
