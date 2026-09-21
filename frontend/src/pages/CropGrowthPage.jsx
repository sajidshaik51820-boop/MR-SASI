import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Sprout,
  Calendar,
  Eye,
  Activity,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Info,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { getCrops, getGrowthFramework } from "../services/api";

export default function CropGrowthPage({
  selectedCrop: initialSelectedCrop,
}) {
  const [cropsList, setCropsList] = useState([]);

  // Never allow "Unknown" to become the active crop.
  const [activeCrop, setActiveCrop] = useState(
    initialSelectedCrop && initialSelectedCrop !== "Unknown"
      ? initialSelectedCrop
      : "Tomato"
  );

  const [framework, setFramework] = useState(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  /*
   * Load available crops
   */
  useEffect(() => {
    async function loadCrops() {
      try {
        const data = await getCrops();

        const crops = Array.isArray(data?.crops) ? data.crops : [];

        setCropsList(crops);
      } catch (err) {
        console.error("Failed to load crops:", err);
        setCropsList([]);
      }
    }

    loadCrops();
  }, []);

  /*
   * Keep active crop synchronized with scanner selection.
   *
   * If scanner returns "Unknown", do NOT request:
   * /api/growth-stages/Unknown
   */
  useEffect(() => {
    if (
      initialSelectedCrop &&
      initialSelectedCrop !== "Unknown" &&
      initialSelectedCrop.trim() !== ""
    ) {
      setActiveCrop(initialSelectedCrop);
    }
  }, [initialSelectedCrop]);

  /*
   * Load growth framework for selected crop
   */
  useEffect(() => {
    async function loadFramework() {
      if (!activeCrop || activeCrop === "Unknown") {
        setFramework(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setFramework(null);

      try {
        const data = await getGrowthFramework(activeCrop);

        if (data) {
          setFramework(data);

          const availableStages = Array.isArray(data.stages)
            ? data.stages
            : [];

          // Prefer vegetative stage if available.
          // Otherwise select the first available stage.
          if (availableStages.length > 1) {
            setSelectedStageIndex(1);
          } else {
            setSelectedStageIndex(0);
          }
        } else {
          setFramework(null);
        }
      } catch (err) {
        console.error("Failed to load growth framework:", err);
        setFramework(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadFramework();
  }, [activeCrop]);

  const stages = Array.isArray(framework?.stages)
    ? framework.stages
    : [];

  const currentStage =
    stages[selectedStageIndex] || stages[0] || null;

  /*
   * Safely change stage.
   */
  const handleStageChange = (index) => {
    if (index >= 0 && index < stages.length) {
      setSelectedStageIndex(index);
    }
  };

  /*
   * Safely change crop.
   */
  const handleCropChange = (cropName) => {
    if (!cropName || cropName === "Unknown") {
      return;
    }

    setActiveCrop(cropName);
    setSelectedStageIndex(0);
  };

  return (
    <div className="space-y-8 py-4">

      {/* =========================================================
          PAGE HEADER
      ========================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 text-left">

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <TrendingUp className="w-3.5 h-3.5" />

            <span>
              PHENOLOGICAL STAGE MONITORING
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Crop-Specific Growth Stages
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Tailored growth frameworks for each crop with stage
            descriptions, physiological events, and farmer scouting
            checklists.
          </p>
        </div>

        {/* Scientific Note */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 max-w-sm">

          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
            <AlertCircle className="w-3.5 h-3.5" />

            <span>
              Scientific Phenology Note
            </span>
          </div>

          Exact chronological age cannot be claimed from a single
          2D photo. Visual stages provide phenological guidance.
        </div>
      </div>


      {/* =========================================================
          CROP SELECTOR
      ========================================================== */}
      {cropsList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">

          {cropsList.map((c) => {

            if (!c?.name || c.name === "Unknown") {
              return null;
            }

            const isActive =
              activeCrop?.toLowerCase() ===
              c.name?.toLowerCase();

            return (
              <button
                key={c.name}
                onClick={() => handleCropChange(c.name)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950 font-bold"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <Sprout
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? "text-slate-950"
                      : "text-emerald-400"
                  }`}
                />

                <span>
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      )}


      {/* =========================================================
          LOADING STATE
      ========================================================== */}
      {isLoading ? (

        <div className="py-20 text-center">

          <div className="inline-flex items-center gap-2 text-slate-500 text-xs font-mono">

            <Activity className="w-4 h-4 animate-pulse text-emerald-400" />

            <span>
              Loading growth framework for {activeCrop}...
            </span>

          </div>

        </div>

      ) : !framework ? (

        /* =======================================================
           NO FRAMEWORK
        ======================================================== */
        <div className="py-16 text-center">

          <div className="max-w-lg mx-auto p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

            <Info className="w-8 h-8 mx-auto text-slate-500 mb-3" />

            <h3 className="text-sm font-bold text-white mb-2">
              Growth Framework Unavailable
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              A crop-specific growth framework is not currently
              available for this selection.
            </p>

          </div>

        </div>

      ) : (

        <div className="space-y-8">

          {/* =====================================================
              FRAMEWORK OVERVIEW
          ====================================================== */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">

            <div>

              <span className="text-[11px] font-mono text-emerald-400 block uppercase">
                Selected Framework
              </span>

              <h2 className="text-xl font-bold text-white">
                {framework.crop || activeCrop} Growth Cycle
              </h2>

              <span className="text-xs text-slate-400 mt-0.5 block">
                Total lifecycle:{" "}
                {framework.growth_cycle_days || "Not specified"}{" "}
                | {stages.length} Distinct Phenological Stages
              </span>

            </div>

            <div className="flex items-center gap-3">

              <span className="text-xs text-slate-400 font-mono">
                Interactive Stage:
              </span>

              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 font-bold text-xs font-mono">
                Stage{" "}
                {currentStage
                  ? currentStage.stage_number ||
                    selectedStageIndex + 1
                  : selectedStageIndex + 1}{" "}
                of {stages.length}
              </span>

            </div>

          </div>


          {/* =====================================================
              TIMELINE
          ====================================================== */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">

            <div className="flex items-center justify-between gap-3">

              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 text-left">
                Crop Stage Progression Timeline
              </h3>

              <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500">
                <ChevronRight className="w-3 h-3" />
                Click a stage to inspect
              </div>

            </div>


            {stages.length === 0 ? (

              <div className="py-8 text-center text-xs text-slate-500">
                No phenological stages are available.
              </div>

            ) : (

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">

                {stages.map((st, idx) => {

                  const isCurrent =
                    idx === selectedStageIndex;

                  const isPast =
                    idx < selectedStageIndex;

                  return (
                    <button
                      key={
                        st.stage_number ??
                        `${st.name}-${idx}`
                      }
                      onClick={() =>
                        handleStageChange(idx)
                      }
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[95px] ${
                        isCurrent
                          ? "bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]"
                          : isPast
                          ? "bg-slate-950/90 border-slate-800 text-slate-300 hover:border-slate-700"
                          : "bg-slate-950/50 border-slate-800/80 text-slate-500 hover:border-slate-700"
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isCurrent
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          #
                          {st.stage_number ??
                            idx + 1}
                        </span>

                        {st.duration_days && (
                          <span className="text-[9px] font-mono text-slate-500">
                            {String(
                              st.duration_days
                            ).split(" ")[0]}
                            d
                          </span>
                        )}

                      </div>

                      <span className="text-xs font-bold leading-tight mt-2 line-clamp-2">
                        {st.name ||
                          `Stage ${idx + 1}`}
                      </span>

                    </button>
                  );
                })}

              </div>
            )}

          </div>


          {/* =====================================================
              CURRENT STAGE DETAILS
          ====================================================== */}
          {currentStage && (

            <div className="p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-6 text-left shadow-2xl">

              {/* Stage Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">

                <div>

                  <span className="text-xs font-mono text-emerald-400 font-semibold block uppercase">
                    CURRENT ESTIMATED STAGE
                  </span>

                  <h3 className="text-2xl font-black text-white mt-1">
                    Stage{" "}
                    {currentStage.stage_number ||
                      selectedStageIndex + 1}
                    :{" "}
                    {currentStage.name ||
                      "Unnamed Stage"}
                  </h3>

                </div>

                <div className="flex items-center gap-2">

                  <Clock className="w-4 h-4 text-slate-500" />

                  <span className="px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                    Typical Duration:{" "}
                    {currentStage.duration_days ||
                      "Not specified"}
                  </span>

                </div>

              </div>


              {/* =================================================
                  STAGE OVERVIEW
              ================================================== */}
              <div className="space-y-1">

                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  Stage Overview
                </span>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentStage.description ||
                    "No stage description is available."}
                </p>

              </div>


              {/* =================================================
                  DETAIL CARDS
              ================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

                {/* WHAT IS HAPPENING */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">

                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">

                    <Activity className="w-3.5 h-3.5" />

                    <span>
                      What Is Happening To The Plant
                    </span>

                  </span>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentStage.what_is_happening ||
                      "Stage-specific physiological information is not available."}
                  </p>

                </div>


                {/* FARMER MONITORING */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">

                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">

                    <Eye className="w-3.5 h-3.5" />

                    <span>
                      What The Farmer Should Monitor
                    </span>

                  </span>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentStage.farmer_monitoring ||
                      "No specific monitoring checklist is available."}
                  </p>

                </div>


                {/* CARE CONSIDERATIONS */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">

                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">

                    <ShieldCheck className="w-3.5 h-3.5" />

                    <span>
                      Care Considerations
                    </span>

                  </span>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentStage.care_considerations ||
                      "No stage-specific care considerations are available."}
                  </p>

                </div>


                {/* NEXT STAGE */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">

                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">

                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />

                    <span>
                      Next Expected Stage
                    </span>

                  </span>

                  <p className="text-xs font-bold text-white leading-relaxed">
                    {currentStage.next_stage ||
                      "Final stage or transition information unavailable."}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Use the next stage as a planning reference;
                    actual timing varies with crop variety,
                    environment, and field conditions.
                  </p>

                </div>

              </div>


              {/* =================================================
                  STAGE NAVIGATION
              ================================================== */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">

                <button
                  disabled={selectedStageIndex <= 0}
                  onClick={() =>
                    handleStageChange(
                      selectedStageIndex - 1
                    )
                  }
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Previous Stage
                </button>


                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">

                  <Calendar className="w-3.5 h-3.5" />

                  <span>
                    Phenological Guidance
                  </span>

                </div>


                <button
                  disabled={
                    selectedStageIndex >=
                    stages.length - 1
                  }
                  onClick={() =>
                    handleStageChange(
                      selectedStageIndex + 1
                    )
                  }
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next Stage →
                </button>

              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}