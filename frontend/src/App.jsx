import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Exactly 10 Main Pages (Section 7)
import HomePage from "./pages/HomePage";
import CropScanPage from "./pages/CropScanPage";
import CropGrowthPage from "./pages/CropGrowthPage";
import DiseaseAnalysisPage from "./pages/DiseaseAnalysisPage";
import SustainableCarePage from "./pages/SustainableCarePage";
import CropCarePage from "./pages/CropCarePage";
import RemoteSensingPage from "./pages/RemoteSensingPage";
import DashboardPage from "./pages/DashboardPage";
import ModelPage from "./pages/ModelPage";
import CropKnowledgePage from "./pages/CropKnowledgePage";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [selectedCrop, setSelectedCrop] = useState("Tomato");

  const renderCurrentPage = () => {
    switch (activePage) {
      case "home":
        return <HomePage setActivePage={setActivePage} />;
      case "scan":
        return <CropScanPage setActivePage={setActivePage} setSelectedCrop={setSelectedCrop} />;
      case "growth":
        return <CropGrowthPage selectedCrop={selectedCrop} setActivePage={setActivePage} />;
      case "disease":
        return <DiseaseAnalysisPage setActivePage={setActivePage} />;
      case "sustainable":
        return <SustainableCarePage setActivePage={setActivePage} />;
      case "care":
        return <CropCarePage selectedCrop={selectedCrop} setActivePage={setActivePage} />;
      case "remote":
        return <RemoteSensingPage />;
      case "dashboard":
        return <DashboardPage setActivePage={setActivePage} />;
      case "model":
        return <ModelPage />;
      case "knowledge":
        return <CropKnowledgePage setActivePage={setActivePage} setSelectedCrop={setSelectedCrop} />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4">
        {renderCurrentPage()}
      </main>

      <Footer />
    </div>
  );
}
