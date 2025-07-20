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
    { id: "efficient-frontier", label: "Efficient Frontier", icon: Target },
    { id: "black-litterman", label: "Black-Litterman", icon: Brain },
    { id: "analyzer", label: "Stress Test", icon: TrendingUp },
    { id: "simulator", label: "Simulator", icon: BarChart3 },
    { id: "guide", label: "Guide", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-md transition-all duration-500">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <h1 className="text-lg lg:text-xl font-semibold tracking-tight text-slate-900 select-none">QuantifyIQ</h1>
        </div>
        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:ring-offset-2 focus:bg-blue-50/60
                  ${activeTab === item.id
                    ? "bg-blue-100 text-blue-700 shadow"
                    : "text-slate-600 hover:text-blue-700 hover:bg-blue-50/60"}
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <nav className="lg:hidden flex items-center space-x-1">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:ring-offset-2 focus:bg-blue-50/60
                  ${activeTab === item.id
                    ? "bg-blue-100 text-blue-700 shadow"
                    : "text-slate-600 hover:text-blue-700 hover:bg-blue-50/60"}
                `}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </nav>
        {/* Right Actions */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          <Button
            onClick={onCreatePortfolio}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full px-2 lg:px-4 py-1.5 text-xs lg:text-sm font-semibold transition-all duration-300"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5" />
            <span className="hidden sm:inline">Create Portfolio</span>
            <span className="sm:hidden">Create</span>
          </Button>
          <div className="w-7 h-7 lg:w-8 lg:h-8 bg-slate-200 rounded-full flex items-center justify-center shadow-inner">
            <User className="w-3 h-3 lg:w-4 lg:h-4 text-slate-600" />
          </div>
        </div>
      </div>
    </header>
  );
};
