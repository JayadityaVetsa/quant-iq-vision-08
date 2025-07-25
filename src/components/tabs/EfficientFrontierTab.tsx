import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, RefreshCw, BarChart3, AlertCircle } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { apiService, EFTRequest, EFTResponse } from "@/services/api";
import { EfficientFrontierChart } from "@/components/portfolio/EfficientFrontierChart";
import { MetricsTable } from "@/components/portfolio/MetricsTable";
import { WeightsPieChart } from "@/components/portfolio/WeightsPieChart";
import { RiskGauge } from "@/components/portfolio/RiskGauge";
import { usePortfolio } from "@/contexts/PortfolioContext";

interface EfficientFrontierTabProps {
  onCreatePortfolio: () => void;
}

export const EfficientFrontierTab = ({ onCreatePortfolio }: EfficientFrontierTabProps) => {
  const { activePortfolio } = usePortfolio();
  
  // EF specific state - using EFT backend
  const [mptTickers, setMptTickers] = useState<string>('AAPL,MSFT,GOOGL,NVDA');
  const [mptWeights, setMptWeights] = useState<string>('25,25,25,25');
  const [mptLoading, setMptLoading] = useState<boolean>(false);
  const [mptResults, setMptResults] = useState<EFTResponse | null>(null);
  const [mptError, setMptError] = useState<string>('');

  // Auto-populate from active portfolio
  useEffect(() => {
    if (activePortfolio) {
      const tickers = activePortfolio.stocks.map(s => s.ticker).join(',');
      const weights = activePortfolio.stocks.map(s => (s.weight * 100).toFixed(1)).join(',');
      setMptTickers(tickers);
      setMptWeights(weights);
    }
  }, [activePortfolio]);

  const mptTickerList = mptTickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t.length > 0);
  const mptWeightList = mptWeights.split(',').map(w => parseFloat(w.trim()) / 100).filter(w => !isNaN(w));

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground">Efficient Frontier Analysis</h1>
            <p className="text-muted-foreground">Optimize your portfolio using Modern Portfolio Theory</p>
          </div>
        </div>
        {activePortfolio && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-700">
              Using active portfolio: <strong>{activePortfolio.name}</strong>
            </span>
          </div>
        )}
      </div>

      {!activePortfolio ? (
        // No Active Portfolio State
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Active Portfolio</h3>
                <p className="text-muted-foreground mb-4">
                  Create a portfolio first to run Efficient Frontier analysis. The analysis will automatically use your portfolio's stocks and weights as the starting point.
                </p>
                <Button onClick={onCreatePortfolio} className="gap-2">
                  <Target className="w-4 h-4" />
                  Create Portfolio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : mptResults ? (
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
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
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

                    {/* Optimization Portfolios - moved here */}
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

                    {/* Efficient Frontier Chart */}
                    <EfficientFrontierChart data={transformedResults} />

                    {/* Detailed Metrics Table */}
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
              Efficient Frontier Analysis
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
    </div>
  );
}; 