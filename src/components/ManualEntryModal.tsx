
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { PortfolioOptimizerService } from "@/utils/portfolioOptimizer";

interface Stock {
  ticker: string;
  weight: number;
}

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualEntryModal = ({ isOpen, onClose }: ManualEntryModalProps) => {
  const [stocks, setStocks] = useState<Stock[]>([{ ticker: "", weight: 0 }]);
  const [initialValue, setInitialValue] = useState("10000");
  const [riskFreeRate, setRiskFreeRate] = useState("3.0");
  const { toast } = useToast();
  const { setPortfolioData, setOptimizationResults, setIsAnalyzing } = usePortfolio();

  const addStock = () => {
    setStocks([...stocks, { ticker: "", weight: 0 }]);
  };

  const removeStock = (index: number) => {
    if (stocks.length > 1) {
      setStocks(stocks.filter((_, i) => i !== index));
    }
  };

  const updateStock = (index: number, field: 'ticker' | 'weight', value: string | number) => {
    const updatedStocks = stocks.map((stock, i) => 
      i === index ? { ...stock, [field]: value } : stock
    );
    setStocks(updatedStocks);
  };

  const handleSubmit = async () => {
    // Validation
    const emptyTickers = stocks.filter(stock => !stock.ticker.trim());
    if (emptyTickers.length > 0) {
      toast({
        title: "Missing stock tickers",
        description: "Please enter all stock tickers.",
        variant: "destructive",
      });
      return;
    }

    const totalWeight = stocks.reduce((sum, stock) => sum + stock.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      toast({
        title: "Weights must sum to 100%",
        description: `Current total: ${totalWeight.toFixed(2)}%`,
        variant: "destructive",
      });
      return;
    }

    if (!initialValue || parseFloat(initialValue) <= 0) {
      toast({
        title: "Invalid portfolio value",
        description: "Please enter a valid starting portfolio value.",
        variant: "destructive",
      });
      return;
    }

    const portfolioData = {
      stocks: stocks.map(stock => ({
        ticker: stock.ticker.toUpperCase(),
        weight: stock.weight / 100 // Convert percentage to decimal
      })),
      initialValue: parseFloat(initialValue),
      riskFreeRate: parseFloat(riskFreeRate) / 100 // Convert percentage to decimal
    };

    try {
      setPortfolioData(portfolioData);
      setIsAnalyzing(true);
      onClose();

      toast({
        title: "Portfolio analysis started",
        description: "Optimizing your portfolio and fetching market data...",
      });

      // Run the optimization
      const results = await PortfolioOptimizerService.optimizePortfolio(portfolioData);
      setOptimizationResults(results);
      
      toast({
        title: "Analysis complete!",
        description: `Portfolio with ${stocks.length} stocks analyzed successfully.`,
      });

    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your portfolio. Please try again.",
        variant: "destructive",
      });
      console.error("Portfolio optimization error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setStocks([{ ticker: "", weight: 0 }]);
    onClose();
  };

  const totalWeight = stocks.reduce((sum, stock) => sum + stock.weight, 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Create Portfolio</span>
          </DialogTitle>
          <DialogDescription>
            Enter your stock positions to analyze risk, optimize allocation, and compare against benchmarks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Portfolio Value */}
          <div className="space-y-2">
            <Label htmlFor="initial-value">Initial Portfolio Value ($)</Label>
            <Input
              id="initial-value"
              type="number"
              value={initialValue}
              onChange={(e) => setInitialValue(e.target.value)}
              placeholder="10000"
            />
          </div>

          {/* Risk-Free Rate */}
          <div className="space-y-2">
            <Label htmlFor="risk-free-rate">Risk-Free Rate (%)</Label>
            <Input
              id="risk-free-rate"
              type="number"
              step="0.1"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(e.target.value)}
              placeholder="3.0"
            />
          </div>

          {/* Stock Positions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Stock Positions</Label>
              <div className="text-sm text-slate-600">
                Total Weight: <span className={totalWeight === 100 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{totalWeight.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {stocks.map((stock, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder="Ticker (e.g., AAPL)"
                      value={stock.ticker}
                      onChange={(e) => updateStock(index, 'ticker', e.target.value.toUpperCase())}
                      className="text-center font-medium"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Weight (%)"
                      value={stock.weight || ''}
                      onChange={(e) => updateStock(index, 'weight', parseFloat(e.target.value) || 0)}
                      className="text-center"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeStock(index)}
                    disabled={stocks.length === 1}
                    className="h-10 w-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addStock}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Stock
            </Button>
          </div>

          {/* Example */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-800 mb-2">Example Portfolio:</h4>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>AAPL</span>
                <span>25%</span>
              </div>
              <div className="flex justify-between">
                <span>GOOGL</span>
                <span>20%</span>
              </div>
              <div className="flex justify-between">
                <span>MSFT</span>
                <span>15%</span>
              </div>
              <div className="flex justify-between">
                <span>SPY</span>
                <span>40%</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-medium">
                <span>Total</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analyze Portfolio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
