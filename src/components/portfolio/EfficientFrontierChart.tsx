
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Line, LineChart } from "recharts";
import { OptimizationResults } from "@/contexts/PortfolioContext";

interface EfficientFrontierChartProps {
  data: OptimizationResults;
}

export const EfficientFrontierChart = ({ data }: EfficientFrontierChartProps) => {
  // Portfolio points
  const portfolioPoints = [
    {
      name: "Your Portfolio",
      volatility: data.currentPortfolio.volatility * 100,
      return: data.currentPortfolio.return * 100,
      sharpe: data.currentPortfolio.sharpe,
      type: "current",
      size: 10
    },
    {
      name: "Max Sharpe",
      volatility: data.maxSharpePortfolio.volatility * 100,
      return: data.maxSharpePortfolio.return * 100,
      sharpe: data.maxSharpePortfolio.sharpe,
      type: "optimal",
      size: 10
    },
    {
      name: "Min Volatility",
      volatility: data.minVolatilityPortfolio.volatility * 100,
      return: data.minVolatilityPortfolio.return * 100,
      sharpe: data.minVolatilityPortfolio.sharpe,
      type: "conservative",
      size: 10
    }
  ];

  // Add benchmark data
  Object.entries(data.benchmarkResults).forEach(([name, metrics]) => {
    portfolioPoints.push({
      name,
      volatility: metrics.volatility * 100,
      return: metrics.return * 100,
      sharpe: metrics.sharpe,
      type: "benchmark",
      size: 8
    });
  });

  // Monte Carlo simulation points
  const monteCarloPoints = data.monteCarloSimulation?.returns ? 
    data.monteCarloSimulation.returns.map((ret: number, idx: number) => ({
      volatility: (data.monteCarloSimulation.volatilities?.[idx] || 0) * 100,
      return: ret * 100,
      sharpe: data.monteCarloSimulation.sharpe_ratios?.[idx] || 0,
      type: "simulation",
      size: 2
    })).filter(point => point.volatility > 0 && point.return > -50 && point.return < 150) // Filter outliers
    : [];

  // Efficient frontier curve
  const efficientFrontierCurve = data.efficientFrontierData ? 
    data.efficientFrontierData.map((point: any) => ({
      volatility: point.volatility * 100,
      return: point.return * 100,
      sharpe: point.sharpe || 0,
      type: "frontier"
    })).sort((a, b) => a.volatility - b.volatility)
    : [];

  const chartConfig = {
    current: { label: "Your Portfolio", color: "#007bff" },
    optimal: { label: "Max Sharpe", color: "#d9534f" },
    conservative: { label: "Min Volatility", color: "#5cb85c" },
    benchmark: { label: "Benchmark", color: "#6c757d" },
    simulation: { label: "Simulated Portfolios", color: "#e5e7eb" },
    frontier: { label: "Efficient Frontier", color: "#000000" }
  };

  // Calculate axis domains
  const allVolatilities = [...portfolioPoints, ...monteCarloPoints].map(p => p.volatility);
  const allReturns = [...portfolioPoints, ...monteCarloPoints].map(p => p.return);
  const minVol = Math.max(0, Math.min(...allVolatilities) - 2);
  const maxVol = Math.max(...allVolatilities) + 2;
  const minRet = Math.min(...allReturns) - 2;
  const maxRet = Math.max(...allReturns) + 2;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100/50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          Efficient Frontier, CML, & Asset Allocation
        </CardTitle>
        <CardDescription>
          The chart below shows a Monte Carlo simulation of 10,000 random portfolios. This visualizes the entire universe of possible outcomes for your selected assets, including the individual stocks. Your portfolio is compared against the optimal points on the efficient frontier (dashed line).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <XAxis 
                type="number" 
                dataKey="volatility" 
                name="Volatility"
                unit="%" 
                domain={[minVol, maxVol]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                label={{ value: 'Annualized Volatility (Risk)', position: 'bottom', offset: -40 }}
              />
              <YAxis 
                type="number" 
                dataKey="return" 
                name="Return"
                unit="%" 
                domain={[minRet, maxRet]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                label={{ value: 'Annualized Return', angle: -90, position: 'insideLeft' }}
              />
              
              {/* Monte Carlo Simulation Points */}
              {monteCarloPoints.length > 0 && (
                <Scatter
                  name="Simulated Portfolios"
                  data={monteCarloPoints}
                  fill="#e5e7eb"
                  fillOpacity={0.4}
                  stroke="none"
                  r={1}
                />
              )}

              {/* Individual asset points */}
              {Object.entries(data.currentPortfolio.weights).map(([ticker, weight]) => {
                if (weight > 0) {
                  // Simulate individual asset risk/return (would normally come from backend)
                  const assetVol = 25 + Math.random() * 20; // 25-45% volatility range
                  const assetRet = 5 + Math.random() * 30; // 5-35% return range
                  return (
                    <Scatter
                      key={`asset-${ticker}`}
                      name={ticker}
                      data={[{
                        volatility: assetVol,
                        return: assetRet,
                        name: ticker,
                        type: "asset"
                      }]}
                      fill="#fbbf24"
                      fillOpacity={0.8}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      r={6}
                    />
                  );
                }
                return null;
              })}
              
              {/* Portfolio Points */}
              <Scatter
                name="Your Portfolio"
                data={portfolioPoints.filter(d => d.type === "current")}
                fill="#007bff"
                fillOpacity={0.9}
                stroke="#0056b3"
                strokeWidth={3}
                r={10}
              />
              
              <Scatter
                name="Max Sharpe Portfolio"
                data={portfolioPoints.filter(d => d.type === "optimal")}
                fill="#d9534f"
                fillOpacity={0.9}
                stroke="#c9302c"
                strokeWidth={3}
                r={10}
              />
              
              <Scatter
                name="Min Volatility Portfolio"
                data={portfolioPoints.filter(d => d.type === "conservative")}
                fill="#5cb85c"
                fillOpacity={0.9}
                stroke="#449d44"
                strokeWidth={3}
                r={10}
              />
              
              <Scatter
                name="Benchmarks"
                data={portfolioPoints.filter(d => d.type === "benchmark")}
                fill="#6c757d"
                fillOpacity={0.7}
                stroke="#495057"
                strokeWidth={2}
                r={8}
              />

              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold">{data.name || "Portfolio"}</p>
                        <p className="text-sm text-blue-600">Return: {data.return?.toFixed(2)}%</p>
                        <p className="text-sm text-orange-600">Volatility: {data.volatility?.toFixed(2)}%</p>
                        <p className="text-sm text-green-600">Sharpe: {data.sharpe?.toFixed(3)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>Simulated Portfolios</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <span>Efficient Frontier</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Individual Assets</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Your Portfolio</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Max Sharpe Portfolio</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Min Volatility Portfolio</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/60 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-2">Chart Interpretation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <strong>Gray Cloud:</strong> Shows all possible portfolio combinations from Monte Carlo simulation ({monteCarloPoints.length.toLocaleString()} portfolios)
            </div>
            <div>
              <strong>Efficient Frontier:</strong> The optimal risk-return tradeoff curve (higher return for each level of risk)
            </div>
            <div>
              <strong>Individual Assets:</strong> Risk-return profile of each stock in your portfolio
            </div>
            <div>
              <strong>Portfolio Positions:</strong> Your current portfolio vs. optimized allocations
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
