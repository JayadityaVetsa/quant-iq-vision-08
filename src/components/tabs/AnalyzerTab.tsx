
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { apiService, BacktestRequest } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Legend, Label } from "recharts";

const DEFAULT_TICKERS = ["AAPL", "TSLA", "NVDA", "ANET"];
const DEFAULT_WEIGHTS = [0.25, 0.25, 0.25, 0.25];
const DEFAULT_BENCHMARK = "SPY";
const DEFAULT_START_DATE = "2021-01-01";
const DEFAULT_END_DATE = "2024-01-01";

// Helper to bin data for histogram
function makeHistogramData(values: number[], binCount = 30) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount;
  const bins = Array(binCount).fill(0);
  values.forEach((v) => {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= binCount) idx = binCount - 1;
    bins[idx]++;
  });
  return bins.map((count, i) => ({
    bin: min + i * binWidth,
    count,
    binLabel: `${(min + i * binWidth).toFixed(2)}`
  }));
}

// Custom Legend Component
const CustomLegend = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <div style={{ width: "16px", height: "12px", backgroundColor: "#60a5fa", opacity: 0.6, border: "1px solid #222" }} />
      <span>Portfolio</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <div style={{ width: "16px", height: "2px", backgroundColor: "#1e40af", borderTop: "2px dashed #1e40af" }} />
      <span>Portfolio Mean</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <div style={{ width: "16px", height: "2px", backgroundColor: "#000", borderTop: "2px dotted #000" }} />
      <span>Benchmark (SPY)</span>
    </div>
  </div>
);

// Scenario Histogram Component
const ScenarioHistogram = ({ 
  eventLabel, 
  returns, 
  portfolioMean, 
  benchmark 
}: {
  eventLabel: string;
  returns: number[];
  portfolioMean: number;
  benchmark: number;
}) => {
  // Create histogram data with better binning
  const numBins = 20;
  const minReturn = Math.min(...returns);
  const maxReturn = Math.max(...returns);
  
  // Handle extreme outliers by using percentiles for better scaling
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const p5 = sortedReturns[Math.floor(sortedReturns.length * 0.05)];
  const p95 = sortedReturns[Math.floor(sortedReturns.length * 0.95)];
  
  // Use a range that captures most of the data but isn't dominated by extreme outliers
  const effectiveMin = Math.max(minReturn, p5 - (p95 - p5) * 0.5);
  const effectiveMax = Math.min(maxReturn, p95 + (p95 - p5) * 0.5);
  const range = effectiveMax - effectiveMin;
  const binSize = range / numBins;
  
  // Create bins
  const bins = Array.from({ length: numBins }, (_, i) => {
    const binStart = effectiveMin + i * binSize;
    const binEnd = binStart + binSize;
    const binCenter = (binStart + binEnd) / 2;
    return {
      binLabel: (binCenter * 100).toFixed(1) + "%",
      binValue: binCenter,
      count: 0,
      binStart,
      binEnd
    };
  });
  
  // Fill bins with data
  returns.forEach(ret => {
    if (ret >= effectiveMin && ret <= effectiveMax) {
      const binIndex = Math.min(Math.floor((ret - effectiveMin) / binSize), numBins - 1);
      bins[binIndex].count++;
    }
  });
  
  const histData = bins.filter(bin => bin.count > 0);
  
  // Find closest bins for portfolio mean and benchmark
  const findClosestBin = (value: number) => {
    let closestBin = histData[0];
    let minDistance = Math.abs(value - closestBin.binValue);
    
    histData.forEach(bin => {
      const distance = Math.abs(value - bin.binValue);
      if (distance < minDistance) {
        minDistance = distance;
        closestBin = bin;
      }
    });
    
    return closestBin.binLabel;
  };
  
  const portfolioMeanBin = findClosestBin(portfolioMean);
  const benchmarkBin = findClosestBin(benchmark);
  
  // Determine label positions to avoid overlap
  const meanPercent = portfolioMean * 100;
  const benchPercent = benchmark * 100;
  const diff = Math.abs(meanPercent - benchPercent);
  
  // If lines are very close (within 2%), offset the labels
  const portfolioLabelOffset = diff < 2 ? -10 : 0;
  const benchmarkLabelOffset = diff < 2 ? 10 : 0;
  
  const title = eventLabel.replace("Stress Test: ", "");
  
  return (
    <div>
      <div style={{ textAlign: "center", fontWeight: 500, fontSize: 18, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ textAlign: "center", fontSize: 14, color: "#666", marginBottom: 16 }}>
        Portfolio Mean: {meanPercent.toFixed(1)}% | Benchmark: {benchPercent.toFixed(1)}%
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={histData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <XAxis
            dataKey="binLabel"
            tick={{ fontSize: 12 }}
            interval={Math.max(1, Math.floor(histData.length / 8))}
            label={<Label value="Total Return Over Scenario" offset={-10} position="insideBottom" />}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={<Label value="Count" angle={-90} position="insideLeft" />}
          />
          <Tooltip formatter={(value: number) => value} labelFormatter={(label) => `Return: ${label}`}/>
          <Bar
            dataKey="count"
            name="Portfolio"
            fill="#60a5fa"
            stroke="#222"
            fillOpacity={0.6}
            isAnimationActive={false}
          />
          {/* Portfolio Mean Line */}
          <ReferenceLine
            x={portfolioMeanBin}
            stroke="#1e40af"
            strokeDasharray="8 4"
            strokeWidth={2.5}
          />
          {/* Benchmark Line */}
          {typeof benchmark === "number" && (
            <ReferenceLine
              x={benchmarkBin}
              stroke="#000"
              strokeDasharray="4 2"
              strokeWidth={2}
            />
          )}
          <Legend content={<CustomLegend />} verticalAlign="bottom" align="center" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AnalyzerTab = () => {
  const [tickersInput, setTickersInput] = useState(DEFAULT_TICKERS.join(", "));
  const [weightsInput, setWeightsInput] = useState(DEFAULT_WEIGHTS.join(", "));
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleRunBacktest = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const tickers = tickersInput
        .split(/[,\s]+/)
        .map((t) => t.trim().toUpperCase())
        .filter((t) => t);
      const weights = weightsInput
        .split(/[,\s]+/)
        .map((w) => parseFloat(w.trim()))
        .filter((w) => !isNaN(w));
      if (tickers.length !== weights.length || tickers.length === 0) {
        setError("Number of tickers and weights must match and be nonzero.");
        setLoading(false);
        return;
      }
      const sum = weights.reduce((a, b) => a + b, 0);
      const normWeights = weights.map((w) => w / sum);
      const req: BacktestRequest = {
        tickers,
        weights: normWeights,
        start_date: startDate,
        end_date: endDate,
        benchmark: DEFAULT_BENCHMARK,
      };
      // Assume backend returns scenarioResults and scenarioDistributions
      const res = await apiService.runBacktest(req);
      setResult(res);
    } catch (e: any) {
      setError(e?.message || "Error running backtest");
    } finally {
      setLoading(false);
    }
  };

  // Render scenario stress test table and histograms
  const renderScenarioStressTest = () => {
    if (!result) return null;
    return (
      <div className="space-y-8 mt-8">
        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Stress Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">Event</th>
                    <th className="px-2 py-1 border">Scenario Length (days)</th>
                    <th className="px-2 py-1 border">Stocks Used</th>
                    <th className="px-2 py-1 border">Portfolio Mean Return</th>
                    <th className="px-2 py-1 border">Benchmark Return</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scenarioResults?.map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="px-2 py-1 border">{row.Event}</td>
                      <td className="px-2 py-1 border">{row["Scenario Length (days)"]}</td>
                      <td className="px-2 py-1 border">{row["Stocks Used"]}</td>
                      <td className="px-2 py-1 border">{(row["Portfolio Mean Return"] * 100).toFixed(2)}%</td>
                      <td className="px-2 py-1 border">{(row["Benchmark Return"] * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* Histograms for each scenario */}
        <div className="space-y-12">
          {result.scenarioDistributions?.map((dist: any, i: number) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{dist.eventLabel}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScenarioHistogram
                  eventLabel={dist.eventLabel}
                  returns={dist.returns}
                  portfolioMean={dist.portfolioMean}
                  benchmark={dist.benchmark}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Stock Analyzer Backtester</h2>
        <p className="text-slate-600 mb-4">Enter your stocks and weights, then run a scenario stress test backtest.</p>
      </div>
      <Card className="p-6 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Backtest Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Stocks (comma or space separated):</label>
            <Input
              value={tickersInput}
              onChange={(e) => setTickersInput(e.target.value)}
              placeholder="AAPL, TSLA, NVDA, ANET"
              className="mb-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Weights (comma or space separated, will be normalized):</label>
            <Input
              value={weightsInput}
              onChange={(e) => setWeightsInput(e.target.value)}
              placeholder="0.25, 0.25, 0.25, 0.25"
              className="mb-2"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Start Date:</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">End Date:</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleRunBacktest} className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Run Backtest
          </Button>
          {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
        </CardContent>
      </Card>
      {renderScenarioStressTest()}
    </div>
  );
};
