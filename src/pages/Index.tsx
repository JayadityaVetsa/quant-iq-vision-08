
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, TrendingUp, BarChart3, Target, User } from "lucide-react";
import { UploadModal } from "@/components/UploadModal";
import { MetricsCard } from "@/components/MetricsCard";
import { QuickStats } from "@/components/QuickStats";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "optimizer", label: "Portfolio Optimizer", icon: Target },
    { id: "analyzer", label: "Stock Analyzer", icon: TrendingUp },
    { id: "simulator", label: "Simulator", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">QuantifyIQ</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="text-slate-400 text-sm ml-4 px-3 py-2 bg-slate-100 rounded-lg">
              Options Lab - Coming Soon
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
            </Button>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-800">
                Welcome to QuantifyIQ
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Intuitive portfolio optimization and risk analysis for early investors, 
                students, and retail traders. Get started by uploading your portfolio CSV.
              </p>
            </div>

            {/* Quick Stats */}
            <QuickStats />

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800">Portfolio Optimizer</CardTitle>
                      <CardDescription>Modern Portfolio Theory analysis</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Analyze your current portfolio and discover optimized alternatives using MPT. 
                    Compare against crowd wisdom benchmarks.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("optimizer")}
                    className="w-full"
                  >
                    Optimize Portfolio
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800">Stock Analyzer</CardTitle>
                      <CardDescription>Technical & statistical insights</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Deep dive into individual stocks with technical indicators, 
                    distribution analysis, and ELI18 educational mode.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("analyzer")}
                    className="w-full"
                  >
                    Analyze Stocks
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800">Monte Carlo Simulator</CardTitle>
                      <CardDescription>Future outcome forecasting</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Run 10,000 simulations to visualize the "Cone of Possibility" 
                    and understand potential future portfolio outcomes.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("simulator")}
                    className="w-full"
                  >
                    Run Simulation
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Metrics Overview */}
            <MetricsCard />
          </div>
        )}

        {activeTab === "optimizer" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Optimizer</h2>
              <p className="text-slate-600">Analyze and optimize your portfolio using Modern Portfolio Theory</p>
            </div>
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload Your Portfolio</h3>
              <p className="text-slate-600 mb-6">
                Upload a CSV file with your portfolio holdings to get started with optimization analysis.
              </p>
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Portfolio CSV
              </Button>
            </Card>
          </div>
        )}

        {activeTab === "analyzer" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Stock Analyzer</h2>
              <p className="text-slate-600">Technical analysis and statistical insights for individual stocks</p>
            </div>
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Select Stocks to Analyze</h3>
              <p className="text-slate-600 mb-6">
                Upload your portfolio first, then dive deep into individual stock analysis with technical indicators and ELI18 mode.
              </p>
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Portfolio CSV
              </Button>
            </Card>
          </div>
        )}

        {activeTab === "simulator" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Monte Carlo Simulator</h2>
              <p className="text-slate-600">Forecast potential portfolio outcomes with 10,000 simulations</p>
            </div>
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Cone of Possibility</h3>
              <p className="text-slate-600 mb-6">
                Visualize how risk accumulates over time and see the range of potential future outcomes for your portfolio.
              </p>
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Portfolio CSV
              </Button>
            </Card>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
};

export default Index;
