import React, { useState } from "react";
import { 
  Leaf, 
  Droplets, 
  Sprout, 
  ShieldCheck, 
  RefreshCw, 
  Bug, 
  Layers, 
  CheckCircle2, 
  Sun,
  Flame,
  ArrowRight
} from "lucide-react";

export default function SustainableCarePage() {
  const [activeTab, setActiveTab] = useState("all");

  const categories = [
    {
      id: "soil",
      title: "Soil Management & Health",
      icon: Layers,
      color: "from-amber-500/20 to-amber-900/10",
      accent: "text-amber-400",
      practices: [
        {
          name: "Organic Composting & Humus Rebuilding",
          desc: "Incorporate well-rotted cattle manure or thermophilic compost to boost soil microbial diversity and cation exchange capacity (CEC)."
        },
        {
          name: "Cover Cropping & Living Mulches",
          desc: "Plant clover, vetch, or rye between primary seasons to suppress weeds, prevent topsoil erosion, and fix biological atmospheric nitrogen."
        },
        {
          name: "Thermal Soil Solarization",
          desc: "Spread transparent polyethylene sheets over damp summer soil for 4-6 weeks to eliminate soil-borne pathogens and root-knot nematodes naturally."
        }
      ]
    },
    {
      id: "water",
      title: "Water Management & Irrigation",
      icon: Droplets,
      color: "from-cyan-500/20 to-cyan-900/10",
      accent: "text-cyan-400",
      practices: [
        {
          name: "Ground-Level Drip Irrigation",
          desc: "Apply water directly into root zones via pressure-compensated drip emitters, keeping foliage completely dry to prevent fungal germination."
        },
        {
          name: "Straw & Biomass Mulching",
          desc: "Apply a 5-8 cm layer of clean cereal straw around plant bases to reduce soil evaporation by 60% and block rain-splash spore transmission."
        },
        {
          name: "Alternate Wetting and Drying (AWD)",
          desc: "In rice paddies, allow water table to drop 15 cm below soil surface before re-flooding, reducing methane emissions and water usage by up to 30%."
        }
      ]
    },
    {
      id: "ipm",
      title: "Biological Control & IPM",
      icon: Bug,
      color: "from-emerald-500/20 to-emerald-900/10",
      accent: "text-emerald-400",
      practices: [
        {
          name: "Trichoderma & Bacillus Inoculation",
          desc: "Drench roots with beneficial Trichoderma harzianum and Bacillus subtilis to colonize root surfaces and outcompete Pythium and Rhizoctonia."
        },
        {
          name: "Beneficial Insect Conservation",
          desc: "Preserve and introduce ladybugs, hoverflies, and lacewings to naturally prey upon aphids, mites, and scale colonies without broad-spectrum chemicals."
        },
        {
          name: "Pheromone & Color Sticky Traps",
          desc: "Deploy yellow traps for whiteflies and leafminers, blue traps for thrips, and delta pheromone traps to disrupt moth mating flights."
        }
      ]
    },
    {
      id: "agronomy",
      title: "Canopy Spacing & Sanitation",
      icon: Sprout,
      color: "from-teal-500/20 to-teal-900/10",
      accent: "text-teal-400",
      practices: [
        {
          name: "Generous Plant & Row Spacing",
          desc: "Ensure recommended planting densities to promote rapid morning foliage drying, maximize air movement, and prevent humid disease microclimates."
        },
        {
          name: "Tool Sterilization & Field Sanitation",
          desc: "Dip pruning shears and harvest tools in 70% isopropyl alcohol between plants to prevent mechanical transmission of mosaic viruses and bacteria."
        },
        {
          name: "Multi-Year Crop Rotation",
          desc: "Follow a 3-to-4 year rotation cycle away from host botanical families (e.g. solanaceae followed by legumes or brassicas) to exhaust soil pathogen reservoirs."
        }
      ]
    },
    {
      id: "nutrient",
      title: "Balanced Natural Nutrition",
      icon: Sun,
      color: "from-lime-500/20 to-lime-900/10",
      accent: "text-lime-400",
      practices: [
        {
          name: "Balanced N-P-K & Avoid Excess Nitrogen",
          desc: "Excess vegetative nitrogen produces soft, succulent cellular tissue highly vulnerable to fungal penetration; balance with potassium and silicon."
        },
        {
          name: "Soluble Calcium & Micronutrients",
          desc: "Apply foliar calcium and boron during flowering and fruit set to strengthen pectins and cell walls against blossom end rot and cracking."
        },
        {
          name: "Biofertilizers & Mycorrhizae",
          desc: "Inoculate seeds and roots with Vesicular-Arbuscular Mycorrhizae (VAM) to extend effective root surface area for phosphorus uptake."
        }
      ]
    }
  ];

  const filteredCategories = activeTab === "all" 
    ? categories 
    : categories.filter(c => c.id === activeTab);

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>ORGANIC & SUSTAINABLE AGROECOLOGY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Natural & Sustainable Crop Care
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Principles of ecological farming: soil regeneration, drip irrigation, biological biocontrols, and Integrated Pest Management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
            Zero Chemical Dependency
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-emerald-500 text-slate-950 font-bold"
              : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
          }`}
        >
          All Practices ({categories.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveTab(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === c.id
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            {c.title.split(" & ")[0]}
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id}
              className={`p-6 md:p-8 rounded-3xl bg-gradient-to-br ${cat.color} bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-6 shadow-xl`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center ${cat.accent}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {cat.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {cat.practices.length} Key Agronomic Protocols
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {cat.practices.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <h4 className="text-xs font-bold text-slate-200">
                        {p.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-5">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
