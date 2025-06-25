
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Plus, RefreshCw } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { PortfolioResults } from "@/components/portfolio/PortfolioResults";

interface OptimizerTabProps {
  onCreatePortfolio: () => void;
}

export const OptimizerTab = ({ onCreatePortfolio }: OptimizerTabProps) => {
  const { portfolioData, optimizationResults, clearResults } = usePortfolio();

  if (portfolioData && optimizationResults) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Portfolio Analysis Results</h2>
            <p className="text-slate-600">
              Analysis for {portfolioData.stocks.length} stocks with ${portfolioData.initialValue.toLocaleString()} portfolio value
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={onCreatePortfolio}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Analysis</span>
            </Button>
            <Button 
              onClick={clearResults}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Results</span>
            </Button>
          </div>
        </div>
        <PortfolioResults />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Optimizer</h2>
        <p className="text-slate-600">Analyze and optimize your portfolio using Modern Portfolio Theory</p>
      </div>
      
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Create Your Portfolio</h3>
        <p className="text-slate-600 mb-6">
          Enter your stock positions to get comprehensive risk analysis, optimization suggestions, 
          and benchmark comparisons using advanced quantitative methods.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-1">Risk Analysis</h4>
            <p className="text-blue-600">Comprehensive risk metrics including Sharpe ratio, volatility, and maximum drawdown</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-1">Optimization</h4>
            <p className="text-green-600">Find optimal allocations for maximum returns and minimum risk</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-1">Benchmarking</h4>
            <p className="text-purple-600">Compare against market indices and sector benchmarks</p>
          </div>
        </div>
        
        <Button 
          onClick={onCreatePortfolio}
          className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start Portfolio Analysis
        </Button>
      </Card>
    </div>
  );
};
