import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { RiskGauge } from "./RiskGauge";
import { WeightsPieChart } from "./WeightsPieChart";
import { EfficientFrontierChart } from "./EfficientFrontierChart";
import { MetricsTable } from "./MetricsTable";
import { ComparisonCharts } from "./ComparisonCharts";
import { MinVolatilityChart } from "./MinVolatilityChart";
import { Loader2 } from "lucide-react";

export const PortfolioResults = () => {
  const { optimizationResults, isAnalyzing } = usePortfolio();

  if (isAnalyzing) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Analyzing Your Portfolio</h3>
        <p className="text-slate-600">
          Running optimization algorithms and fetching market data...
        </p>
      </Card>
    );
  }

  if (!optimizationResults) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Portfolio Analysis Results</h2>
        <p className="text-lg text-slate-600">
          Comprehensive analysis of your portfolio's risk and return characteristics
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="minvol">Min Volatility</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskGauge 
              riskIndex={optimizationResults.currentPortfolio.riskIndex}
              title="Your Portfolio Risk Index"
            />
            <WeightsPieChart 
              weights={optimizationResults.currentPortfolio.weights}
              title="Current Portfolio Allocation"
            />
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeightsPieChart 
              weights={optimizationResults.maxSharpePortfolio.weights}
              title="Maximum Sharpe Ratio Portfolio"
            />
            <WeightsPieChart 
              weights={optimizationResults.minVolatilityPortfolio.weights}
              title="Minimum Volatility Portfolio"
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Optimization Insights</CardTitle>
              <CardDescription>
                These optimized portfolios are calculated with 1% minimum and 30% maximum allocation constraints per asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Maximum Sharpe Ratio</h4>
                  <p className="text-sm text-blue-700">
                    This portfolio maximizes risk-adjusted returns and represents the optimal balance 
                    between risk and reward based on historical data.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Minimum Volatility</h4>
                  <p className="text-sm text-green-700">
                    This portfolio minimizes risk while maintaining reasonable returns, 
                    ideal for conservative investors seeking stability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minvol" className="space-y-6">
          <MinVolatilityChart data={optimizationResults} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <EfficientFrontierChart data={optimizationResults} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <ComparisonCharts results={optimizationResults} />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <MetricsTable results={optimizationResults} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
