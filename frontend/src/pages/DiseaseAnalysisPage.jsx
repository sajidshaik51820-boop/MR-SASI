import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Bug, 
  Thermometer, 
  Droplets,
  Layers
} from "lucide-react";
import { getDiseases } from "../services/api";

export default function DiseaseAnalysisPage() {
  const [diseases, setDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCropFilter, setSelectedCropFilter] = useState("All");
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDiseases();
        setDiseases(data.diseases || []);
        if (data.diseases && data.diseases.length > 0) {
          setSelectedDisease(data.diseases[0]);
        }
      } catch (err) {
        console.error("Failed to load diseases:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const crops = ["All", ...Array.from(new Set(diseases.map((d) => d.crop)))];

  const filteredDiseases = diseases.filter((d) => {
    const matchCrop = selectedCropFilter === "All" || d.crop === selectedCropFilter;
    const matchSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.pathogen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.crop.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCrop && matchSearch;
  });

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>PATHOLOGY & SYMPTOMOLOGY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Disease Analysis Directory
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Pathogen profiles, visible symptom keys, environmental triggers, and verified preventive protocols.
          </p>
        </div>

        {/* Truthful Notice */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 max-w-sm">
          <span className="text-rose-400 font-semibold block mb-0.5">Zero Fake Disease Policy</span>
          When evidence is insufficient or custom weights are uncalibrated, disease is reported strictly as 
          <span className="text-slate-200 font-mono"> "Unknown / Low Confidence"</span>.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search diseases, pathogens, symptoms, or crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {crops.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCropFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCropFilter === c
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Disease List and Detailed Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Disease Cards List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">Loading diseases...</div>
          ) : filteredDiseases.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No matching diseases found.</div>
          ) : (
            filteredDiseases.map((d, i) => {
              const isSelected = selectedDisease?.name === d.name && selectedDisease?.crop === d.crop;
              return (
                <div
                  key={`${d.crop}-${d.name}-${i}`}
                  onClick={() => setSelectedDisease(d)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-rose-500/60 shadow-lg shadow-rose-950/40"
                      : "bg-slate-900/40 hover:bg-slate-900/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {d.crop}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      d.risk === "High" || d.risk === "Severe"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {d.risk} Risk
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{d.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {d.pathogen}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Disease Inspector */}
        <div className="lg:col-span-7">
          {selectedDisease ? (
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-2xl">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                    Host Crop: {selectedDisease.crop}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                    Risk Level: {selectedDisease.risk}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mt-1">
                  {selectedDisease.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Pathogen: <span className="text-rose-300 font-bold">{selectedDisease.pathogen}</span>
                </p>
              </div>

              {/* Visible Symptoms */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
                  Visible Symptoms & Appearance
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedDisease.symptoms || "Characteristic chlorotic spotting and necrotic lesions."}
                </p>
              </div>

              {/* Possible Causes & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>Environmental Triggers</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedDisease.causes || "Prolonged leaf wetness and favorable temperature."}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Affected Plant Part</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedDisease.affected_parts || "Leaves, stems, and fruits."}
                  </p>
                </div>
              </div>

              {/* Recommended Next Steps & Prevention */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2 text-xs">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block">
                  Recommended Next Steps & Prevention
                </span>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Isolate symptomatic plants to prevent air/rain-splash spread.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Switch immediately from overhead sprinkler to drip irrigation to keep foliage dry.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Prune affected lower leaves with sterilized tools; dispose of residues safely.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Consult local agricultural extension service for laboratory confirmation before spraying.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-3xl bg-slate-900/30 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
              Select a disease from the list to view in-depth pathology information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
