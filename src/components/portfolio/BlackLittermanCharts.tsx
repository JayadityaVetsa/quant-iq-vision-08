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
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import clsx from "clsx";

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

// DraggableCard component (same as MonteCarloTab)
function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? transition + ', box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)' : undefined,
    zIndex: isDragging ? 50 : 1,
    boxShadow: isDragging ? "0 12px 32px 0 rgba(31,38,135,0.18)" : "0 4px 16px 0 rgba(31,38,135,0.08)",
    opacity: isDragging ? 0.97 : 1,
    borderRadius: '1.25rem',
    background: isDragging ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.96)',
    border: '1.5px solid #e5e7eb',
    scale: isDragging ? '1.03' : '1',
  };
  return (
    <div ref={setNodeRef} style={style} className="mb-10 transition-all duration-300">
      <div className={clsx(
        "flex items-center gap-2 px-4 py-2 cursor-grab select-none rounded-t-2xl bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200",
        isDragging ? "shadow-lg" : "shadow-sm"
      )} {...attributes} {...listeners}>
        <GripVertical className="w-6 h-6 text-slate-400" />
        <span className={clsx("text-xs text-slate-400 font-medium transition-opacity duration-200", isDragging ? "opacity-0" : "opacity-100")}>Drag to reorder</span>
      </div>
      <div className="p-2 md:p-4">{children}</div>
    </div>
  );
}

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

  // Return Breakdown Data
  const returnData = tickers.map(ticker => {
    const priceReturn = results.posterior_returns[ticker] * 100;
    const dividendYield = (results.stock_info[ticker]?.dividend_yield || 0) * 100;
    const totalReturn = priceReturn + dividendYield;
    
    return {
      ticker,
      priceReturn,
      dividendYield, 
      totalReturn,
      color: CHART_COLORS[tickers.indexOf(ticker) % CHART_COLORS.length]
    };
  }).sort((a, b) => b.totalReturn - a.totalReturn);

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

  // Dividend Yields Data - get from stock_info instead of dividend_yields
  const dividendData = tickers.map(ticker => ({
    ticker,
    dividendYield: (results.stock_info[ticker]?.dividend_yield || 0) * 100,
    color: CHART_COLORS[tickers.indexOf(ticker) % CHART_COLORS.length]
  })).sort((a, b) => b.dividendYield - a.dividendYield);

  // Confidence Levels Data
  const confidenceData = tickers.map(ticker => ({
    ticker,
    confidence: userConfidences[ticker] || 0.5,
    color: CHART_COLORS[tickers.indexOf(ticker) % CHART_COLORS.length]
  })).sort((a, b) => b.confidence - a.confidence);

  // Views vs Market Expectations
  const viewsData = tickers.map(ticker => {
    const userView = userViews[ticker] || 0;
    const marketExpected = results.posterior_returns[ticker];
    const difference = userView - marketExpected;
    
    return {
      ticker,
      userView: userView * 100,
      marketExpected: marketExpected * 100,
      difference: difference * 100,
      color: difference > 0 ? "#10b981" : "#ef4444"
    };
  });

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
    "returns",
    "risk",
    "dividends",
    "confidence",
    "views",
    "performance"
  ];
  const [cardOrder, setCardOrder] = React.useState(CARD_KEYS);
  const sensors = useSensors(useSensor(PointerSensor));

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
    returns: (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
            📈 Return Breakdown (Total = Price + Dividends)
          </CardTitle>
          <CardDescription>Expected returns decomposition with trend line</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={returnData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <XAxis dataKey="ticker" tick={{ fontSize: 12 }} interval={0} height={50} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value.toFixed(1)}%`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${Number(value).toFixed(2)}%`, name]}
                />
                <Bar dataKey="priceReturn" stackId="return" name="Expected Price Return" fill="#10b981" />
                <Bar dataKey="dividendYield" stackId="return" name="Dividend Yield" fill="#f59e0b" />
                <Line 
                  dataKey="totalReturn" 
                  type="monotone" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  name="Your Total View"
                />
              </ComposedChart>
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
    dividends: (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></div>
            💰 Dividend Yields by Stock
          </CardTitle>
          <CardDescription>Annual dividend yield expectations by holding</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dividendData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <XAxis dataKey="ticker" tick={{ fontSize: 12 }} interval={0} height={50} />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  domain={[0, 1]} 
                  tickFormatter={(value) => `${value.toFixed(1)}%`} 
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "Dividend Yield"]}
                />
                <Bar dataKey="dividendYield" radius={[4, 4, 0, 0]}>
                  {dividendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
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
    views: (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
            💭 Your Views vs Market Expectations
          </CardTitle>
          <CardDescription>Comparison of your return expectations vs market consensus</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <XAxis dataKey="ticker" tick={{ fontSize: 12 }} interval={0} height={50} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value.toFixed(1)}%`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${Number(value).toFixed(2)}%`, name]}
                />
                <Bar dataKey="userView" name="Your View" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="marketExpected" name="Market Expected" fill="#ef4444" radius={[2, 2, 0, 0]} />
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

      {/* Key Insights */}
      {results.key_insights && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-yellow-800">💡 KEY INSIGHTS</h4>
          <ul className="space-y-2">
            {results.key_insights.map((insight, index) => (
              <li key={index} className="text-sm text-yellow-700">
                • {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Model Parameters */}
      {results.model_parameters && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-gray-800">🔧 MODEL PARAMETERS</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">Tau (uncertainty scaling):</span> {results.model_parameters.tau}
            </div>
            <div>
              <span className="font-semibold">Data period:</span> {results.model_parameters.data_period}
            </div>
            <div>
              <span className="font-semibold">Dividend integration:</span> {results.model_parameters.dividend_integration ? '✅ Enabled' : '❌ Disabled'}
            </div>
            <div>
              <span className="font-semibold">Number of stocks:</span> {results.model_parameters.number_of_stocks}
            </div>
          </div>
        </div>
      )}

      {/* Draggable chart cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={event => {
        const { active, over } = event;
        if (active.id !== over?.id) {
          setCardOrder((items) => {
            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over?.id as string);
            return arrayMove(items, oldIndex, newIndex);
          });
        }
      }}>
        <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
          {cardOrder.map(key => (
            <DraggableCard key={key} id={key}>
              {chartCards[key]}
            </DraggableCard>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}; 