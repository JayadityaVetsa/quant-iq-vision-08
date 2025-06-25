
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, BarChart3, Target, User } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCreatePortfolio: () => void;
}

export const Header = ({ activeTab, setActiveTab, onCreatePortfolio }: HeaderProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "optimizer", label: "Portfolio Optimizer", icon: Target },
    { id: "analyzer", label: "Stock Analyzer", icon: TrendingUp },
    { id: "simulator", label: "Simulator", icon: BarChart3 },
  ];

  return (
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
            onClick={onCreatePortfolio}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Portfolio
          </Button>
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
        </div>
      </div>
    </header>
  );
};
