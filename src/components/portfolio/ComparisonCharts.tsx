
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptimizationResults } from "@/contexts/PortfolioContext";
import { useState } from "react";

interface ComparisonChartsProps {
  results: OptimizationResults;
}

export const ComparisonCharts = ({ results }: ComparisonChartsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<keyof OptimizationResults['currentPortfolio']>('riskIndex');

  const prepareChartData = (metric: keyof OptimizationResults['currentPortfolio']) => {
    const data = [
      {
        name: "Your Portfolio",
        value: results.currentPortfolio[metric] as number,
        type: "current",
        color: "#007bff"
      },
      {
        name: "Max Sharpe",
        value: results.maxSharpePortfolio[metric] as number,
        type: "optimal",
        color: "#d9534f"
      },
      {
        name: "Min Volatility",
        value: results.minVolatilityPortfolio[metric] as number,
        type: "conservative",
        color: "#5cb85c"
      }
    ];

    // Add benchmarks
    Object.entries(results.benchmarkResults).forEach(([name, metrics]) => {
      if (typeof metrics[metric] === 'number') {
        data.push({
          name,
          value: metrics[metric] as number,
          type: "benchmark",
          color: "#6c757d"
        });
      }
    });

    return data.sort((a, b) => {
      if (metric === 'volatility' || metric === 'maxDrawdown') {
        return a.value - b.value; // Lower is better
      }
      return b.value - a.value; // Higher is better
    });
  };

  // Debugging: Log the results and chart data
  console.log('ComparisonCharts results:', results);
  const currentData = prepareChartData(selectedMetric);
  console.log('Chart data for metric', selectedMetric, currentData);

  const chartConfig = {
    current: { label: "Your Portfolio", color: "#007bff" },
    optimal: { label: "Max Sharpe", color: "#d9534f" },
    conservative: { label: "Min Volatility", color: "#5cb85c" },
    benchmark: { label: "Benchmark", color: "#6c757d" }
  };

  const metricInfo = {
    riskIndex: {
      title: 'Risk Index Comparison',
      description: 'Higher scores indicate better risk-adjusted performance (0-100 scale)',
      formatter: (value: number) => value.toFixed(1),
      gradientFrom: 'blue-50',
      gradientTo: 'indigo-50',
      borderColor: 'blue-100/50',
      barColor: 'blue-500',
      unit: ''
    },
    sharpe: {
      title: 'Sharpe Ratio Comparison',
      description: 'Risk-adjusted return measure (higher is better)',
      formatter: (value: number) => value.toFixed(3),
      gradientFrom: 'green-50',
      gradientTo: 'emerald-50',
      borderColor: 'green-100/50',
      barColor: 'green-500',
      unit: ''
    },
    volatility: {
      title: 'Volatility Comparison',
      description: 'Portfolio risk measure (lower is better)',
      formatter: (value: number) => `${(value * 100).toFixed(2)}%`,
      gradientFrom: 'orange-50',
      gradientTo: 'amber-50',
      borderColor: 'orange-100/50',
      barColor: 'orange-500',
      unit: '%'
    },
    return: {
      title: 'Annual Return Comparison',
      description: 'Expected yearly return (higher is better)',
      formatter: (value: number) => `${(value * 100).toFixed(2)}%`,
      gradientFrom: 'emerald-50',
      gradientTo: 'teal-50',
      borderColor: 'emerald-100/50',
      barColor: 'emerald-500',
      unit: '%'
    },
    sortino: {
      title: 'Sortino Ratio Comparison',
      description: 'Downside risk-adjusted return (higher is better)',
      formatter: (value: number) => value.toFixed(3),
      gradientFrom: 'purple-50',
      gradientTo: 'violet-50',
      borderColor: 'purple-100/50',
      barColor: 'purple-500',
      unit: ''
    },
    maxDrawdown: {
      title: 'Maximum Drawdown Comparison',
      description: 'Largest peak-to-trough decline (lower is better)',
      formatter: (value: number) => `${(value * 100).toFixed(2)}%`,
      gradientFrom: 'red-50',
      gradientTo: 'rose-50',
      borderColor: 'red-100/50',
      barColor: 'red-500',
      unit: '%'
    }
  };

  const currentMetricInfo = metricInfo[selectedMetric];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className={`bg-gradient-to-r from-${currentMetricInfo.gradientFrom} to-${currentMetricInfo.gradientTo} border-b border-${currentMetricInfo.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-6 bg-gradient-to-b from-${currentMetricInfo.barColor} to-${currentMetricInfo.barColor} rounded-full`}></div>
              <div>
                <CardTitle className="text-slate-800">{currentMetricInfo.title}</CardTitle>
                <CardDescription>{currentMetricInfo.description}</CardDescription>
              </div>
            </div>
            <div className="w-48">
              <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as keyof OptimizationResults['currentPortfolio'])}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="riskIndex">Risk Index</SelectItem>
                  <SelectItem value="sharpe">Sharpe Ratio</SelectItem>
                  <SelectItem value="sortino">Sortino Ratio</SelectItem>
                  <SelectItem value="return">Annual Return</SelectItem>
                  <SelectItem value="volatility">Volatility</SelectItem>
                  <SelectItem value="maxDrawdown">Max Drawdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
                <YAxis type="number" axisLine={false} tickLine={false} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [currentMetricInfo.formatter(typeof value === 'number' ? value : 0), selectedMetric]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/60 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3">Performance Comparison Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {currentData.slice(0, 3).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {currentMetricInfo.formatter(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
