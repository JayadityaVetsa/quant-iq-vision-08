import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
        return <DashboardTab setActiveTab={setActiveTab} onCreatePortfolio={handleCreatePortfolio} />;
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
        return <DashboardTab setActiveTab={setActiveTab} onCreatePortfolio={handleCreatePortfolio} />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onCreatePortfolio={handleCreatePortfolio} 
      />

      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] relative z-10">
        <div className="animate-fade-in-up">
          {renderActiveTab()}
        </div>
      </main>

      <Footer />

      <ManualEntryModal 
        isOpen={showEntryModal} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default Index;
