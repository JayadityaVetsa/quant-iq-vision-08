import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService, MonteCarloRequest, MonteCarloResponse } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, GripVertical } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart, Legend, BarChart, Bar, Cell, Line as ReLine, ReferenceLine, CartesianGrid } from "recharts";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

const DEFAULT_TICKERS = ["AAPL", "TSLA", "NVDA", "ANET"];
const DEFAULT_WEIGHTS = Array(4).fill(0.25);
const DEFAULT_BENCHMARK = "SPY";
const DEFAULT_START_DATE = "2021-01-01";
const DEFAULT_END_DATE = "2024-01-01";
const DEFAULT_INITIAL_VALUE = 100000;
const DEFAULT_N_SIMULATIONS = 10000;
const DEFAULT_N_DAYS = 252;

// Helper for heatmap colors
function getHeatmapColor(value: number) {
  // Red (0) to green (1) scale for correlation values
  // value is already in [0, 1] range from correlation matrix
  
  if (value < 0.5) {
    // Red with opacity based on correlation value
    const opacity = 0.3 + (value * 0.7); // 0.3 to 1.0
    return `rgba(255, 0, 0, ${opacity})`; // Red with varying opacity
  } else {
    // Green with opacity based on correlation value
    const opacity = 0.3 + ((value - 0.5) * 0.7); // 0.3 to 1.0
    return `rgba(0, 255, 0, ${opacity})`; // Green with varying opacity
  }
}

// Helper: Kernel Density Estimation (Gaussian)
function kde(xs: number[], bandwidth = 0.01, points = 100) {
  if (xs.length === 0) return { x: [], y: [] };
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  const step = (max - min) / (points - 1);
  const kernel = (u: number) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
  const xvals = Array.from({ length: points }, (_, i) => min + i * step);
  const yvals = xvals.map(x =>
    xs.reduce((sum, xi) => sum + kernel((x - xi) / bandwidth), 0) / (xs.length * bandwidth)
  );
  return { x: xvals, y: yvals };
}

// Custom legend for the final value distribution chart
const FinalDistLegend = () => (
  <div className="flex flex-col items-start gap-2 text-xs md:text-sm mb-4">
    <div className="flex items-center gap-2">
      <span className="inline-block w-4 h-1 rounded bg-orange-400" /> KDE
    </div>
    <div className="flex items-center gap-2">
      <span className="inline-block w-4 h-1 rounded border-t-2 border-dashed border-red-500" /> VaR (5%)
    </div>
    <div className="flex items-center gap-2">
      <span className="inline-block w-4 h-1 rounded border-t-2 border-dashed border-green-500" /> Mean
    </div>
    <div className="flex items-center gap-2">
      <span className="inline-block w-4 h-1 rounded bg-gray-800" /> Initial
    </div>
  </div>
);

// Helper: Custom label for ReferenceLine with offset and background
const RefLineLabel = ({ value, color }: { value: string; color: string }) => (
  <div style={{
    background: 'rgba(255,255,255,0.85)',
    color,
    fontWeight: 600,
    fontSize: 13,
    borderRadius: 4,
    padding: '2px 6px',
    marginTop: -24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  }}>{value}</div>
);

const CARD_KEYS = [
  "priceChart",
  "returnDistributions",
  "heatmap",
  "cone",
  "finalDist"
];

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

export const MonteCarloTab: React.FC = () => {
  const [tickers, setTickers] = useState<string[]>([...DEFAULT_TICKERS]);
  const [weights, setWeights] = useState<number[]>([...DEFAULT_WEIGHTS]);
  const [benchmark, setBenchmark] = useState<string>(DEFAULT_BENCHMARK);
  const [startDate, setStartDate] = useState<string>(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState<string>(DEFAULT_END_DATE);
  const [initialValue, setInitialValue] = useState<number>(DEFAULT_INITIAL_VALUE);
  const [nSimulations, setNSimulations] = useState<number>(DEFAULT_N_SIMULATIONS);
  const [nDays, setNDays] = useState<number>(DEFAULT_N_DAYS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MonteCarloResponse | null>(null);
  const [cardOrder, setCardOrder] = useState(CARD_KEYS);

  const handleTickerChange = (index: number, value: string) => {
    const newTickers = [...tickers];
    newTickers[index] = value.toUpperCase();
    setTickers(newTickers);
  };

  const handleWeightChange = (index: number, value: string) => {
    const newWeights = [...weights];
    newWeights[index] = parseFloat(value) || 0;
    setWeights(newWeights);
  };

  const handleAddTicker = () => {
    setTickers([...tickers, ""]);
    setWeights([...weights, 0]);
  };

  const handleRemoveTicker = (index: number) => {
    if (tickers.length > 1) {
      setTickers(tickers.filter((_, i) => i !== index));
      setWeights(weights.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      if (Math.abs(totalWeight - 1) > 0.01) {
        setError("Total weights must sum to 1.0");
        setLoading(false);
        return;
      }
      const req: MonteCarloRequest = {
        tickers: tickers.map(t => t.trim()).filter(Boolean),
        weights,
        start_date: startDate,
        end_date: endDate,
        initial_value: initialValue,
        n_simulations: nSimulations,
        n_days: nDays,
        benchmark: benchmark.trim() || undefined,
      };
      const res = await apiService.runMonteCarloSimulation(req);
      if (res.message.startsWith("Error")) {
        setError(res.message);
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for cone of possibility
  const coneData = result?.percentiles.p50?.map((median, i) => ({
    day: i,
    p10: result.percentiles.p10[i],
    p50: median,
    p90: result.percentiles.p90[i],
    mean: result.mean_path[i],
  })) || [];

  // Prepare normalized price chart data
  const priceChartData = result?.normalized_dates.map((date, i) => {
    const row: any = { date };
    Object.keys(result.normalized_prices).forEach(ticker => {
      row[ticker] = result.normalized_prices[ticker][i];
    });
    return row;
  }) || [];

  // Prepare correlation heatmap data
  const heatmapTickers = result ? Object.keys(result.correlation_matrix) : [];
  const heatmapData = heatmapTickers.map(rowTicker =>
    heatmapTickers.map(colTicker => result?.correlation_matrix[rowTicker][colTicker] ?? 0)
  );

  // Chart renderers
  const renderPriceChart = () => result && priceChartData.length > 0 && (
    <Card key="priceChart" className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          Historical Price Performance
        </CardTitle>
        <CardDescription>
          Normalized to $100 at start date. Shows how each stock performed over the period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={priceChartData}>
            <XAxis dataKey="date" minTickGap={20} />
            <YAxis tickFormatter={v => `$${Math.round(v)}`} />
            <Tooltip />
            {Object.keys(result.normalized_prices).map((ticker, idx) => (
              <Line
                key={ticker}
                type="monotone"
                dataKey={ticker}
                stroke={`hsl(${(idx * 40) % 360}, 70%, 50%)`}
                dot={false}
                name={ticker}
              />
            ))}
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderReturnDistributions = () => result && (
    <Card key="returnDistributions" className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100/50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
          Distribution of Daily Returns (Volatility)
        </CardTitle>
        <CardDescription>
          A wider spread means higher volatility and risk. This is what the simulation uses to generate random daily price moves.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(result.return_distributions).map(([ticker, returns]) => {
            // Histogram binning
            const min = Math.min(...returns);
            const max = Math.max(...returns);
            const bins = 40;
            const binWidth = (max - min) / bins;
            const histogram = Array.from({ length: bins }, (_, i) => ({
              bin: min + i * binWidth,
              count: 0,
            }));
            returns.forEach(v => {
              const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
              histogram[idx].count += 1;
            });
            // KDE
            const kdeData = kde(returns, binWidth * 1.5, 80);
            const histMax = Math.max(...histogram.map(h => h.count));
            const kdeLine = kdeData.x.map((x, i) => ({ x, y: Math.min(kdeData.y[i] * returns.length * binWidth, histMax) }));
            // Axis scaling: only use histogram max
            return (
              <div key={ticker} className="flex flex-col items-center w-full">
                <div className="font-semibold mb-2">{ticker} Daily Returns</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={histogram} margin={{ left: 20, right: 10, top: 10, bottom: 30 }}>
                    <XAxis
                      dataKey="bin"
                      type="number"
                      domain={[min, max]}
                      tickFormatter={v => v.toFixed(2)}
                      label={{ value: "Log Return", position: "bottom", offset: 0 }}
                    />
                    <YAxis
                      domain={[0, histMax * 1.1]}
                      label={{ value: "Count", angle: -90, position: "insideLeft", offset: 10 }}
                      allowDecimals={false}
                      tickFormatter={v => Math.round(v).toString()}
                    />
                    <Tooltip formatter={v => Math.round(Number(v))} />
                    <Bar dataKey="count" fill="#2563eb" radius={[2, 2, 0, 0]} />
                    {/* KDE overlay */}
                    <ReLine
                      data={kdeLine}
                      type="monotone"
                      dataKey="y"
                      dot={false}
                      stroke="#f59e42"
                      strokeWidth={2}
                      isAnimationActive={false}
                      xAxisId={0}
                      yAxisId={0}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderHeatmap = () => result && heatmapTickers.length > 0 && (
    <Card key="heatmap">
      <CardHeader>
        <CardTitle>Portfolio Correlation Heatmap</CardTitle>
        <CardDescription>
          Shows how stocks move together. 1.0 means perfect sync. High correlation reduces diversification benefits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-0 mx-auto rounded-2xl shadow-lg bg-white/80 backdrop-blur-md" style={{ minWidth: 380 }}>
            <thead>
              <tr>
                <th className="p-2"></th>
                {heatmapTickers.map(t => (
                  <th key={t} className="p-2 text-xs font-bold text-slate-700 text-center bg-slate-50 sticky top-0 z-10" style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapTickers.map((rowTicker, i) => (
                <tr key={rowTicker}>
                  <td className="p-2 text-xs font-bold text-slate-700 text-center bg-slate-50 sticky left-0 z-10" style={{ borderBottomLeftRadius: i === heatmapTickers.length - 1 ? 12 : 0 }}>{rowTicker}</td>
                  {heatmapTickers.map((colTicker, j) => {
                    const value = result.correlation_matrix[rowTicker][colTicker];
                    const isDiagonal = i === j;
                    return (
                      <td
                        key={colTicker}
                        title={`Corr(${rowTicker}, ${colTicker}) = ${value.toFixed(2)}`}
                        className={
                          `transition-all duration-200 p-2 text-xs text-center font-semibold select-none ` +
                          (isDiagonal ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-inner' : '')
                        }
                        style={{
                          background: isDiagonal
                            ? undefined
                            : getHeatmapColor(Math.abs(value)),
                          color: Math.abs(value) > 0.7 ? '#fff' : '#222',
                          borderRadius: isDiagonal ? 8 : 6,
                          border: '1px solid #f3f4f6',
                          boxShadow: isDiagonal ? '0 2px 8px 0 rgba(34,197,94,0.10)' : undefined,
                          outline: 'none',
                          transition: 'background 0.2s, color 0.2s',
                        }}
                      >
                        {value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderCone = () => result && (
    <Card key="cone" className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100/50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
          Cone of Possibility
        </CardTitle>
        <CardDescription>
          The shaded area shows the 10th to 90th percentile range of simulated portfolio values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={coneData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="day" tickFormatter={d => `Day ${d}`} />
            <YAxis tickFormatter={v => `$${Math.round(v).toLocaleString()}`} />
            <Tooltip formatter={v => `$${Math.round(Number(v)).toLocaleString()}`} />
            <Area type="monotone" dataKey="p10" stroke="#f87171" fillOpacity={0} name="10th Percentile" />
            <Area type="monotone" dataKey="p90" stroke="#34d399" fillOpacity={0} name="90th Percentile" />
            <Area type="monotone" dataKey="p50" stroke="#2563eb" fill="#60a5fa" fillOpacity={0.2} name="Median" />
            <Area type="monotone" dataKey="mean" stroke="#a21caf" fillOpacity={0} name="Mean" />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderFinalDist = () => result && !error && (
    <Card key="finalDist">
      <CardHeader>
        <CardTitle>Final Portfolio Value Distribution</CardTitle>
        <CardDescription>
          Distribution of all simulated final portfolio values after {nDays} days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="md:w-48 w-full flex-shrink-0">
            <FinalDistLegend />
          </div>
          <div className="flex-1">
            {/* Histogram binning */}
            {(() => {
              const values = result.final_distribution;
              const bins = 60;
              const min = Math.min(...values);
              const max = Math.max(...values);
              const binWidth = (max - min) / bins;
              const histogram = Array.from({ length: bins }, (_, i) => ({
                bin: min + i * binWidth,
                count: 0,
              }));
              values.forEach(v => {
                const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
                histogram[idx].count += 1;
              });
              // KDE
              const kdeData = kde(values, binWidth * 1.5, 120);
              // Scale KDE to histogram area
              const totalCount = values.length;
              const kdeLine = kdeData.x.map((x, i) => ({
                x,
                y: kdeData.y[i] * totalCount * binWidth,
              }));
              const yMax = Math.max(...histogram.map(h => h.count), ...kdeLine.map(k => k.y));
              return (
                <div className="bg-white rounded-lg shadow-sm border p-2 md:p-4">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={histogram} margin={{ left: 10, right: 30, top: 20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="bin"
                        type="number"
                        domain={[min, max]}
                        tickFormatter={v => `$${Math.round(v).toLocaleString()}`}
                        label={{ value: "Final Portfolio Value ($)", position: "bottom", offset: 0 }}
                      />
                      <YAxis
                        domain={[0, yMax * 1.1]}
                        allowDecimals={false}
                        tickFormatter={v => Math.round(v).toString()}
                        label={{
                          value: "Number of Simulations",
                          angle: -90,
                          position: "left",
                          offset: 1,
                          style: {
                            fontSize: 18,
                            fontWeight: 400,
                            fill: '#6b7280',
                            textAnchor: 'middle',
                          }
                        }}
                      />
                      <Tooltip formatter={v => Math.round(Number(v))} labelFormatter={v => `$${Math.round(Number(v)).toLocaleString()}`} />
                      <Bar
                        dataKey="count"
                        fill="#60a5fa"
                        stroke="#2563eb"
                        strokeWidth={1.5}
                        opacity={0.92}
                        radius={[8, 8, 0, 0]}
                        barSize={16}
                        style={{ filter: 'drop-shadow(0 2px 6px rgba(59,130,246,0.08))' }}
                      />
                      {/* KDE overlay */}
                      <ReLine
                        data={kdeLine}
                        type="monotone"
                        dataKey="y"
                        dot={false}
                        stroke="#f59e42"
                        strokeWidth={3}
                        isAnimationActive={false}
                        xAxisId={0}
                        yAxisId={0}
                        name="KDE"
                      />
                      {/* VaR (5%) line */}
                      <ReferenceLine
                        x={result.var_5}
                        stroke="#ef4444"
                        strokeDasharray="6 3"
                        strokeWidth={2}
                        label={<RefLineLabel value={`VaR (5%): $${result.var_5.toLocaleString(undefined, { maximumFractionDigits: 1 })}`} color="#ef4444" />}
                      />
                      {/* Mean line */}
                      <ReferenceLine
                        x={result.mean_final}
                        stroke="#22c55e"
                        strokeDasharray="6 3"
                        strokeWidth={2}
                        label={<RefLineLabel value={`Mean: $${result.mean_final.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} color="#22c55e" />}
                      />
                      {/* Initial investment line */}
                      <ReferenceLine
                        x={initialValue}
                        stroke="#222"
                        strokeWidth={2}
                        label={<RefLineLabel value={`Initial: $${initialValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} color="#222" />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Mean Final Value:</strong> ${result.mean_final.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div>
            <strong>Value at Risk (5%):</strong> ${result.var_5.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div>
            <strong>Probability of Loss:</strong> {(result.probability_of_loss * 100).toFixed(2)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // DnD setup
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setCardOrder((items) => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
    }
  };

  // Map keys to renderers
  const cardMap: Record<string, () => React.ReactNode> = {
    priceChart: renderPriceChart,
    returnDistributions: renderReturnDistributions,
    heatmap: renderHeatmap,
    cone: renderCone,
    finalDist: renderFinalDist,
  };

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-white/95 to-transparent pb-2 mb-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Monte Carlo Simulator</h2>
        <p className="text-base md:text-lg text-slate-600 mb-2">Drag and reorder the charts below to customize your view.</p>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Monte Carlo Simulation</CardTitle>
          <CardDescription>
            Forecast your portfolio's future value with thousands of simulations using live market data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tickers & Weights</Label>
                <div className="space-y-2">
                  {tickers.map((ticker, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={ticker}
                        onChange={e => handleTickerChange(i, e.target.value)}
                        placeholder="Ticker"
                        className="w-24"
                        required
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={weights[i]}
                        onChange={e => handleWeightChange(i, e.target.value)}
                        placeholder="Weight"
                        className="w-20"
                        required
                      />
                      <Button type="button" variant="ghost" onClick={() => handleRemoveTicker(i)} disabled={tickers.length === 1}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddTicker} size="sm">
                    Add Ticker
                  </Button>
                </div>
                <div className="text-xs text-slate-500 mt-1">Weights must sum to 1.0</div>
              </div>
              <div className="space-y-2">
                <Label>Benchmark</Label>
                <Input value={benchmark} onChange={e => setBenchmark(e.target.value.toUpperCase())} placeholder="Benchmark (e.g. SPY)" />
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <Label>Initial Portfolio Value</Label>
                <Input type="number" value={initialValue} onChange={e => setInitialValue(Number(e.target.value))} min={1} />
                <Label>Simulations</Label>
                <Input type="number" value={nSimulations} onChange={e => setNSimulations(Number(e.target.value))} min={100} max={50000} />
                <Label>Days</Label>
                <Input type="number" value={nDays} onChange={e => setNDays(Number(e.target.value))} min={10} max={1000} />
              </div>
            </div>
            <Button type="submit" className="mt-4" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Run Simulation
            </Button>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
          {cardOrder.map((key) => (
            <DraggableCard key={key} id={key}>
              {cardMap[key]()}
            </DraggableCard>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}; 