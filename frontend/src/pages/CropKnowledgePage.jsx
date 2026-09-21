import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Sprout, 
  Droplets, 
  Sun, 
  Layers, 
  ShieldAlert, 
  Bug, 
  CheckCircle2, 
  ArrowRight, 
  Info,
  Calendar,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { getCrops, getCropDetail } from "../services/api";

export default function CropKnowledgePage({ setActivePage, setSelectedCrop }) {
  const [cropsList, setCropsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCropName, setSelectedCropName] = useState("Tomato");
  const [cropDetail, setCropDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    async function loadCrops() {
      try {
        const data = await getCrops();
        const crops = data.crops || [];
        setCropsList(crops);
        if (crops.length > 0) {
          setSelectedCropName(crops[0].name);
        }
      } catch (err) {
        console.error("Failed to load crop knowledge directory:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCrops();
  }, []);

  useEffect(() => {
    async function loadDetail() {
      if (!selectedCropName) return;
      setIsDetailLoading(true);
      try {
        const detail = await getCropDetail(selectedCropName);
        setCropDetail(detail);
      } catch (err) {
        console.error("Failed to load crop detail:", err);
        setCropDetail(null);
      } finally {
        setIsDetailLoading(false);
      }
    }
    loadDetail();
  }, [selectedCropName]);

  const filteredCrops = cropsList.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.scientific_name.toLowerCase().includes(q) ||
      c.family.toLowerCase().includes(q)
    );
  });

  const handleSelectCropForAnalysis = (cropName) => {
    if (setSelectedCrop) setSelectedCrop(cropName);
    if (setActivePage) setActivePage("scan");
  };

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>AGRONOMIC REPOSITORY & COMPENDIUM</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Crop Knowledge Encyclopedia
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Searchable scientific library of crops with verified growth cycles, common pathogens, pests, and agroecological protocols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 font-semibold">
            {cropsList.length} Verified Crops Documented
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by crop name, scientific taxon, or botanical family..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Main Layout: Crop Cards Selector & In-depth Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Crop Cards List */}
        <div className="lg:col-span-4 space-y-3 max-h-[650px] overflow-y-auto pr-1 scrollbar-thin">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 text-xs font-mono">Loading crops catalog...</div>
          ) : filteredCrops.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">No matching crops found.</div>
          ) : (
            filteredCrops.map((c) => {
              const isSelected = selectedCropName.toLowerCase() === c.name.toLowerCase();
              return (
                <div
                  key={c.name}
                  onClick={() => setSelectedCropName(c.name)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/40"
                      : "bg-slate-900/40 hover:bg-slate-900/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sprout className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                      {c.name}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {c.family}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono italic">
                    {c.scientific_name}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>{c.stages_count} Stages</span>
                    <span>•</span>
                    <span>{c.diseases_count} Diseases</span>
                    <span>•</span>
                    <span>{c.pests_count} Pests</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Crop Encyclopedia Page */}
        <div className="lg:col-span-8">
          {isDetailLoading ? (
            <div className="h-full min-h-[400px] rounded-3xl bg-slate-900/40 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
              Loading {selectedCropName} dossier...
            </div>
          ) : !cropDetail ? (
            <div className="h-full min-h-[400px] rounded-3xl bg-slate-900/40 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
              Select a crop from the catalog to view verified agronomic specifications.
            </div>
          ) : (
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/20 space-y-6 shadow-2xl">
              {/* Header Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white">{cropDetail.name}</h2>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {cropDetail.family}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono italic mt-0.5">
                    Botanical: {cropDetail.scientific_name}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectCropForAnalysis(cropDetail.name)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Scan {cropDetail.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {cropDetail.description}
              </p>

              {/* Climate & Optimal Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" /> Temperature
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {cropDetail.optimal_climate?.temperature || "18 - 28°C"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block flex items-center gap-1">
                    <Layers className="w-3 h-3 text-teal-400" /> Soil pH
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {cropDetail.optimal_climate?.soil_ph || "6.0 - 6.8"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" /> Water Needs
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate block">
                    {cropDetail.optimal_climate?.water_needs || "1 - 1.5 in/wk"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-400" /> Growth Period
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {cropDetail.growth_cycle_days || "90-120 days"}
                  </span>
                </div>
              </div>

              {/* Phenological Growth Stages (Section 22) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Growth Stages Sequence ({cropDetail.growth_stages?.length || 0} Stages)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(cropDetail.growth_stages || []).map((s) => (
                    <div key={s.stage_number} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          Stage {s.stage_number}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {s.duration_days}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-200">{s.name}</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {s.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Diseases & Pests (Section 22) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Diseases */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Common Diseases & Pathogens</span>
                  </h4>
                  <div className="space-y-2">
                    {(cropDetail.common_diseases || []).map((d, i) => (
                      <div key={i} className="text-xs border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                        <span className="font-bold text-slate-200 block">{d.name}</span>
                        <span className="text-[10px] font-mono text-rose-400/90 block">{d.pathogen}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{d.symptoms}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Pests */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5" />
                    <span>Common Pests & Damage Vectors</span>
                  </h4>
                  <div className="space-y-2">
                    {(cropDetail.common_pests || []).map((p, i) => (
                      <div key={i} className="text-xs border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                        <span className="font-bold text-slate-200 block">{p.name}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{p.damage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sustainable Care Practices for this Crop */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2.5 text-xs">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sustainable Agronomic Care Protocols</span>
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {(cropDetail.sustainable_care || []).map((care, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{care}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
