import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, RefreshCw } from "lucide-react";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { apiService, BlackLittermanRequest, BlackLittermanResponse } from "@/services/api";
import { BlackLittermanCharts } from "@/components/portfolio/BlackLittermanCharts";

interface BlackLittermanTabProps {
  onCreatePortfolio: () => void;
}

export const BlackLittermanTab = ({ onCreatePortfolio }: BlackLittermanTabProps) => {
  // Black-Litterman specific state
  const [tickers, setTickers] = useState<string>('AAPL,MSFT,GOOGL');
  const [views, setViews] = useState<Record<string, string>>({});
  const [confidences, setConfidences] = useState<Record<string, string>>({});
  const [period, setPeriod] = useState<string>('2y');
  const [tau, setTau] = useState<string>('0.05');
  const [rfRate, setRfRate] = useState<string>('0.045');
  const [includeDividends, setIncludeDividends] = useState<boolean>(true);
  const [blLoading, setBlLoading] = useState<boolean>(false);
  const [blResults, setBlResults] = useState<BlackLittermanResponse | null>(null);
  const [blError, setBlError] = useState<string>('');

  const tickerList = tickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t.length > 0);

  const handleBlackLittermanOptimize = async () => {
    setBlLoading(true);
    setBlError('');
    setBlResults(null);

    try {
      if (tickerList.length === 0) {
        throw new Error('Please provide at least one ticker symbol');
      }

      const requestData: BlackLittermanRequest = {
        tickers: tickerList,
        views: Object.fromEntries(
          Object.entries(views).map(([ticker, value]) => [ticker, parseFloat(value) || 0])
        ),
        confidences: Object.fromEntries(
          Object.entries(confidences).map(([ticker, value]) => [ticker, parseFloat(value) || 0.5])
        ),
        period,
        tau: parseFloat(tau) || 0.05,
        rf_rate: parseFloat(rfRate) || 0.045,
        include_dividends: includeDividends,
      };

      const response = await apiService.runBlackLittermanOptimization(requestData);
      setBlResults(response);
    } catch (err) {
      setBlError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setBlLoading(false);
    }
  };

  const updateViewsAndConfidences = (newTickers: string[]) => {
    const newViews: Record<string, string> = {};
    const newConfidences: Record<string, string> = {};

    newTickers.forEach(ticker => {
      newViews[ticker] = views[ticker] || '0.12';
      newConfidences[ticker] = confidences[ticker] || '0.7';
    });

    setViews(newViews);
    setConfidences(newConfidences);
  };

  React.useEffect(() => {
    updateViewsAndConfidences(tickerList);
  }, [tickers]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Black-Litterman Optimization</h2>
        <p className="text-slate-600">Advanced portfolio optimization incorporating your market views and confidence levels</p>
      </div>

      {blResults ? (
        // Black-Litterman Results Display
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Black-Litterman Optimization Results</h3>
              <p className="text-slate-600">{blResults.message}</p>
            </div>
            <Button 
              onClick={() => setBlResults(null)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Optimization</span>
            </Button>
          </div>

          <BlackLittermanCharts 
            results={blResults}
            userViews={Object.fromEntries(
              Object.entries(views).map(([ticker, value]) => [ticker, parseFloat(value) || 0])
            )}
            userConfidences={Object.fromEntries(
              Object.entries(confidences).map(([ticker, value]) => [ticker, parseFloat(value) || 0.5])
            )}
          />
        </div>
      ) : (
        // Black-Litterman Input Form
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Brain className="h-6 w-6" />
              Black-Litterman Optimization
            </h3>
            <p className="text-gray-600">
              Advanced portfolio optimization incorporating your market views and confidence levels
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Portfolio Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tickers">Stock Tickers (comma-separated)</Label>
                <Input
                  id="tickers"
                  value={tickers}
                  onChange={(e) => setTickers(e.target.value)}
                  placeholder="AAPL,MSFT,GOOGL,TSLA"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current tickers: {tickerList.map(t => (
                    <Badge key={t} variant="secondary" className="mr-1">{t}</Badge>
                  ))}
                </p>
              </div>

              {tickerList.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Expected Returns & Confidence Levels</Label>
                  <div className="grid gap-3">
                    {tickerList.map(ticker => (
                      <div key={ticker} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg">
                        <div className="flex items-center">
                          <Badge variant="outline" className="font-semibold">{ticker}</Badge>
                        </div>
                        <div>
                          <Label htmlFor={`view-${ticker}`} className="text-sm">Expected Return</Label>
                          <Input
                            id={`view-${ticker}`}
                            type="number"
                            step="0.01"
                            value={views[ticker] || ''}
                            onChange={(e) => setViews(prev => ({ ...prev, [ticker]: e.target.value }))}
                            placeholder="0.12"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500">Annual return (e.g., 0.12 = 12%)</p>
                        </div>
                        <div>
                          <Label htmlFor={`conf-${ticker}`} className="text-sm">Confidence</Label>
                          <Input
                            id={`conf-${ticker}`}
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="1.0"
                            value={confidences[ticker] || ''}
                            onChange={(e) => setConfidences(prev => ({ ...prev, [ticker]: e.target.value }))}
                            placeholder="0.7"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500">0.1 (low) to 1.0 (high)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <Label htmlFor="period">Data Period</Label>
                  <select
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="1y">1 Year</option>
                    <option value="2y">2 Years</option>
                    <option value="3y">3 Years</option>
                    <option value="5y">5 Years</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="tau">Tau (Uncertainty)</Label>
                  <Input
                    id="tau"
                    type="number"
                    step="0.01"
                    value={tau}
                    onChange={(e) => setTau(e.target.value)}
                    placeholder="0.05"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rfRate">Risk-Free Rate</Label>
                  <Input
                    id="rfRate"
                    type="number"
                    step="0.001"
                    value={rfRate}
                    onChange={(e) => setRfRate(e.target.value)}
                    placeholder="0.045"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="includeDividends"
                    checked={includeDividends}
                    onChange={(e) => setIncludeDividends(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="includeDividends" className="text-sm">Include Dividends</Label>
                </div>
              </div>

              {blError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {blError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBlackLittermanOptimize}
                disabled={blLoading || tickerList.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {blLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing Portfolio...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Optimize with Black-Litterman
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 