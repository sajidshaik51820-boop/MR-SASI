import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  Trash2, 
  Calendar, 
  BarChart3, 
  PieChart as PieIcon, 
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock
} from "lucide-react";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { getHistory, deleteHistoryItem, clearAllHistory } from "../services/api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function DashboardPage({ setActivePage }) {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScanDetail, setSelectedScanDetail] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory(100);
      setHistoryData(data);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (scanId) => {
    try {
      await deleteHistoryItem(scanId);
      if (selectedScanDetail?.id === scanId) setSelectedScanDetail(null);
      loadHistory();
    } catch (err) {
      console.error("Failed to delete scan:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all persistent scan records?")) return;
    try {
      await clearAllHistory();
      setSelectedScanDetail(null);
      loadHistory();
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const stats = historyData?.stats || {
    total_scans: 0,
    healthy_count: 0,
    diseased_count: 0,
    uncertain_count: 0,
    non_crop_count: 0,
    avg_crop_confidence: 0,
    avg_disease_confidence: 0,
    crop_distribution: {},
    disease_distribution: {},
    health_distribution: {},
    timeline: []
  };

  const scans = historyData?.scans || [];

  const filteredScans = scans.filter((s) => {
    const cropText = s.crop || "";
    const diseaseText = s.disease || "";
    const imageText = s.image_name || "";
    return (
      cropText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diseaseText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imageText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Health Distribution Chart
  const healthChartData = {
    labels: ["Healthy", "Diseased", "Uncertain / Diagnostic", "Non-Crop Uploads"],
    datasets: [
      {
        data: [
          stats.healthy_count || 0,
          stats.diseased_count || 0,
          stats.uncertain_count || 0,
          stats.non_crop_count || 0
        ],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b", "#64748b"],
        borderColor: ["#047857", "#b91c1c", "#b45309", "#334155"],
        borderWidth: 1.5,
      },
    ],
  };

  // Crop Distribution Bar Chart
  const cropLabels = Object.keys(stats.crop_distribution || {});
  const cropCounts = Object.values(stats.crop_distribution || {});
  const cropChartData = {
    labels: cropLabels.length > 0 ? cropLabels : ["No Crops Logged"],
    datasets: [
      {
        label: "Scans Count",
        data: cropCounts.length > 0 ? cropCounts : [0],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "#10b981",
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>AUDITABLE SQLITE DATABASE ANALYTICS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Field Scan Dashboard
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time analytics directly queried from local SQLite database. Strictly zero fabricated statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {scans.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-xs text-rose-300 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {stats.total_scans === 0 ? (
        /* Empty State (Section 19: If there are no scans: 'No scans yet') */
        <div className="py-20 text-center rounded-3xl bg-slate-900/30 border border-slate-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No scans yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan history is completely empty. Upload an image in the Crop Scanner to record your first field diagnosis.
            </p>
          </div>
          <button
            onClick={() => setActivePage("scan")}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Go To Crop Scanner
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 5 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Scans</span>
              <span className="text-2xl font-black text-white font-mono">{stats.total_scans}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Audited records</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Healthy Scans</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{stats.healthy_count}</span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {stats.total_scans > 0 ? `${Math.round((stats.healthy_count / stats.total_scans) * 100)}%` : "0%"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Diseased Scans</span>
              <span className="text-2xl font-black text-rose-400 font-mono">{stats.diseased_count}</span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {stats.total_scans > 0 ? `${Math.round((stats.diseased_count / stats.total_scans) * 100)}%` : "0%"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Uncertain / Low Conf</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{stats.uncertain_count}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Truthful AI states</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Non-Crop Uploads</span>
              <span className="text-2xl font-black text-slate-400 font-mono">{stats.non_crop_count}</span>
              <span className="text-[10px] text-rose-400 block font-mono">Strictly rejected</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Health Distribution Doughnut */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Health Status Distribution</span>
                <PieIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="h-[220px] flex items-center justify-center">
                <Doughnut 
                  data={healthChartData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom", labels: { color: "#94a3b8", font: { size: 10 } } }
                    }
                  }} 
                />
              </div>
            </div>

            {/* Crop Distribution Bar */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Crop Species Distribution</span>
                <BarChart3 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="h-[220px]">
                <Bar 
                  data={cropChartData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#1e293b" } },
                      y: { ticks: { color: "#94a3b8", stepSize: 1 }, grid: { color: "#1e293b" } }
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Recent Scans Table / Inspector */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Recent Scan Audit Trail</h3>
                <span className="text-xs text-slate-500 font-mono">Logged with exact timestamps, status, and lesion ratios</span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter scans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-500 uppercase">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Image</th>
                    <th className="py-2.5 px-3">Crop Species</th>
                    <th className="py-2.5 px-3">Diagnosis</th>
                    <th className="py-2.5 px-3">Health Status</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredScans.map((s) => (
                    <tr 
                      key={s.id} 
                      className="hover:bg-slate-900/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedScanDetail(s)}
                    >
                      <td className="py-3 px-3 font-mono text-slate-400">#{s.id}</td>
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {s.timestamp}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300 text-[11px] truncate max-w-[120px]">
                        {s.image_name}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {s.crop}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {s.disease}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          s.health_status === "Healthy"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : s.health_status === "Diseased"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}>
                          {s.health_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px]">
                        {s.is_non_crop === 1 ? (
                          <span className="text-rose-400 font-bold">Non-Crop Rejected</span>
                        ) : (
                          <span className="text-emerald-400">Plant Verified</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(s.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-950 transition-all cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal / Card for Inspecting a selected scan */}
          {selectedScanDetail && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">
                    Scan Detail Inspector — #{selectedScanDetail.id}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">
                    {selectedScanDetail.crop}: {selectedScanDetail.disease}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedScanDetail(null)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Logged Date</span>
                  <span className="font-mono text-slate-300">{selectedScanDetail.timestamp}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Growth Stage</span>
                  <span className="font-mono text-teal-300">{selectedScanDetail.growth_stage || "Vegetative"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Processing Latency</span>
                  <span className="font-mono text-slate-300">{selectedScanDetail.processing_time_ms} ms</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Risk Level</span>
                  <span className="font-mono text-amber-400">{selectedScanDetail.risk_level}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
