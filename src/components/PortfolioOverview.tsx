import { usePortfolio } from "@/contexts/PortfolioContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, BarChart3, Shield, Calendar } from "lucide-react";

export const PortfolioOverview = () => {
  const { activePortfolio } = usePortfolio();

  if (!activePortfolio) {
    return null; // Don't render anything if there's no active portfolio
  }

  const stats = [
    { label: "Initial Value", value: `$${activePortfolio.initialValue.toLocaleString()}`, icon: <Wallet className="w-6 h-6 text-yellow-500" /> },
    { label: "Assets", value: activePortfolio.stocks.length, icon: <BarChart3 className="w-6 h-6 text-blue-500" /> },
    { label: "Risk-Free Rate", value: `${(activePortfolio.riskFreeRate * 100).toFixed(1)}%`, icon: <Shield className="w-6 h-6 text-green-500" /> },
    { label: "Created", value: new Date(activePortfolio.createdAt).toLocaleDateString(), icon: <Calendar className="w-6 h-6 text-purple-500" /> }
  ];

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Wallet className="w-5 h-5 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Portfolio Overview</h2>
      </div>

      <Card className="overflow-hidden shadow-lg border border-gray-100">
        <CardHeader className="bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Portfolio</p>
              <CardTitle className="text-xl text-gray-800">{activePortfolio.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center gap-4 animate-fade-in-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="p-2 bg-gray-100 rounded-full">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Holdings:</h4>
            <div className="flex gap-2 flex-wrap">
              {activePortfolio.stocks.map((stock, index) => (
                <Badge 
                  key={stock.ticker} 
                  variant="outline"
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border-gray-200 animate-fade-in-up"
                  style={{ animationDelay: `${0.7 + index * 0.05}s` }}
                >
                  <span className="font-semibold">{stock.ticker}</span>
                  <span className="ml-1.5 text-gray-500">({(stock.weight * 100).toFixed(1)}%)</span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 