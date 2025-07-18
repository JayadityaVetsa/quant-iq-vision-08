import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { OptimizationResults } from "@/contexts/PortfolioContext";
import { TrendingDown, Shield, Target, BarChart3 } from "lucide-react";

interface MinVolatilityChartProps {
  data: OptimizationResults;
}

export const MinVolatilityChart = ({ data }: MinVolatilityChartProps) => {
  const minVolPortfolio = data.minVolatilityPortfolio;
  const currentPortfolio = data.currentPortfolio;
  const maxSharpePortfolio = data.maxSharpePortfolio;

  // Portfolio weights comparison data
  const weightsComparisonData = Object.keys(minVolPortfolio.weights)
    .filter(ticker => minVolPortfolio.weights[ticker] > 0)
    .map(ticker => ({
      ticker,
      minVol: (minVolPortfolio.weights[ticker] || 0) * 100,
      current: (currentPortfolio.weights[ticker] || 0) * 100,
      maxSharpe: (maxSharpePortfolio.weights[ticker] || 0) * 100
    }))
    .sort((a, b) => b.minVol - a.minVol);

  // Risk metrics radar chart data
  const riskMetrics = [
    {
      metric: 'Volatility',
      minVol: (1 - minVolPortfolio.volatility) * 100, // Inverted so lower volatility shows higher on radar
      current: (1 - currentPortfolio.volatility) * 100,
      maxSharpe: (1 - maxSharpePortfolio.volatility) * 100,
      fullMark: 100
    },
    {
      metric: 'Max Drawdown',
      minVol: (1 + minVolPortfolio.maxDrawdown) * 100, // Inverted so lower drawdown shows higher
      current: (1 + currentPortfolio.maxDrawdown) * 100,
      maxSharpe: (1 + maxSharpePortfolio.maxDrawdown) * 100,
      fullMark: 100
    },
    {
      metric: 'Sharpe Ratio',
      minVol: Math.max(0, minVolPortfolio.sharpe * 20), // Scale to 0-100
      current: Math.max(0, currentPortfolio.sharpe * 20),
      maxSharpe: Math.max(0, maxSharpePortfolio.sharpe * 20),
      fullMark: 100
    },
    {
      metric: 'Return',
      minVol: minVolPortfolio.return * 100,
      current: currentPortfolio.return * 100,
      maxSharpe: maxSharpePortfolio.return * 100,
      fullMark: 100
    },
    {
      metric: 'Sortino Ratio',
      minVol: Math.max(0, minVolPortfolio.sortino * 20),
      current: Math.max(0, currentPortfolio.sortino * 20),
      maxSharpe: Math.max(0, maxSharpePortfolio.sortino * 20),
      fullMark: 100
    }
  ];

  // Performance metrics data
  const performanceData = [
    {
      metric: 'Annual Return',
      value: minVolPortfolio.return * 100,
      format: 'percentage',
      color: '#10b981',
      icon: TrendingDown
    },
    {
      metric: 'Volatility',
      value: minVolPortfolio.volatility * 100,
      format: 'percentage',
      color: '#f59e0b',
      icon: BarChart3
    },
    {
      metric: 'Sharpe Ratio',
      value: minVolPortfolio.sharpe,
      format: 'ratio',
      color: '#8b5cf6',
      icon: Target
    },
    {
      metric: 'Max Drawdown',
      value: minVolPortfolio.maxDrawdown * 100,
      format: 'percentage',
      color: '#ef4444',
      icon: Shield
    }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
          <Shield className="w-6 h-6 text-green-600" />
          Minimum Volatility Portfolio Analysis
        </h2>
        <p className="text-slate-600">
          Conservative portfolio designed to minimize risk while maintaining reasonable returns
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={item.metric} className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="w-8 h-8" style={{ color: item.color }} />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">
                      {item.format === 'percentage' ? `${item.value.toFixed(2)}%` : 
                       item.format === 'ratio' ? item.value.toFixed(3) : item.value.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-600">{item.metric}</div>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: item.color,
                      width: `${Math.min(100, Math.max(0, item.value))}%`
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Portfolio Composition and Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Composition Pie Chart */}
        <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100/50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
              Min Volatility Portfolio Composition
            </CardTitle>
            <CardDescription>
              Asset allocation optimized for minimum risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weightsComparisonData.map((item, index) => ({
                      name: item.ticker,
                      value: item.minVol,
                      fill: COLORS[index % COLORS.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {weightsComparisonData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0];
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm text-green-600">
                              {typeof data.value === "number"
                                ? `${data.value.toFixed(2)}%`
                                : data.value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Risk Profile Radar Chart */}
        <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              Risk Profile Comparison
            </CardTitle>
            <CardDescription>
              Multi-dimensional risk analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar
                    name="Min Volatility"
                    dataKey="minVol"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Your Portfolio"
                    dataKey="current"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Max Sharpe"
                    dataKey="maxSharpe"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weight Allocation Comparison */}
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100/50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            Portfolio Weight Allocation Comparison
          </CardTitle>
          <CardDescription>
            How the minimum volatility portfolio differs from your current allocation and max Sharpe portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightsComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="ticker" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Bar dataKey="minVol" name="Min Volatility" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="current" name="Your Portfolio" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="maxSharpe" name="Max Sharpe" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${(value as number).toFixed(2)}%`, name]}
                />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full"></div>
            Minimum Volatility Portfolio Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 mb-3">Key Characteristics</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">Lower Risk</div>
                    <div className="text-sm text-green-700">
                      {((currentPortfolio.volatility - minVolPortfolio.volatility) * 100).toFixed(2)}% less volatile than your current portfolio
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-800">Stable Returns</div>
                    <div className="text-sm text-blue-700">
                      Expected annual return: {(minVolPortfolio.return * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 mb-3">Recommendations</h4>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-semibold text-yellow-800 mb-1">Conservative Approach</div>
                  <div className="text-sm text-yellow-700">
                    Ideal for risk-averse investors or during market uncertainty
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-800 mb-1">Diversification</div>
                  <div className="text-sm text-purple-700">
                    Reduces portfolio risk through optimal asset allocation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 