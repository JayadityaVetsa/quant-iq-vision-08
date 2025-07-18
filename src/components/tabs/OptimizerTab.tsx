
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Plus, RefreshCw, Brain } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { PortfolioResults } from "@/components/portfolio/PortfolioResults";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { apiService, BlackLittermanRequest, BlackLittermanResponse, EFTRequest, EFTResponse } from "@/services/api";
import { BlackLittermanCharts } from "@/components/portfolio/BlackLittermanCharts";
import { EfficientFrontierChart } from "@/components/portfolio/EfficientFrontierChart";
import { MetricsTable } from "@/components/portfolio/MetricsTable";
import { WeightsPieChart } from "@/components/portfolio/WeightsPieChart";
import { RiskGauge } from "@/components/portfolio/RiskGauge";
import { ComparisonCharts } from "@/components/portfolio/ComparisonCharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface OptimizerTabProps {
  onCreatePortfolio: () => void;
}

export const OptimizerTab = ({ onCreatePortfolio }: OptimizerTabProps) => {
  const { portfolioData, optimizationResults, clearResults } = usePortfolio();
  
  // EF specific state - using EFT backend
  const [mptTickers, setMptTickers] = useState<string>('AAPL,MSFT,GOOGL,NVDA');
  const [mptWeights, setMptWeights] = useState<string>('25,25,25,25');
  const [mptLoading, setMptLoading] = useState<boolean>(false);
  const [mptResults, setMptResults] = useState<EFTResponse | null>(null);
  const [mptError, setMptError] = useState<string>('');

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

  const mptTickerList = mptTickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t.length > 0);
  const mptWeightList = mptWeights.split(',').map(w => parseFloat(w.trim()) / 100).filter(w => !isNaN(w));
  const tickerList = tickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t.length > 0);

  const handleMptOptimize = async () => {
    setMptLoading(true);
    setMptError('');
    setMptResults(null);

    try {
      if (mptTickerList.length === 0) {
        throw new Error('Please provide at least one ticker symbol');
      }

      // Normalize weights if they don't sum to 1 or if count doesn't match tickers
      let normalizedWeights = [...mptWeightList];
      if (normalizedWeights.length !== mptTickerList.length) {
        // Use equal weights if counts don't match
        normalizedWeights = Array(mptTickerList.length).fill(1 / mptTickerList.length);
      } else {
        // Normalize weights to sum to 1
        const sum = normalizedWeights.reduce((a, b) => a + b, 0);
        if (sum > 0) {
          normalizedWeights = normalizedWeights.map(w => w / sum);
        } else {
          normalizedWeights = Array(mptTickerList.length).fill(1 / mptTickerList.length);
        }
      }

      const requestData: EFTRequest = {
        tickers: mptTickerList,
        weights: normalizedWeights,
        start_date: "2020-01-01",
        end_date: new Date().toISOString().split('T')[0],
        risk_free_rate: 0.02,
        weight_bounds: [0.01, 0.30],
        n_simulations: 10000,
        n_frontier_points: 100
      };

      const response = await apiService.runEFTOptimization(requestData);
      setMptResults(response);
    } catch (err) {
      setMptError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setMptLoading(false);
    }
  };

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

  // Helper function to convert EFT results to format expected by portfolio components
  const transformEFTResults = (results: EFTResponse) => {
    const currentPortfolio = {
      return: results.portfolio_metrics.cagr || 0,
      volatility: results.portfolio_metrics.volatility || 0,
      sharpe: results.portfolio_metrics.sharpe || 0,
      sortino: results.portfolio_metrics.sortino || 0,
      maxDrawdown: results.portfolio_metrics.max_drawdown || 0,
      riskIndex: results.portfolio_metrics.risk_index || 0,
      weights: results.composition?.current_weights || {}
    };

    const maxSharpePortfolio = {
      return: results.portfolio_metrics.max_sharpe_return || 0,
      volatility: results.portfolio_metrics.max_sharpe_volatility || 0,
      sharpe: results.portfolio_metrics.max_sharpe_sharpe || 0,
      sortino: results.portfolio_metrics.max_sharpe_sortino || 0,
      maxDrawdown: results.portfolio_metrics.max_sharpe_max_drawdown || 0,
      riskIndex: results.portfolio_metrics.max_sharpe_risk_index || 0,
      weights: results.composition?.max_sharpe_weights || {}
    };

    const minVolatilityPortfolio = {
      return: results.portfolio_metrics.min_vol_return || 0,
      volatility: results.portfolio_metrics.min_vol_volatility || 0,
      sharpe: results.portfolio_metrics.min_vol_sharpe || 0,
      sortino: results.portfolio_metrics.min_vol_sortino || 0,
      maxDrawdown: results.portfolio_metrics.min_vol_max_drawdown || 0,
      riskIndex: results.portfolio_metrics.min_vol_risk_index || 0,
      weights: results.composition?.min_volatility_weights || {}
    };

    // Transform benchmark results to match PortfolioMetrics type
    const benchmarkResults: Record<string, any> = {};
    if (results.benchmarks) {
      console.log('[FRONTEND DEBUG] Raw benchmarks from backend:', results.benchmarks);
      console.log('[FRONTEND DEBUG] Benchmarks keys:', Object.keys(results.benchmarks));
      Object.entries(results.benchmarks).forEach(([name, metrics]) => {
        const metricData = metrics as any;
        console.log(`[FRONTEND DEBUG] Processing benchmark ${name}:`, metricData);
        console.log(`[FRONTEND DEBUG] ${name} - cagr:`, metricData.cagr);
        console.log(`[FRONTEND DEBUG] ${name} - return:`, metricData.return);
        console.log(`[FRONTEND DEBUG] ${name} - volatility:`, metricData.volatility);
        console.log(`[FRONTEND DEBUG] ${name} - sharpe:`, metricData.sharpe);
        
        benchmarkResults[name] = {
          return: metricData.cagr || metricData.return || 0,
          volatility: metricData.volatility || 0,
          sharpe: metricData.sharpe || 0,
          sortino: metricData.sortino || 0,
          maxDrawdown: metricData.max_drawdown || metricData.maxDrawdown || 0,
          riskIndex: metricData.risk_index || metricData.riskIndex || 0,
          weights: metricData.weights || {}
        };
        console.log(`[FRONTEND DEBUG] Transformed benchmark ${name}:`, benchmarkResults[name]);
      });
    } else {
      console.log('[FRONTEND DEBUG] No benchmarks found in results');
    }

    return {
      currentPortfolio,
      maxSharpePortfolio,
      minVolatilityPortfolio,
      benchmarkResults,
      efficientFrontier: results.efficient_frontier || [],
      monteCarloSimulation: {
        returns: results.monte_carlo_simulation?.returns || [],
        volatilities: results.monte_carlo_simulation?.volatilities || [],
        sharpe_ratios: results.monte_carlo_simulation?.sharpe_ratios || []
      },
      sectorExposures: {},
      efficientFrontierData: (results.efficient_frontier || []).map((point: any) => ({
        volatility: point.volatility || 0,
        return: point.return || 0,
        sharpe: point.sharpe || 0
      }))
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Optimizer</h2>
        <p className="text-slate-600">Choose your optimization method and analyze your portfolio</p>
      </div>

      <Tabs defaultValue="mpt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mpt" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Efficient Frontier</span>
          </TabsTrigger>
          <TabsTrigger value="black-litterman" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Black-Litterman</span>
          </TabsTrigger>
        </TabsList>

        {/* Efficient Frontier Tab */}
        <TabsContent value="mpt" className="space-y-6">
          {mptResults ? (
            // Show EF Results using EFT backend
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Efficient Frontier Analysis Results</h3>
                  <p className="text-slate-600">{mptResults.message}</p>
                </div>
                <Button 
                  onClick={() => setMptResults(null)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>New Analysis</span>
                </Button>
              </div>

              {/* Complete EF Results Display - All Portfolio Optimization Components */}
              {(() => {
                const transformedResults = transformEFTResults(mptResults);
                return (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">Portfolio Analysis Results</h2>
                      <p className="text-lg text-slate-600">
                        Comprehensive analysis of your portfolio's risk and return characteristics
                      </p>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="optimization">Optimization</TabsTrigger>
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <RiskGauge 
                            riskIndex={transformedResults.currentPortfolio.riskIndex}
                            title="Your Portfolio Risk Index"
                          />
                          <WeightsPieChart 
                            weights={transformedResults.currentPortfolio.weights}
                            title="Current Portfolio Allocation"
                          />
                        </div>
                        
                        {/* Quick Performance Summary */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              Portfolio Performance Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-600 font-medium">Sharpe Ratio</div>
                                <div className="text-2xl font-bold text-blue-800">
                                  {(mptResults.portfolio_metrics.sharpe || 0).toFixed(3)}
                                </div>
                              </div>
                              <div className="p-4 bg-green-50 rounded-lg">
                                <div className="text-sm text-green-600 font-medium">Annual Return</div>
                                <div className="text-2xl font-bold text-green-800">
                                  {((mptResults.portfolio_metrics.cagr || 0) * 100).toFixed(2)}%
                                </div>
                              </div>
                              <div className="p-4 bg-orange-50 rounded-lg">
                                <div className="text-sm text-orange-600 font-medium">Volatility</div>
                                <div className="text-2xl font-bold text-orange-800">
                                  {((mptResults.portfolio_metrics.volatility || 0) * 100).toFixed(2)}%
                                </div>
                              </div>
                              <div className="p-4 bg-red-50 rounded-lg">
                                <div className="text-sm text-red-600 font-medium">Max Drawdown</div>
                                <div className="text-2xl font-bold text-red-800">
                                  {((mptResults.portfolio_metrics.max_drawdown || 0) * 100).toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="optimization" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <WeightsPieChart 
                            weights={transformedResults.maxSharpePortfolio.weights}
                            title="Maximum Sharpe Ratio Portfolio"
                          />
                          <WeightsPieChart 
                            weights={transformedResults.minVolatilityPortfolio.weights}
                            title="Minimum Volatility Portfolio"
                          />
                        </div>
                        <Card>
                          <CardHeader>
                            <CardTitle>Optimization Insights</CardTitle>
                            <CardDescription>
                              These optimized portfolios are calculated with 1% minimum and 30% maximum allocation constraints per asset
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-blue-800 mb-2">Maximum Sharpe Ratio</h4>
                                <p className="text-sm text-blue-700">
                                  This portfolio maximizes risk-adjusted returns and represents the optimal balance 
                                  between risk and reward based on historical data.
                                </p>
                                <div className="mt-2 text-sm">
                                  <span className="font-semibold">Sharpe: </span>
                                  {transformedResults.maxSharpePortfolio.sharpe.toFixed(3)}
                                </div>
                              </div>
                              <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-semibold text-green-800 mb-2">Minimum Volatility</h4>
                                <p className="text-sm text-green-700">
                                  This portfolio minimizes risk while maintaining reasonable returns, 
                                  ideal for conservative investors seeking stability.
                                </p>
                                <div className="mt-2 text-sm">
                                  <span className="font-semibold">Volatility: </span>
                                  {(transformedResults.minVolatilityPortfolio.volatility * 100).toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="analysis" className="space-y-6">
                        <EfficientFrontierChart data={transformedResults} />
                      </TabsContent>

                      <TabsContent value="comparison" className="space-y-6">
                        <ComparisonCharts results={transformedResults} />
                      </TabsContent>

                      <TabsContent value="details" className="space-y-6">
                        <MetricsTable results={transformedResults} />
                      </TabsContent>
                    </Tabs>
                  </div>
                );
              })()}
            </div>
          ) : (
            // Show EF Input Form
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                  <Target className="h-6 w-6" />
                  Efficient Frontier
                </h3>
                <p className="text-gray-600">
                  Enter your stock positions and weights for comprehensive portfolio optimization analysis
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Portfolio Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                                      <Label htmlFor="ef-tickers">Stock Tickers (comma-separated)</Label>
                      <Input
                  id="ef-tickers"
                        value={mptTickers}
                        onChange={(e) => setMptTickers(e.target.value)}
                        placeholder="AAPL,MSFT,GOOGL,NVDA"
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Current tickers: {mptTickerList.map(t => (
                          <Badge key={t} variant="secondary" className="mr-1">{t}</Badge>
                        ))}
                      </p>
                    </div>
                    <div>
                                      <Label htmlFor="ef-weights">Weights % (comma-separated)</Label>
                      <Input
                  id="ef-weights"
                        value={mptWeights}
                        onChange={(e) => setMptWeights(e.target.value)}
                        placeholder="25,25,25,25"
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Sum: {mptWeightList.reduce((a, b) => a + b, 0) * 100}% 
                        {Math.abs(mptWeightList.reduce((a, b) => a + b, 0) - 1) > 0.01 && (
                          <span className="text-orange-600 ml-1">(will be normalized)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{mptTickerList.length}</div>
                      <div className="text-sm text-gray-600">Stocks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">Custom</div>
                      <div className="text-sm text-gray-600">Weights</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">2020+</div>
                      <div className="text-sm text-gray-600">Data Period</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">What you'll get:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Complete portfolio risk analysis with your custom weights
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Optimization suggestions (Max Sharpe, Min Volatility)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Efficient frontier visualization with 100 points
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Detailed performance metrics and analysis
                      </li>
                    </ul>
                  </div>

                  {mptError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {mptError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handleMptOptimize}
                    disabled={mptLoading || mptTickerList.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {mptLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Portfolio...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analyze Portfolio with EF
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Black-Litterman Tab */}
        <TabsContent value="black-litterman" className="space-y-6">
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
                    <Target className="h-5 w-5" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
