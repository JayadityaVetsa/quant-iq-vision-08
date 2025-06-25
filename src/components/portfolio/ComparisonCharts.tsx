
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { OptimizationResults } from "@/contexts/PortfolioContext";

interface ComparisonChartsProps {
  results: OptimizationResults;
}

export const ComparisonCharts = ({ results }: ComparisonChartsProps) => {
  const prepareChartData = (metric: keyof OptimizationResults['currentPortfolio']) => {
    const data = [
      {
        name: "Your Portfolio",
        value: results.currentPortfolio[metric],
        type: "current",
        color: "#007bff"
      },
      {
        name: "Max Sharpe",
        value: results.maxSharpePortfolio[metric],
        type: "optimal",
        color: "#d9534f"
      },
      {
        name: "Min Volatility",
        value: results.minVolatilityPortfolio[metric],
        type: "conservative",
        color: "#5cb85c"
      }
    ];

    // Add benchmarks
    Object.entries(results.benchmarkResults).forEach(([name, metrics]) => {
      data.push({
        name,
        value: metrics[metric],
        type: "benchmark",
        color: "#6c757d"
      });
    });

    return data.sort((a, b) => {
      if (metric === 'volatility' || metric === 'maxDrawdown') {
        return (a.value as number) - (b.value as number); // Lower is better
      }
      return (b.value as number) - (a.value as number); // Higher is better
    });
  };

  const chartConfig = {
    current: { label: "Your Portfolio", color: "#007bff" },
    optimal: { label: "Max Sharpe", color: "#d9534f" },
    conservative: { label: "Min Volatility", color: "#5cb85c" },
    benchmark: { label: "Benchmark", color: "#6c757d" }
  };

  const riskIndexData = prepareChartData('riskIndex');
  const sharpeData = prepareChartData('sharpe');
  const volatilityData = prepareChartData('volatility');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Index Comparison</CardTitle>
          <CardDescription>Higher scores indicate better risk-adjusted performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskIndexData} layout="horizontal">
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  width={120}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {riskIndexData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : value, "Risk Index"]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sharpe Ratio Comparison</CardTitle>
          <CardDescription>Risk-adjusted return measure (higher is better)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sharpeData} layout="horizontal">
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  width={120}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {sharpeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [typeof value === 'number' ? value.toFixed(3) : value, "Sharpe Ratio"]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volatility Comparison</CardTitle>
          <CardDescription>Portfolio risk measure (lower is better)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volatilityData} layout="horizontal">
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  width={120}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {volatilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : value, "Volatility"]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
