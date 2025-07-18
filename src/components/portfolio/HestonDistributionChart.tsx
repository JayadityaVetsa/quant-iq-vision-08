import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Line as ReLine, ReferenceLine } from "recharts";
import { HestonResponse } from "@/services/api";

interface HestonDistributionChartProps {
  result: HestonResponse;
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

// Reference line label component
const RefLineLabel = ({ value, color }: { value: string; color: string }) => (
  <text x={0} y={0} dx={5} dy={-5} textAnchor="start" fill={color} fontSize="12" fontWeight="bold">
    {value}
  </text>
);

// Legend component for the chart
const FinalDistLegend = () => (
  <div className="space-y-2">
    <h4 className="font-semibold text-sm text-gray-800 mb-3">Risk Metrics</h4>
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-black"></div>
        <span>Initial Value</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-red-500 border-dashed border-t"></div>
        <span>VaR (90%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-purple-500 border-dashed border-t"></div>
        <span>CVaR</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-blue-500 border-dashed border-t"></div>
        <span>Mean Final Value</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-yellow-500 border-dashed border-t"></div>
        <span>5% Percentile</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-0.5 bg-green-500 border-dashed border-t"></div>
        <span>95% Percentile</span>
      </div>
    </div>
  </div>
);

export const HestonDistributionChart: React.FC<HestonDistributionChartProps> = ({ result }) => {
  // Histogram binning
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

  // KDE for smooth overlay
  const kdeData = kde(values, binWidth * 1.5, 120);
  // Scale KDE to histogram area
  const totalCount = values.length;
  const kdeLine = kdeData.x.map((x, i) => ({
    x,
    y: kdeData.y[i] * totalCount * binWidth,
  }));

  const yMax = Math.max(...histogram.map(h => h.count), ...kdeLine.map(k => k.y));

  // Calculate percentiles for reference lines
  const sortedValues = [...values].sort((a, b) => a - b);
  const p5 = sortedValues[Math.floor(sortedValues.length * 0.05)];
  const p95 = sortedValues[Math.floor(sortedValues.length * 0.95)];

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100/50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          Simulated Final Portfolio Value Distribution ({result.initial_value > 0 ? Math.round(values.length / 1000) : 0}k Paths)
        </CardTitle>
        <CardDescription>
          Distribution of final portfolio values from Heston stochastic volatility simulation
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="md:w-48 w-full flex-shrink-0">
            <FinalDistLegend />
          </div>
          <div className="flex-1">
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
                      value: "Frequency",
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
                  <Tooltip 
                    formatter={v => Math.round(Number(v))} 
                    labelFormatter={v => `$${Math.round(Number(v)).toLocaleString()}`} 
                  />
                  <Bar
                    dataKey="count"
                    fill="#a78bfa"
                    stroke="#7c3aed"
                    strokeWidth={1.5}
                    opacity={0.92}
                    radius={[8, 8, 0, 0]}
                    barSize={16}
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(124,58,237,0.08))' }}
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
                  
                  {/* Initial investment line */}
                  <ReferenceLine
                    x={result.initial_value}
                    stroke="#222"
                    strokeWidth={2}
                    label={<RefLineLabel value={`Initial Value`} color="#222" />}
                  />
                  
                  {/* VaR line */}
                  <ReferenceLine
                    x={result.var_value}
                    stroke="#ef4444"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={<RefLineLabel value={`90% VaR`} color="#ef4444" />}
                  />
                  
                  {/* CVaR line */}
                  <ReferenceLine
                    x={result.cvar_value}
                    stroke="#a855f7"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={<RefLineLabel value={`CVaR`} color="#a855f7" />}
                  />
                  
                  {/* Mean line */}
                  <ReferenceLine
                    x={result.mean_value}
                    stroke="#3b82f6"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={<RefLineLabel value={`Mean Final Value`} color="#3b82f6" />}
                  />
                  
                  {/* 5% Percentile line */}
                  <ReferenceLine
                    x={p5}
                    stroke="#f59e0b"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={<RefLineLabel value={`5% Percentile`} color="#f59e0b" />}
                  />
                  
                  {/* 95% Percentile line */}
                  <ReferenceLine
                    x={p95}
                    stroke="#22c55e"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={<RefLineLabel value={`95% Percentile`} color="#22c55e" />}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 