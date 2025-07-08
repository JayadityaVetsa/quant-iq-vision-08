import React, { useState, useEffect } from 'react';
import { apiService, HealthResponse, PortfolioRequest } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const ApiTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbols, setSymbols] = useState<string>('AAPL,GOOGL,MSFT');
  const [portfolioResult, setPortfolioResult] = useState<any>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await apiService.healthCheck();
      setHealthStatus(health);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const analyzePortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const symbolList = symbols.split(',').map(s => s.trim()).filter(s => s);
      const request: PortfolioRequest = {
        symbols: symbolList,
        risk_free_rate: 0.02,
        optimization_method: 'efficient_frontier'
      };
      
      const result = await apiService.analyzePortfolio(request);
      setPortfolioResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check health on component mount
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>
            Test the connection between React frontend and FastAPI backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Check Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button 
                onClick={checkHealth} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check Health'}
              </Button>
              {healthStatus && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    Backend is healthy (v{healthStatus.version})
                  </span>
                </div>
              )}
            </div>
            
            {healthStatus && (
              <div className="text-sm text-muted-foreground">
                Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
              </div>
            )}
          </div>

          {/* Portfolio Analysis Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbols">Stock Symbols (comma-separated)</Label>
              <Input
                id="symbols"
                value={symbols}
                onChange={(e) => setSymbols(e.target.value)}
                placeholder="AAPL,GOOGL,MSFT"
              />
            </div>
            
            <Button 
              onClick={analyzePortfolio} 
              disabled={loading || !symbols.trim()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Analyze Portfolio
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Portfolio Results */}
          {portfolioResult && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Expected Return:</strong> {(portfolioResult.expected_return * 100).toFixed(2)}%
                  </div>
                  <div>
                    <strong>Volatility:</strong> {(portfolioResult.volatility * 100).toFixed(2)}%
                  </div>
                  <div>
                    <strong>Sharpe Ratio:</strong> {portfolioResult.sharpe_ratio.toFixed(3)}
                  </div>
                  <div>
                    <strong>Symbols:</strong> {portfolioResult.symbols.join(', ')}
                  </div>
                </div>
                
                <div className="mt-4">
                  <strong>Weights:</strong>
                  <div className="flex gap-2 mt-1">
                    {portfolioResult.weights.map((weight: number, index: number) => (
                      <span key={index} className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {portfolioResult.symbols[index]}: {(weight * 100).toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 