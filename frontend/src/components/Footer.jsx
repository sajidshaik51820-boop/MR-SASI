import React from "react";
import { Sprout, Heart, Award, Users, BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1: Project Identity */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-bold text-slate-200 tracking-tight text-sm">
                SMART CROP DISEASE DETECTION
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time deep learning diagnostic suite combining Transfer Learning, 
              Spatial CNN, Recurrent Context (BiGRU), and Attention Mechanisms (ACRNN) 
              for leaf-level and remote-sensing crop health monitoring.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["TensorFlow", "Transfer Learning", "OpenCV", "ACRNN", "FastAPI", "React"].map((t) => (
                <span key={t} className="text-[10px] bg-slate-900 text-emerald-400/80 px-2 py-0.5 rounded border border-slate-800 font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: College & Project Team */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Project Team (CSE)
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Ch. Kusuma Priya</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>D. Pujitha</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>G. Sasi Charan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>G. Revathi</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Guidance & Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Project Guide
            </h4>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 mb-3">
              <p className="text-xs font-medium text-emerald-300">Mrs. N. Rama Devi</p>
              <p className="text-[11px] text-slate-400">Department of Computer Science & Engineering</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Academic Decision-Support Prototype. Field interventions should be validated by certified agronomists.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Smart Crop Disease Detection. B.Tech Computer Science & Engineering Capstone Project.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px] text-emerald-400/60">
            Branch: CSE | ACRNN Architecture
          </p>
        </div>
      </div>
    </footer>
  );
}
