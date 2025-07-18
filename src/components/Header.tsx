import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, BarChart3, Target, User, BookOpen, Brain } from "lucide-react";

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
    { id: "guide", label: "Guide", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-md transition-all duration-500">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 select-none">QuantifyIQ</h1>
        </div>
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:ring-offset-2 focus:bg-blue-50/60
                  ${activeTab === item.id
                    ? "bg-blue-100 text-blue-700 shadow"
                    : "text-slate-600 hover:text-blue-700 hover:bg-blue-50/60"}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={onCreatePortfolio}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full px-6 py-2 text-base font-semibold transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Portfolio
          </Button>
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shadow-inner">
            <User className="w-5 h-5 text-slate-600" />
          </div>
        </div>
      </div>
    </header>
  );
};
