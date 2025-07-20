import { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardTab } from "@/components/tabs/DashboardTab";
import { EfficientFrontierTab } from "@/components/tabs/EfficientFrontierTab";
import { BlackLittermanTab } from "@/components/tabs/BlackLittermanTab";
import { AnalyzerTab } from "@/components/tabs/AnalyzerTab";
import { SimulatorTab } from "@/components/tabs/SimulatorTab";
import { ManualEntryModal } from "@/components/ManualEntryModal";
import { GuideTab } from "@/components/tabs/GuideTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showEntryModal, setShowEntryModal] = useState(false);

  const handleCreatePortfolio = () => {
    setShowEntryModal(true);
  };

  const handleCloseModal = () => {
    setShowEntryModal(false);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab setActiveTab={setActiveTab} />;
      case "efficient-frontier":
        return <EfficientFrontierTab onCreatePortfolio={handleCreatePortfolio} />;
      case "black-litterman":
        return <BlackLittermanTab onCreatePortfolio={handleCreatePortfolio} />;
      case "analyzer":
        return <AnalyzerTab onCreatePortfolio={handleCreatePortfolio} />;
      case "simulator":
        return <SimulatorTab onCreatePortfolio={handleCreatePortfolio} />;
      case "guide":
        return <GuideTab />;
      default:
        return <DashboardTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onCreatePortfolio={handleCreatePortfolio} 
      />

      <main className="container mx-auto px-4 py-8">
        {renderActiveTab()}
      </main>

      <ManualEntryModal 
        isOpen={showEntryModal} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default Index;
