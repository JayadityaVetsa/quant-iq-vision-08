import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService, HestonRequest, HestonResponse } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { HestonDistributionChart } from "@/components/portfolio/HestonDistributionChart";
import { HestonPathsChart } from "@/components/portfolio/HestonPathsChart";

const DEFAULT_TICKERS = ["AAPL", "TSLA", "NVDA", "ANET", "MSFT", "GOOG", "WMT", "V", "JPM", "XOM"];
const DEFAULT_WEIGHTS = Array(10).fill(0.1);

export const HestonSimulatorTab: React.FC = () => {
  const [tickers, setTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [weights, setWeights] = useState<number[]>(DEFAULT_WEIGHTS);
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [initialValue, setInitialValue] = useState(100000);
  const [nPaths, setNPaths] = useState(10000);
  const [nDays, setNDays] = useState(252);
  const [confidenceLevel, setConfidenceLevel] = useState(0.90);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HestonResponse | null>(null);

  const handleTickerChange = (index: number, value: string) => {
    const newTickers = [...tickers];
    newTickers[index] = value;
    setTickers(newTickers);
    
    // Adjust weights array length
    if (newTickers.length > weights.length) {
      const newWeights = [...weights];
      while (newWeights.length < newTickers.length) {
        newWeights.push(1 / newTickers.length);
      }
      setWeights(newWeights);
    } else if (newTickers.length < weights.length) {
      setWeights(weights.slice(0, newTickers.length));
    }
  };

  const handleWeightChange = (index: number, value: string) => {
    const newWeights = [...weights];
    newWeights[index] = parseFloat(value) || 0;
    setWeights(newWeights);
  };

  const addTicker = () => {
    setTickers([...tickers, ""]);
    setWeights([...weights, 1 / (tickers.length + 1)]);
  };

  const removeTicker = (index: number) => {
    if (tickers.length > 1) {
      const newTickers = tickers.filter((_, i) => i !== index);
      const newWeights = weights.filter((_, i) => i !== index);
      setTickers(newTickers);
      setWeights(newWeights);
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
      
      const req: HestonRequest = {
        tickers: tickers.map(t => t.trim()).filter(Boolean),
        weights,
        start_date: startDate,
        end_date: endDate,
        initial_value: initialValue,
        n_paths: nPaths,
        n_days: nDays,
        confidence_level: confidenceLevel,
      };
      
      const res = await apiService.runHestonSimulation(req);
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Heston Stochastic Volatility Simulator</h2>
        <p className="text-lg text-slate-600">
          Advanced portfolio risk analysis using the Heston model with stochastic volatility
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Configuration</CardTitle>
            <CardDescription>
              Set up your portfolio with tickers and weights for Heston simulation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tickers and Weights */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Stocks & Weights</Label>
              {tickers.map((ticker, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <Input
                    placeholder="Ticker (e.g., AAPL)"
                    value={ticker}
                    onChange={(e) => handleTickerChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Weight"
                    value={weights[index] || 0}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                    className="w-24"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTicker(index)}
                    disabled={tickers.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTicker}>
                Add Stock
              </Button>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Simulation Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="initialValue">Initial Portfolio Value ($)</Label>
                <Input
                  id="initialValue"
                  type="number"
                  value={initialValue}
                  onChange={(e) => setInitialValue(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="nPaths">Number of Paths</Label>
                <Input
                  id="nPaths"
                  type="number"
                  value={nPaths}
                  onChange={(e) => setNPaths(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="nDays">Days Forward</Label>
                <Input
                  id="nDays"
                  type="number"
                  value={nDays}
                  onChange={(e) => setNDays(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="confidenceLevel">Confidence Level</Label>
                <Input
                  id="confidenceLevel"
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="0.99"
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(parseFloat(e.target.value) || 0.9)}
                />
              </div>
            </div>

            {/* Note: Heston Model Parameters are now auto-calibrated */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Model Configuration</Label>
              <p className="text-sm text-slate-600">
                Heston model parameters (κ, θ, ξ, ρ) are automatically calibrated for each stock using historical data.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Heston Simulation
          </Button>
        </div>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Heston Simulation Results</CardTitle>
            <CardDescription>
              Value at Risk (VaR) and Conditional VaR (CVaR) analysis using the Heston model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-1">VaR ({Math.round(result.confidence_level * 100)}%)</h4>
                <p className="text-2xl font-bold text-red-600">${result.var_dollar.toLocaleString()}</p>
                <p className="text-sm text-red-700">{result.var_percent.toFixed(2)}% of portfolio</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-1">CVaR</h4>
                <p className="text-2xl font-bold text-purple-600">${result.cvar_dollar.toLocaleString()}</p>
                <p className="text-sm text-purple-700">Expected loss in worst cases</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-1">Mean Value</h4>
                <p className="text-2xl font-bold text-blue-600">${result.mean_value.toLocaleString()}</p>
                <p className="text-sm text-blue-700">Expected final portfolio value</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-1">Confidence Interval</h4>
                <p className="text-lg font-bold text-green-600">
                  ${result.lower_bound.toLocaleString()} - ${result.upper_bound.toLocaleString()}
                </p>
                <p className="text-sm text-green-700">90% confidence range</p>
              </div>
            </div>
            
            {/* Model Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Model Information</h4>
              <p className="text-sm text-gray-600">
                Heston model parameters (κ, θ, ξ, ρ) were automatically calibrated for each stock using historical data.
                The model captures stochastic volatility to provide more realistic risk estimates.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && result.portfolio_paths && result.portfolio_paths.length > 0 && (
        <HestonPathsChart result={result} nDays={nDays} />
      )}

      {result && result.final_distribution && result.final_distribution.length > 0 && (
        <HestonDistributionChart result={result} />
      )}
    </div>
  );
};
