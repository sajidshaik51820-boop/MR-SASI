import React from "react";
import { 
  Users, 
  Award, 
  BookOpen, 
  Cpu, 
  Database, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Code2, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    { name: "Ch. Kusuma Priya", role: "Model Architecture & Attention Tuning", id: "CSE-01" },
    { name: "D. Pujitha", role: "Dataset Pipeline & Scikit-Learn Evaluation", id: "CSE-02" },
    { name: "G. Sasi Charan", role: "Backend FastAPI, Database & Preprocessing", id: "CSE-03" },
    { name: "G. Revathi", role: "Frontend UI/UX & Remote Sensing Logic", id: "CSE-04" },
  ];

  return (
    <div className="space-y-12 py-6 text-left">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>B.TECH CSE MAJOR CAPSTONE PROJECT</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          SMART CROP DISEASE DETECTION USING DEEP LEARNING
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Department of Computer Science and Engineering. An intelligent multi-modal agricultural 
          diagnostic system combining Transfer Learning, Computer Vision, and ACRNN.
        </p>
      </div>

      {/* Team & Guide Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Team Members */}
        <div className="lg:col-span-8 p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Project Development Team
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <div key={member.name} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{member.name}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    {member.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Project Guide */}
        <div className="lg:col-span-4 p-8 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-4 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-semibold">
              ACADEMIC PROJECT GUIDE
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">Mrs. N. Rama Devi</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Department of Computer Science & Engineering
            </p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
            Guided the deep learning conceptual framework, ACRNN architectural formulation, 
            and explainable AI validation strategies.
          </p>
        </div>
      </div>

      {/* Project Abstract & Objectives */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Project Abstract & Technical Motivation
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Agriculture constitutes the backbone of global socioeconomic stability, yet plant pathogens inflict catastrophic yield losses exceeding 30% annually worldwide. Traditional inspection methods rely upon visual scouting by human experts, a process that is labor-intensive, subjective, and practically impossible across large acreage before widespread pathogen transmission occurs.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          This project implements a multi-modal computer vision and deep learning platform termed 
          <strong className="text-emerald-400"> ACRNN (Attentive Convolutional Recurrent Neural Network)</strong>. 
          By unifying Transfer Learning (MobileNetV2) for spatial feature extraction, Bidirectional GRUs for inter-patch contextual dependencies, and a Soft-Attention mechanism for lesion localization, the system enables early, sub-second disease identification. Furthermore, the architecture supports remote-sensing imagery (Sentinel-2 satellite and UAV drone orthomosaics) via visible vegetation indices (VARI & ExG), empowering both smallholder farmers and industrial operations.
        </p>
      </div>

      {/* Future Scope */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          Future Research & Commercial Scope
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 block">Edge TPU Autonomous Hardware</span>
            <p className="text-slate-400 leading-relaxed">
              Quantizing ACRNN weights using TensorFlow Lite (INT8) for onboard inference on solar-powered tractor edge microcomputers and drones without internet connectivity.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-400 block">Hyperspectral Satellite Integration</span>
            <p className="text-slate-400 leading-relaxed">
              Expanding remote sensing to include PRISMA and EnMAP hyperspectral missions with over 200 narrow bands for sub-visual early biochemical stress detection.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-teal-300 block">Automated Variable Rate Spraying</span>
            <p className="text-slate-400 leading-relaxed">
              Interfacing localized attention heatmaps directly with autonomous agricultural spray drones to apply targeted micro-doses exclusively to diseased clusters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
