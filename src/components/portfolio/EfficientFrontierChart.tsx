
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { OptimizationResults } from "@/contexts/PortfolioContext";

interface EfficientFrontierChartProps {
  data: OptimizationResults;
}

export const EfficientFrontierChart = ({ data }: EfficientFrontierChartProps) => {
  const chartData = [
    {
      name: "Your Portfolio",
      volatility: data.currentPortfolio.volatility * 100,
      return: data.currentPortfolio.return * 100,
      sharpe: data.currentPortfolio.sharpe,
      type: "current"
    },
    {
      name: "Max Sharpe",
      volatility: data.maxSharpePortfolio.volatility * 100,
      return: data.maxSharpePortfolio.return * 100,
      sharpe: data.maxSharpePortfolio.sharpe,
      type: "optimal"
    },
    {
      name: "Min Volatility",
      volatility: data.minVolatilityPortfolio.volatility * 100,
      return: data.minVolatilityPortfolio.return * 100,
      sharpe: data.minVolatilityPortfolio.sharpe,
      type: "conservative"
    }
  ];

  // Add benchmark data
  Object.entries(data.benchmarkResults).forEach(([name, metrics]) => {
    chartData.push({
      name,
      volatility: metrics.volatility * 100,
      return: metrics.return * 100,
      sharpe: metrics.sharpe,
      type: "benchmark"
    });
  });

  const chartConfig = {
    current: { label: "Your Portfolio", color: "#007bff" },
    optimal: { label: "Max Sharpe", color: "#d9534f" },
    conservative: { label: "Min Volatility", color: "#5cb85c" },
    benchmark: { label: "Benchmark", color: "#6c757d" }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk vs Return Analysis</CardTitle>
        <CardDescription>
          Portfolio positioning on the risk-return spectrum with efficient frontier analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis 
                type="number" 
                dataKey="volatility" 
                name="Volatility"
                unit="%" 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <YAxis 
                type="number" 
                dataKey="return" 
                name="Return"
                unit="%" 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              
              <Scatter
                name="Your Portfolio"
                data={chartData.filter(d => d.type === "current")}
                fill="#007bff"
                fillOpacity={0.8}
                stroke="#007bff"
                strokeWidth={2}
                r={8}
              />
              
              <Scatter
                name="Max Sharpe"
                data={chartData.filter(d => d.type === "optimal")}
                fill="#d9534f"
                fillOpacity={0.8}
                stroke="#d9534f"
                strokeWidth={2}
                r={8}
              />
              
              <Scatter
                name="Min Volatility"
                data={chartData.filter(d => d.type === "conservative")}
                fill="#5cb85c"
                fillOpacity={0.8}
                stroke="#5cb85c"
                strokeWidth={2}
                r={8}
              />
              
              <Scatter
                name="Benchmarks"
                data={chartData.filter(d => d.type === "benchmark")}
                fill="#6c757d"
                fillOpacity={0.6}
                stroke="#6c757d"
                strokeWidth={1}
                r={6}
              />

              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name) => [
                  typeof value === 'number' ? `${value.toFixed(2)}%` : value,
                  name
                ]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Your Portfolio</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Max Sharpe</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Min Volatility</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span>Benchmarks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
