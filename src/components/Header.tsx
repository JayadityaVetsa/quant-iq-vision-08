import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, BarChart3, Target, User, BookOpen, Brain, ChevronDown } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { toast } from "sonner";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCreatePortfolio: () => void;
}

export const Header = ({ activeTab, setActiveTab, onCreatePortfolio }: HeaderProps) => {
  const { portfolios, activePortfolio, setActivePortfolio } = usePortfolio();
  
  // Updated navigation – dashboard link removed as the logo now routes home
  const navItems = [
    { id: "efficient-frontier", label: "Efficient Frontier", icon: Target },
    { id: "black-litterman", label: "Black-Litterman", icon: Brain },
    { id: "analyzer", label: "Stress Test", icon: TrendingUp },
    { id: "simulator", label: "Simulator", icon: BarChart3 },
    { id: "guide", label: "Guide", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass shadow-lg transition-all duration-500 border-b border-border/40 animate-slide-down">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo (clickable – routes to dashboard) */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center space-x-2 lg:space-x-3 animate-slide-in-right focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
        >
          <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-md hover-glow transition-all duration-300">
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          {/* Make the website title black for visibility */}
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-black select-none">QuantifyIQ</h1>
        </button>
        
        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-2 animate-fade-in animate-delay-200">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 hover-scale animate-fade-in
                  ${isActive
                    ? "bg-primary text-white shadow-lg"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"}
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                <span className={isActive ? "text-white" : ""}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <nav className="lg:hidden flex items-center space-x-1 animate-fade-in animate-delay-200">
          {navItems.slice(0, 4).map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 hover-scale
                  ${isActive
                    ? "bg-primary text-white shadow-lg"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"}
                `}
                title={item.label}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
              </button>
            );
          })}
        </nav>
        
        {/* Portfolio Selector - Desktop */}
        {portfolios.length > 0 && (
          <div className="hidden lg:flex items-center animate-slide-in-left animate-delay-300">
            <Select
              value={activePortfolio?.id || ""}
              onValueChange={(value) => {
                const portfolio = portfolios.find(p => p.id === value);
                if (portfolio) {
                  setActivePortfolio(portfolio);
                  toast.info(`Switched to portfolio: ${portfolio.name}`);
                } else {
                  setActivePortfolio(null);
                }
              }}
            >
              <SelectTrigger className="w-48 h-8 text-sm glass border-border/50 hover:border-primary/50 transition-all duration-300">
                <SelectValue placeholder="Select Portfolio" />
              </SelectTrigger>
              <SelectContent className="glass">
                {portfolios.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id} className="hover:bg-primary/10">
                    <div className="flex flex-col">
                      <span className="font-medium">{portfolio.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {portfolio.stocks.length} stocks
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2 lg:space-x-3 animate-slide-in-left animate-delay-400">
          <Button
            onClick={onCreatePortfolio}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-full px-2 lg:px-4 py-1.5 text-xs lg:text-sm font-semibold hover-lift transition-all duration-300"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5" />
            <span className="hidden sm:inline">Create Portfolio</span>
            <span className="sm:hidden">Create</span>
          </Button>
          <div className="w-7 h-7 lg:w-8 lg:h-8 bg-muted rounded-full flex items-center justify-center shadow-inner hover-scale transition-all duration-300 cursor-pointer">
            <User className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};
