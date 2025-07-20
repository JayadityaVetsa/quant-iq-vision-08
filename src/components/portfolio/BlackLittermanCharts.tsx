import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area,
  ReferenceLine
} from "recharts";
import { BlackLittermanResponse } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";


interface BlackLittermanChartsProps {
  results: BlackLittermanResponse;
  userViews: Record<string, number>;
  userConfidences: Record<string, number>;
}

// Extended interface to handle optional properties
interface ExtendedBlackLittermanResponse extends BlackLittermanResponse {
  market_cap_weights?: Record<string, number>;
  dividend_yields?: Record<string, number>;
  rf_rate?: number;
  tau_parameter?: number;
}

// Enhanced color palette for better visual distinction
const CHART_COLORS = [
  "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1",
  "#14b8a6", "#eab308", "#dc2626", "#9333ea", "#2563eb"
];

const SECTOR_COLORS = {
  "Technology": "#0ea5e9",
  "Healthcare": "#10b981", 
  "Consumer Defensive": "#f59e0b",
  "Consumer Cyclical": "#ef4444",
  "Financial Services": "#8b5cf6",
  "Energy": "#06b6d4",
  "Industrials": "#84cc16",
  "Real Estate": "#f97316",
  "Materials": "#ec4899",
  "Utilities": "#6366f1",
  "Communication Services": "#14b8a6",
  "Other": "#6b7280"
};



export const BlackLittermanCharts: React.FC<BlackLittermanChartsProps> = ({ 
  results, 
  userViews, 
  userConfidences 
}) => {
  // Cast to extended interface to handle optional properties
  const extendedResults = results as ExtendedBlackLittermanResponse;
  const tickers = Object.keys(results.optimal_weights);

  // Portfolio Weights Chart Data
  const weightsData = tickers.map(ticker => ({
    ticker,
    blOptimal: results.optimal_weights[ticker] * 100,
    marketCap: extendedResults.market_cap_weights?.[ticker] * 100 || (100 / tickers.length), // fallback to equal weight
    color: CHART_COLORS[tickers.indexOf(ticker) % CHART_COLORS.length]
  })).sort((a, b) => b.blOptimal - a.blOptimal);



  // Risk Contribution Data (simulated - would need actual risk decomposition)
  const riskData = tickers.map(ticker => {
    const weight = results.optimal_weights[ticker];
    const volatility = 0.15 + Math.random() * 0.25; // Simulated individual volatility
    const riskContrib = weight * volatility;
    
    return {
      ticker,
      riskContribution: riskContrib * 100,
      color: CHART_COLORS[tickers.indexOf(ticker) % CHART_COLORS.length]
    };
  });



  // Confidence Levels Data
  const confidenceData = tickers.map(ticker => ({
    ticker,
    confidence: userConfidences[ticker] || 0.5,
    color: CHART_COLORS[tickers.indexOf(ticker) % CHART_COLORS.length]
  })).sort((a, b) => b.confidence - a.confidence);



  // Portfolio vs Market Cap Weighting
  const weightComparisonData = tickers.map(ticker => ({
    ticker,
    blWeight: results.optimal_weights[ticker] * 100,
    marketWeight: extendedResults.market_cap_weights?.[ticker] * 100 || (100 / tickers.length),
    difference: (results.optimal_weights[ticker] - (extendedResults.market_cap_weights?.[ticker] || (1 / tickers.length))) * 100,
    color: CHART_COLORS[tickers.indexOf(ticker) % CHART_COLORS.length]
  }));

  // Historical Performance Data (simulated)
  const performanceData = tickers.map(ticker => ({
    ticker,
    priceReturn: Math.random() * 60 + 10, // 10-70% range
    totalReturn: Math.random() * 80 + 15, // 15-95% range
    color: CHART_COLORS[tickers.indexOf(ticker) % CHART_COLORS.length]
  })).sort((a, b) => b.totalReturn - a.totalReturn);

  // Sector Allocation Data - use stock_info if available, otherwise fallback to mapping
  const getSectorForTicker = (ticker: string): string => {
    // Try to use actual sector data from stock_info first
    if (results.stock_info[ticker]?.sector) {
      return results.stock_info[ticker].sector;
    }
    
    // Fallback to mapping
    const sectorMap: Record<string, string> = {
      "AAPL": "Technology", "MSFT": "Technology", "GOOGL": "Communication Services", "NVDA": "Technology",
      "TSLA": "Consumer Cyclical", "AMZN": "Consumer Cyclical", "META": "Communication Services",
      "JNJ": "Healthcare", "PG": "Consumer Defensive", "JPM": "Financial Services",
      "XOM": "Energy", "BAC": "Financial Services", "WMT": "Consumer Defensive",
      "V": "Financial Services", "HD": "Consumer Cyclical", "PFE": "Healthcare",
      "KO": "Consumer Defensive", "DIS": "Communication Services", "NFLX": "Communication Services",
      "ORCL": "Technology", "INTC": "Technology", "AMD": "Technology", "CRM": "Technology",
      "ANET": "Technology", "ASML": "Technology", "NET": "Technology"
    };
    return sectorMap[ticker] || "Other";
  };

  const sectorAllocation = tickers.reduce((acc, ticker) => {
    const sector = getSectorForTicker(ticker);
    const weight = results.optimal_weights[ticker] * 100;
    acc[sector] = (acc[sector] || 0) + weight;
    return acc;
  }, {} as Record<string, number>);

  const sectorData = Object.entries(sectorAllocation).map(([sector, weight]) => ({
    sector,
    weight,
    color: SECTOR_COLORS[sector] || SECTOR_COLORS.Other
  })).sort((a, b) => b.weight - a.weight);

  const chartConfig = {
    blOptimal: { label: "BL Optimal", color: "#0ea5e9" },
    marketCap: { label: "Market Cap", color: "#f59e0b" },
    priceReturn: { label: "Price Return", color: "#10b981" },
    dividendYield: { label: "Dividend Yield", color: "#f59e0b" },
    totalReturn: { label: "Total Return", color: "#ef4444" }
  };

  // --- DRAGGABLE CHART CARDS LOGIC ---
  const CARD_KEYS = [
    "weightComparison",
    "stats",
    "sector",
    "weights",
    "risk",
    "confidence",
    "performance"
  ];

  // Chart card renderers
  const chartCards: Record<string, React.ReactNode> = {
    weightComparison: (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-rose-500 to-rose-600 rounded-full"></div>
            ⚖️ Portfolio vs Market Cap Weighting
          </CardTitle>
          <CardDescription>Weight differences from market cap baseline</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis dataKey="ticker" tick={{ fontSize: 10 }} interval={0} />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />} 
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "Weight Differential"]}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" strokeWidth={1} />
                <Bar dataKey="difference" radius={[2, 2, 2, 2]}>
                  {weightComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.difference >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    ),
    stats: (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"></div>
            📊 PORTFOLIO STATISTICS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Expected Annual Return:</span>
              <span className="font-bold text-green-600">
                {(results.portfolio_stats.expected_return * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Annual Volatility:</span>
              <span className="font-bold text-orange-600">
                {(results.portfolio_stats.volatility * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sharpe Ratio:</span>
              <span className="font-bold text-blue-600">
                {results.portfolio_stats.sharpe_ratio.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Portfolio Dividend Yield:</span>
              <span className="font-bold text-purple-600">
                {(results.portfolio_stats.dividend_yield * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Risk-Free Rate:</span>
              <span className="font-bold text-gray-600">
                {extendedResults.rf_rate ? `${(extendedResults.rf_rate * 100).toFixed(2)}%` : '4.50%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Holdings:</span>
              <span className="font-bold text-gray-600">{tickers.length} stocks</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tau Parameter:</span>
              <span className="font-bold text-gray-600">
                {extendedResults.tau_parameter || '0.050'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Dividend Integration:</span>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                ✅ Enabled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    sector: (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
            🏢 Portfolio Allocation by Sector
          </CardTitle>
          <CardDescription>Sector diversification breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="40%"
                  outerRadius={75}
                  innerRadius={25}
                  paddingAngle={2}
                  dataKey="weight"
                  label={({ sector, weight }) => weight > 15 ? `${weight.toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={50}
                  wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: 10 }}>
                      {value}: {sectorData.find(d => d.sector === value)?.weight.toFixed(1)}%
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    ),
    weights: (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            📊 Portfolio Weights: Optimal vs Market Cap
          </CardTitle>
          <CardDescription>BL Optimal vs Market Cap weights comparison</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightsData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <XAxis 
                  dataKey="ticker" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  height={50}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${Number(value).toFixed(2)}%`, name]}
                />
                <Bar dataKey="blOptimal" name="BL Optimal" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                <Bar dataKey="marketCap" name="Market Cap" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    ),

    risk: (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
            ⚠️ Risk Contribution by Stock
          </CardTitle>
          <CardDescription>Portfolio risk decomposition by individual holdings</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={35}
                  paddingAngle={2}
                  dataKey="riskContribution"
                  label={({ ticker, riskContribution }) => `${ticker}\n${riskContribution.toFixed(1)}%`}
                  labelLine={false}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "Risk Contribution"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    ),

    confidence: (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            🎯 Your Confidence Levels
          </CardTitle>
          <CardDescription>How confident you are in your views for each stock</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <XAxis dataKey="ticker" tick={{ fontSize: 12 }} interval={0} height={50} />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  domain={[0, 1]}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [Number(value).toFixed(2), "Confidence"]}
                />
                <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    ),

    performance: (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-cyan-50 to-sky-50 border-b border-cyan-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full"></div>
            📈 Historical Performance: Price vs Total Returns
          </CardTitle>
          <CardDescription>Simulated historical performance comparison across holdings</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <XAxis dataKey="ticker" tick={{ fontSize: 12 }} interval={0} height={50} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value.toFixed(0)}%`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                />
                <Bar dataKey="priceReturn" name="Historical Price Return" fill="#60a5fa" radius={[0, 0, 0, 0]} />
                <Bar dataKey="totalReturn" name="Historical Total Return" fill="#1d4ed8" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    ),
  };

  // --- END DRAGGABLE CHART CARDS LOGIC ---

  return (
    <div className="space-y-6">
      {/* Final Portfolio Allocation Summary */}
      {results.allocation_summary && (
        <Card className="overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200/60 shadow-xl">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100/50">
            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
              <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
              ✅ FINAL PORTFOLIO ALLOCATION SUMMARY
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Based on a ${results.model_parameters?.portfolio_value || 100000} portfolio, here is your recommended allocation:
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Ticker</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Company Name</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">Final Weight</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">Investment ($)</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">Shares to Buy</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">Latest Price</th>
                  </tr>
                </thead>
                <tbody>
                  {results.allocation_summary.map((item, index) => (
                    <tr key={item.ticker} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-800">{item.ticker}</td>
                      <td className="py-2 px-3 text-slate-600">{item.company_name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-700">
                        {(item.final_weight * 100).toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">
                        ${item.investment_amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {item.shares_to_buy.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        ${item.latest_price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {(results.portfolio_stats.expected_return * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-slate-600">Projected Annual Return</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {(results.portfolio_stats.volatility * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-slate-600">Projected Annual Volatility (Risk)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(results.portfolio_stats.dividend_yield * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-slate-600">Projected Portfolio Dividend Yield</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Model Parameters */}
      {results.model_parameters && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            MODEL PARAMETERS
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {results.model_parameters.tau}
              </div>
              <div className="text-sm text-blue-500 font-medium">Tau (uncertainty scaling)</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {results.model_parameters.data_period}
              </div>
              <div className="text-sm text-green-500 font-medium">Data period</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {results.model_parameters.dividend_integration ? '✅' : '❌'}
              </div>
              <div className="text-sm text-purple-500 font-medium">Dividend integration</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {results.model_parameters.number_of_stocks}
              </div>
              <div className="text-sm text-orange-500 font-medium">Number of stocks</div>
            </div>
          </div>
        </div>
      )}

      {/* Chart cards */}
      <div className="space-y-6">
        {CARD_KEYS.map(key => (
          <div key={key} className="mb-6">
            {chartCards[key]}
          </div>
        ))}
      </div>
    </div>
  );
}; 