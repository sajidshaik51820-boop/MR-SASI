import React, { useState, useEffect } from "react";
import { 
  Droplets, 
  Sun, 
  Layers, 
  Sprout, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Info,
  Bug,
  ShieldCheck,
  Calendar,
  AlertOctagon
} from "lucide-react";
import { getCrops, getCropDetail, getPestManagement } from "../services/api";

export default function CropCarePage({ selectedCrop: initialSelectedCrop }) {
  const [cropsList, setCropsList] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(initialSelectedCrop || "Tomato");
  const [cropDetail, setCropDetail] = useState(null);
  const [pestFramework, setPestFramework] = useState(null);
  const [activeTab, setActiveTab] = useState("crop_care");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [cData, pData] = await Promise.all([
          getCrops(),
          getPestManagement()
        ]);
        setCropsList(cData.crops || []);
        setPestFramework(pData);
      } catch (err) {
        console.error("Failed to load initial crop care data:", err);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function loadCropData() {
      if (!selectedCrop) return;
      setIsLoading(true);
      try {
        const data = await getCropDetail(selectedCrop);
        setCropDetail(data);
      } catch (err) {
        console.error(`Failed to load details for ${selectedCrop}:`, err);
        setCropDetail(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadCropData();
  }, [selectedCrop]);

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono mb-2">
            <Droplets className="w-3.5 h-3.5" />
            <span>AGRONOMIC MANAGEMENT & SAFETY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Crop Care & Treatment Guidelines
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Crop-specific water, soil, sunlight, and nutrient management paired with regulatory 4-tier pest management.
          </p>
        </div>

        {/* Crop Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-md">
          {cropsList.map((c) => {
            const isActive = selectedCrop.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                onClick={() => setSelectedCrop(c.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabs: Crop Care vs Pest & Disease Management */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("crop_care")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "crop_care"
              ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Crop-Specific Agronomy ({selectedCrop})</span>
        </button>

        <button
          onClick={() => setActiveTab("pest_mgmt")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "pest_mgmt"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Pest & Disease Management (4 Tiers)</span>
        </button>
      </div>

      {/* TAB 1: Crop-Specific Agronomy (Section 17) */}
      {activeTab === "crop_care" && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 text-center text-slate-500 text-xs font-mono">Loading {selectedCrop} care parameters...</div>
          ) : !cropDetail ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No detailed agronomy found for selected crop.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Climate & Resource Requirements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Water Requirements</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cropDetail.optimal_climate?.water_needs || "Regular uniform irrigation."}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Soil & pH Range</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cropDetail.optimal_climate?.soil_ph || "Well-drained fertile loam."}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Sunlight & Thermal</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cropDetail.optimal_climate?.sunlight || "Full sunlight, 6+ hours daily."}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Growth Cycle</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cropDetail.growth_cycle_days || "Varies by season and cultivar."}
                  </p>
                </div>
              </div>

              {/* In-Depth Care Considerations (Section 17) */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-3">
                  Agronomic Care Protocols for {cropDetail.name} ({cropDetail.scientific_name})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                      Nutrient Management & Fertilization
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Apply split balanced fertilizers. Avoid excessive vegetative nitrogen during early flowering 
                      to prevent succulent vegetative overgrowth and blossom abortion. Supplement with soluble calcium and potassium.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Weed Management & Spacing
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Maintain clean crop rows using organic straw mulch or mechanical hoeing before canopy closure. 
                      Ensure proper intra-row spacing to eliminate stagnant microclimates and allow rapid foliage drying.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                      Pest & Vector Monitoring
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Scout lower leaf surfaces weekly for whiteflies, thrips, and spider mites. 
                      Deploy colored sticky monitoring cards along field borders to catch vector arrivals before viral transmission occurs.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Harvest & Post-Harvest Handling
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Harvest during the cool morning hours using sanitized shears. Handle produce gently to avoid 
                      epidermal abrasions that create entry wounds for post-harvest soft rots.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Pest & Disease Management Framework (Section 16 Specification) */}
      {activeTab === "pest_mgmt" && pestFramework && (
        <div className="space-y-6">
          {/* CRITICAL REGULATORY DISCLAIMER BANNER (Section 16 Mandate) */}
          <div className="p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-200 text-xs space-y-2 shadow-xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-xs">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <span>Critical Agricultural Safety & Regulatory Mandate</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              {pestFramework.D_CHEMICAL_TREATMENT_INFORMATION.CRITICAL_DISCLAIMER}
            </p>
          </div>

          {/* 4-Tier Sections (A, B, C, D) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* A. PREVENTIVE METHODS */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-xs">
                  A
                </span>
                <h3 className="text-base font-bold text-white">PREVENTIVE METHODS</h3>
              </div>
              <div className="space-y-3">
                {pestFramework.A_PREVENTIVE_METHODS.map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-xs font-bold text-slate-200 block">{item.category}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.guideline}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* B. NON-CHEMICAL METHODS */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs">
                  B
                </span>
                <h3 className="text-base font-bold text-white">NON-CHEMICAL METHODS</h3>
              </div>
              <div className="space-y-3">
                {pestFramework.B_NON_CHEMICAL_METHODS.map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-xs font-bold text-slate-200 block">{item.method}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* C. BIOLOGICAL CONTROL / IPM */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-teal-400">
                <span className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-mono font-bold text-xs">
                  C
                </span>
                <h3 className="text-base font-bold text-white">BIOLOGICAL CONTROL / IPM</h3>
              </div>
              <div className="space-y-3">
                {pestFramework.C_BIOLOGICAL_CONTROL_IPM.map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <span className="text-xs font-bold text-teal-300 block">{item.pillar}</span>
                    <ul className="space-y-1 text-[11px] text-slate-400">
                      {item.practices.map((pr, pidx) => (
                        <li key={pidx} className="flex items-start gap-1.5">
                          <span className="text-teal-400">•</span>
                          <span>{pr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* D. CHEMICAL TREATMENT INFORMATION */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400">
                <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs">
                  D
                </span>
                <h3 className="text-base font-bold text-white">CHEMICAL TREATMENT INFORMATION</h3>
              </div>
              <div className="space-y-3">
                {pestFramework.D_CHEMICAL_TREATMENT_INFORMATION.GENERAL_REGULATORY_CATEGORIES.map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-xs font-bold text-amber-300 block">{item.group}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.notes}</p>
                  </div>
                ))}
                <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/30 text-[10px] text-amber-400 font-mono">
                  NOTICE: Chemical treatments must always follow legally approved registered labels in your local jurisdiction.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
