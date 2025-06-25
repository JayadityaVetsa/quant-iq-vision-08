
import { PortfolioData, OptimizationResults, PortfolioMetrics } from "@/contexts/PortfolioContext";

// Mock API service that simulates the backend optimization
export class PortfolioOptimizerService {
  private static readonly RISK_FREE_RATE = 0.02;
  private static readonly SECTOR_ETF_MAP = {
    'Technology': 'XLK',
    'Financials': 'XLF', 
    'Healthcare': 'XLV',
    'Consumer Cyclical': 'XLY',
    'Consumer Defensive': 'XLP',
    'Industrials': 'XLI',
    'Energy': 'XLE',
    'Real Estate': 'XLRE',
    'Utilities': 'XLU',
    'Basic Materials': 'XLB',
    'Communication Services': 'XLC'
  };

  static async optimizePortfolio(portfolioData: PortfolioData): Promise<OptimizationResults> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Mock optimization results based on the input
    const mockResults = this.generateMockResults(portfolioData);
    
    return mockResults;
  }

  private static generateMockResults(portfolioData: PortfolioData): OptimizationResults {
    const { stocks, riskFreeRate } = portfolioData;
    
    // Generate realistic mock data based on actual portfolio composition
    const currentWeights = this.normalizeWeights(stocks);
    
    // Current portfolio metrics (slightly randomized but realistic)
    const currentPortfolio: PortfolioMetrics = {
      return: 0.08 + (Math.random() - 0.5) * 0.04, // 6-10% range
      volatility: 0.15 + (Math.random() - 0.5) * 0.06, // 12-18% range  
      sharpe: 0,
      sortino: 0,
      maxDrawdown: -0.15 - Math.random() * 0.1, // -15% to -25%
      riskIndex: 0,
      weights: currentWeights
    };
    
    // Calculate derived metrics
    currentPortfolio.sharpe = (currentPortfolio.return - riskFreeRate) / currentPortfolio.volatility;
    currentPortfolio.sortino = currentPortfolio.sharpe * 1.2; // Approximation
    currentPortfolio.riskIndex = this.calculateRiskIndex(currentPortfolio);

    // Optimized portfolios (improved versions)
    const maxSharpePortfolio: PortfolioMetrics = {
      return: currentPortfolio.return * 1.15 + 0.01, // Better return
      volatility: currentPortfolio.volatility * 0.9, // Lower volatility
      sharpe: 0,
      sortino: 0,
      maxDrawdown: currentPortfolio.maxDrawdown * 0.8, // Better drawdown
      riskIndex: 0,
      weights: this.generateOptimizedWeights(stocks, 'maxSharpe')
    };
    
    maxSharpePortfolio.sharpe = (maxSharpePortfolio.return - riskFreeRate) / maxSharpePortfolio.volatility;
    maxSharpePortfolio.sortino = maxSharpePortfolio.sharpe * 1.2;
    maxSharpePortfolio.riskIndex = this.calculateRiskIndex(maxSharpePortfolio);

    const minVolatilityPortfolio: PortfolioMetrics = {
      return: currentPortfolio.return * 0.9, // Slightly lower return
      volatility: currentPortfolio.volatility * 0.7, // Much lower volatility
      sharpe: 0,
      sortino: 0,
      maxDrawdown: currentPortfolio.maxDrawdown * 0.6, // Much better drawdown
      riskIndex: 0,
      weights: this.generateOptimizedWeights(stocks, 'minVol')
    };
    
    minVolatilityPortfolio.sharpe = (minVolatilityPortfolio.return - riskFreeRate) / minVolatilityPortfolio.volatility;
    minVolatilityPortfolio.sortino = minVolatilityPortfolio.sharpe * 1.2;
    minVolatilityPortfolio.riskIndex = this.calculateRiskIndex(minVolatilityPortfolio);

    // Benchmark results
    const benchmarkResults = {
      'S&P 500': {
        return: 0.10,
        volatility: 0.16,
        sharpe: (0.10 - riskFreeRate) / 0.16,
        sortino: 0.65,
        maxDrawdown: -0.20,
        riskIndex: 0,
        weights: { 'SPY': 1.0 }
      } as PortfolioMetrics
    };
    
    benchmarkResults['S&P 500'].riskIndex = this.calculateRiskIndex(benchmarkResults['S&P 500']);

    // Mock sector exposures
    const sectorExposures = this.generateSectorExposures(stocks);

    // Generate efficient frontier points
    const efficientFrontierData = this.generateEfficientFrontierData();

    return {
      currentPortfolio,
      maxSharpePortfolio,
      minVolatilityPortfolio,
      benchmarkResults,
      sectorExposures,
      efficientFrontierData
    };
  }

  private static normalizeWeights(stocks: { ticker: string; weight: number }[]): Record<string, number> {
    const total = stocks.reduce((sum, stock) => sum + stock.weight, 0);
    const weights: Record<string, number> = {};
    
    stocks.forEach(stock => {
      weights[stock.ticker] = stock.weight / total;
    });
    
    return weights;
  }

  private static generateOptimizedWeights(
    stocks: { ticker: string; weight: number }[], 
    type: 'maxSharpe' | 'minVol'
  ): Record<string, number> {
    const weights: Record<string, number> = {};
    const numStocks = stocks.length;
    
    // Generate more realistic optimization-like weights
    if (type === 'maxSharpe') {
      // Max Sharpe tends to concentrate in best performing assets
      stocks.forEach((stock, index) => {
        const baseWeight = 1 / numStocks;
        const adjustment = (Math.random() - 0.5) * 0.4; // +/- 20% adjustment
        weights[stock.ticker] = Math.max(0.01, Math.min(0.30, baseWeight + adjustment));
      });
    } else {
      // Min Vol tends to be more diversified
      stocks.forEach(stock => {
        const baseWeight = 1 / numStocks;
        const adjustment = (Math.random() - 0.5) * 0.2; // +/- 10% adjustment  
        weights[stock.ticker] = Math.max(0.01, Math.min(0.30, baseWeight + adjustment));
      });
    }
    
    // Normalize to sum to 1
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    Object.keys(weights).forEach(ticker => {
      weights[ticker] = weights[ticker] / total;
    });
    
    return weights;
  }

  private static calculateRiskIndex(metrics: PortfolioMetrics): number {
    const normSharpe = Math.max(0, Math.min(100, (metrics.sharpe / 3.0) * 100));
    const normVol = Math.max(0, Math.min(100, (1 - metrics.volatility / 0.50) * 100));
    const normDrawdown = Math.max(0, Math.min(100, (1 - Math.abs(metrics.maxDrawdown) / 0.60) * 100));
    
    return 0.3 * normSharpe + 0.4 * normVol + 0.3 * normDrawdown;
  }

  private static generateSectorExposures(stocks: { ticker: string; weight: number }[]): Record<string, number> {
    // Mock sector mapping for common tickers
    const sectorMap: Record<string, string> = {
      'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'AMZN': 'Consumer Cyclical',
      'TSLA': 'Consumer Cyclical', 'JPM': 'Financials', 'V': 'Financials', 'JNJ': 'Healthcare',
      'PG': 'Consumer Defensive', 'KO': 'Consumer Defensive', 'XOM': 'Energy'
    };
    
    const sectorExposures: Record<string, number> = {};
    const totalWeight = stocks.reduce((sum, stock) => sum + stock.weight, 0);
    
    stocks.forEach(stock => {
      const sector = sectorMap[stock.ticker] || 'Other';
      const normalizedWeight = stock.weight / totalWeight;
      sectorExposures[sector] = (sectorExposures[sector] || 0) + normalizedWeight;
    });
    
    return sectorExposures;
  }

  private static generateEfficientFrontierData() {
    const points = [];
    for (let i = 0; i < 50; i++) {
      const volatility = 0.05 + (i / 49) * 0.25; // 5% to 30% volatility range
      const return_ = 0.02 + volatility * 0.4 + (Math.random() - 0.5) * 0.02; // Rough risk-return relationship
      const sharpe = (return_ - 0.02) / volatility;
      
      points.push({
        volatility,
        return: return_,
        sharpe
      });
    }
    return points;
  }
}
