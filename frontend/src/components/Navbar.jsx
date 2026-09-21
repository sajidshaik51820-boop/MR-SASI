import React, { useState, useEffect } from "react";
import { 
  Sprout, 
  Scan, 
  TrendingUp, 
  ShieldAlert, 
  Leaf, 
  Droplets, 
  Satellite, 
  LayoutDashboard, 
  Cpu, 
  BookOpen, 
  Menu, 
  X, 
  Activity 
} from "lucide-react";
import { checkHealth } from "../services/api";

export default function Navbar({ activePage, setActivePage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      try {
        const data = await checkHealth();
        if (isMounted) setBackendStatus(data.status === "online" ? "online" : "offline");
      } catch {
        if (isMounted) setBackendStatus("offline");
      }
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: "home", label: "Home", icon: Sprout },
    { id: "scan", label: "Crop Scanner", icon: Scan },
    { id: "growth", label: "Crop Growth", icon: TrendingUp },
    { id: "disease", label: "Disease Analysis", icon: ShieldAlert },
    { id: "sustainable", label: "Natural Care", icon: Leaf },
    { id: "care", label: "Crop Care", icon: Droplets },
    { id: "remote", label: "Remote Sensing", icon: Satellite },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "model", label: "AI / Model", icon: Cpu },
    { id: "knowledge", label: "Crop Knowledge", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div 
            onClick={() => setActivePage("home")}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
                SMART CROP AI
              </span>
              <span className="block text-[9px] text-emerald-400/70 font-mono -mt-1 tracking-wider uppercase">
                Sustainable Care & Growth
              </span>
            </div>
          </div>

          {/* Desktop Nav Items (10 Pages) */}
          <div className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-900/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Compact Desktop for medium screens */}
          <div className="hidden md:flex xl:hidden items-center gap-1">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-2 py-1 text-xs text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10"
            >
              More ({navItems.length - 6})
            </button>
          </div>

          {/* Backend Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs shrink-0">
            <span className="relative flex h-2 w-2">
              {backendStatus === "online" ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {backendStatus === "online" ? "AI Online" : "Connecting"}
            </span>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="xl:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-1 shadow-2xl">
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400 px-2">
            <span>System Status:</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {backendStatus === "online" ? "FastAPI Online" : "Connecting..."}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}
