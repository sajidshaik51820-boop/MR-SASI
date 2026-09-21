import React, { useState } from "react";
import { 
  Database, 
  Satellite, 
  Plane, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  FolderCheck, 
  FolderX,
  Code,
  Sparkles
} from "lucide-react";

export default function DatasetsPage() {
  // Real connection status: folders are initialized locally
  const [pvStatus] = useState("Dataset not connected");
  const [s2Status] = useState("Dataset not connected");
  const [uavStatus] = useState("Dataset not connected");

  return (
    <div className="space-y-12 py-6 text-left">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>DATASET EXPLORER & ACADEMIC REPOSITORIES</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Agricultural Datasets & Remote Sensing Feeds
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Comprehensive review of the training datasets, satellite missions, and UAV flight data utilized 
          for spatial feature extraction, temporal contextual learning, and canopy health monitoring.
        </p>
      </div>

      {/* Dataset 1: PlantVillage */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">PlantVillage Dataset</h3>
              <p className="text-xs text-slate-400 font-mono">Penn State University & EPFL Open Access</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs">
            <FolderX className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-slate-400">Status: </span>
            <strong className="text-amber-400">{pvStatus}</strong>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Purpose: </strong>
          PlantVillage is the standard benchmark dataset used internationally for crop and leaf-level disease classification. 
          It contains lab-controlled and field-captured foliar images across healthy and diseased conditions 
          spanning bacterial, fungal, viral, and pest-induced leaf damage.
        </p>

        {/* Classes Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Active Supported Crop Classes in ACRNN Schema (27 Active Classes):
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            {[
              { crop: "Tomato", count: "10 Classes", note: "Bacterial, Early/Late Blight, Mold, Curl Virus, Healthy" },
              { crop: "Potato", count: "3 Classes", note: "Early Blight, Late Blight, Healthy" },
              { crop: "Corn", count: "4 Classes", note: "Gray Spot, Common Rust, Blight, Healthy" },
              { crop: "Apple", count: "4 Classes", note: "Apple Scab, Black Rot, Cedar Rust, Healthy" },
              { crop: "Grape", count: "4 Classes", note: "Black Rot, Esca, Leaf Blight, Healthy" },
              { crop: "Bell Pepper", count: "2 Classes", note: "Bacterial Spot, Healthy" },
            ].map((c) => (
              <div key={c.crop} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400 block">{c.crop}</span>
                <span className="text-[11px] font-mono text-slate-400 block mt-0.5">{c.count}</span>
                <span className="text-[10px] text-slate-500 block mt-1 line-clamp-2">{c.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to Connect */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <span className="text-slate-200 font-semibold block flex items-center gap-2">
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            Instructions to Connect Local PlantVillage Repository:
          </span>
          <p>
            Download the official PlantVillage dataset (e.g., from Kaggle or Torchvision) and place class folders in:
            <code className="mx-1 text-emerald-300 font-mono">datasets/plantvillage/&lt;class_name&gt;/</code>.
            Once placed, you can train or fine-tune ACRNN directly from the Model page.
          </p>
        </div>
      </div>

      {/* Dataset 2: Sentinel-2 Satellite Imagery */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Satellite className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Sentinel-2 Satellite Imagery</h3>
              <p className="text-xs text-slate-400 font-mono">ESA Copernicus Earth Observation Mission</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs">
            <FolderX className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-slate-400">Status: </span>
            <strong className="text-amber-400">{s2Status}</strong>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Purpose & Concept: </strong>
          Sentinel-2 is a wide-swath, high-resolution, multi-spectral imaging mission comprising twin satellites (2A & 2B). 
          With a 5-day revisit cycle and 13 spectral bands, it provides continuous regional monitoring of vegetative health, 
          soil moisture, and macro-scale drought or fungal epidemics.
        </p>

        {/* Multispectral Bands Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Sentinel-2 Multispectral Bands relevant to Crop Health:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-mono text-cyan-400 font-bold block">Band 2 (Blue - 490 nm)</span>
              <span className="text-[11px] text-slate-400 block mt-1">10m Res: Atmospheric aerosol & soil distinction</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-mono text-emerald-400 font-bold block">Band 3 (Green - 560 nm)</span>
              <span className="text-[11px] text-slate-400 block mt-1">10m Res: Peak chlorophyll reflectance</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-mono text-rose-400 font-bold block">Band 4 (Red - 665 nm)</span>
              <span className="text-[11px] text-slate-400 block mt-1">10m Res: Maximum photosynthetic absorption</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-mono text-teal-300 font-bold block">Band 8 (NIR - 842 nm)</span>
              <span className="text-[11px] text-slate-400 block mt-1">10m Res: Cellular mesophyll scattering (NDVI core)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset 3: Drone / UAV High-Resolution Imagery */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Drone / UAV High-Resolution Orthomosaics</h3>
              <p className="text-xs text-slate-400 font-mono">Unmanned Aerial Vehicle Scouting at 1-5 cm/pixel</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs">
            <FolderX className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-slate-400">Status: </span>
            <strong className="text-amber-400">{uavStatus}</strong>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Purpose & Concept: </strong>
          Drone / UAV flights bridge the gap between individual leaf photography and satellite scans. 
          Operating at altitudes between 30 to 120 meters, drones capture millimeter to centimeter spatial resolution, 
          allowing precise detection of localized stress clusters, weed infiltration, and early canopy blight 
          long before it becomes visible in satellite pixels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">VARI Index</span>
            <span className="text-slate-400 text-[11px] block font-mono">(G - R) / (G + R - B)</span>
            <p className="text-slate-500 text-[11px] mt-1">
              Minimizes atmospheric distortion in visible RGB drone payloads to highlight healthy green vegetation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-teal-400 font-bold block">ExG Index</span>
            <span className="text-slate-400 text-[11px] block font-mono">2G - R - B</span>
            <p className="text-slate-500 text-[11px] mt-1">
              Maximizes spectral contrast between crop canopy and underlying bare soil or crop residue.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">Actionable Scouting</span>
            <span className="text-slate-400 text-[11px] block font-mono">GPS-Tagged Zones</span>
            <p className="text-slate-500 text-[11px] mt-1">
              Provides farmers with GPS-referenced stress coordinates for ground-truthing and targeted micro-spraying.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
