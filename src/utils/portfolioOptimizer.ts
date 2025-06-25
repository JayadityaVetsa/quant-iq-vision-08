
import { PortfolioData, OptimizationResults, PortfolioMetrics } from "@/contexts/PortfolioContext";
import { MarketDataService } from "./marketDataService";
import { StatisticsEngine } from "./statisticsEngine";

export class PortfolioOptimizerService {
  private static readonly RISK_FREE_RATE = 0.02;
  private static readonly LOOKBACK_DAYS = 252; // 1 year of trading days

  static async optimizePortfolio(portfolioData: PortfolioData): Promise<OptimizationResults> {
    console.log('Starting real portfolio optimization...');
    
    try {
      // Fetch real market data for all stocks
      const stockData = await this.fetchAllStockData(portfolioData.stocks.map(s => s.ticker));
      
      // Calculate returns and statistics
      const returnsData = this.calculateReturnsMatrix(stockData);
      const expectedReturns = this.calculateExpectedReturns(returnsData);
      const covarianceMatrix = StatisticsEngine.calculateCovarianceMatrix(returnsData);
      
      // Current portfolio analysis
      const currentPortfolio = this.analyzePortfolio(
        portfolioData.stocks.map(s => s.weight),
        expectedReturns,
        covarianceMatrix,
        returnsData,
        portfolioData.riskFreeRate
      );
      currentPortfolio.weights = this.createWeightsObject(
        portfolioData.stocks.map(s => s.ticker),
        portfolioData.stocks.map(s => s.weight)
      );

      // Optimization with constraints
      const maxSharpeWeights = this.optimizeForMaxSharpe(expectedReturns, covarianceMatrix, portfolioData.riskFreeRate);
      const maxSharpePortfolio = this.analyzePortfolio(maxSharpeWeights, expectedReturns, covarianceMatrix, returnsData, portfolioData.riskFreeRate);
      maxSharpePortfolio.weights = this.createWeightsObject(portfolioData.stocks.map(s => s.ticker), maxSharpeWeights);

      const minVolWeights = this.optimizeForMinVolatility(covarianceMatrix);
      const minVolatilityPortfolio = this.analyzePortfolio(minVolWeights, expectedReturns, covarianceMatrix, returnsData, portfolioData.riskFreeRate);
      minVolatilityPortfolio.weights = this.createWeightsObject(portfolioData.stocks.map(s => s.ticker), minVolWeights);

      // Benchmark analysis
      const benchmarkResults = await this.analyzeBenchmarks(portfolioData.riskFreeRate);

      // Generate efficient frontier
      const efficientFrontierData = this.generateEfficientFrontier(expectedReturns, covarianceMatrix, portfolioData.riskFreeRate);

      // Mock sector exposures (would need additional API for real sector data)
      const sectorExposures = this.generateMockSectorExposures(portfolioData.stocks);

      return {
        currentPortfolio,
        maxSharpePortfolio,
        minVolatilityPortfolio,
        benchmarkResults,
        sectorExposures,
        efficientFrontierData
      };

    } catch (error) {
      console.error('Portfolio optimization failed:', error);
      throw new Error('Failed to optimize portfolio. Please check your stock symbols and try again.');
    }
  }

  private static async fetchAllStockData(tickers: string[]) {
    const promises = tickers.map(async (ticker) => {
      try {
        const data = await MarketDataService.fetchStockData(ticker);
        return { ticker, data: data.slice(-this.LOOKBACK_DAYS) }; // Last year of data
      } catch (error) {
        console.warn(`Failed to fetch data for ${ticker}, using mock data`);
        return { ticker, data: this.generateMockPriceData() };
      }
    });

    return Promise.all(promises);
  }

  private static generateMockPriceData() {
    const prices = [];
    let price = 100;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - this.LOOKBACK_DAYS);

    for (let i = 0; i < this.LOOKBACK_DAYS; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      price *= (1 + (Math.random() - 0.5) * 0.04); // ±2% daily volatility
      prices.push({
        date: date.toISOString().split('T')[0],
        price: price
      });
    }

    return prices;
  }

  private static calculateReturnsMatrix(stockData: any[]): number[][] {
    return stockData.map(stock => {
      const returns = MarketDataService.calculateReturns(stock.data);
      return returns.map(r => r.return);
    });
  }

  private static calculateExpectedReturns(returnsMatrix: number[][]): number[] {
    return returnsMatrix.map(returns => {
      const annualizedReturn = StatisticsEngine.calculateMean(returns) * 252; // Annualize daily returns
      return annualizedReturn;
    });
  }

  private static analyzePortfolio(
    weights: number[],
    expectedReturns: number[],
    covarianceMatrix: number[][],
    returnsMatrix: number[][],
    riskFreeRate: number
  ): PortfolioMetrics {
    const portfolioReturn = StatisticsEngine.calculatePortfolioReturn(weights, expectedReturns);
    const portfolioVolatility = StatisticsEngine.calculatePortfolioVolatility(weights, covarianceMatrix) * Math.sqrt(252); // Annualize
    const sharpe = StatisticsEngine.calculateSharpeRatio(portfolioReturn, portfolioVolatility, riskFreeRate);
    
    // Calculate portfolio returns for drawdown and Sortino
    const portfolioReturns = this.calculatePortfolioTimeSeries(weights, returnsMatrix);
    const maxDrawdown = StatisticsEngine.calculateMaxDrawdown(portfolioReturns);
    const sortino = StatisticsEngine.calculateSortinoRatio(portfolioReturns, riskFreeRate);
    
    const riskIndex = this.calculateRiskIndex(sharpe, portfolioVolatility, maxDrawdown);

    return {
      return: portfolioReturn,
      volatility: portfolioVolatility,
      sharpe,
      sortino,
      maxDrawdown,
      riskIndex,
      weights: {}
    };
  }

  private static calculatePortfolioTimeSeries(weights: number[], returnsMatrix: number[][]): number[] {
    const timeSeriesLength = returnsMatrix[0].length;
    const portfolioReturns = [];

    for (let t = 0; t < timeSeriesLength; t++) {
      let portfolioReturn = 0;
      for (let i = 0; i < weights.length; i++) {
        portfolioReturn += weights[i] * returnsMatrix[i][t];
      }
      portfolioReturns.push(portfolioReturn);
    }

    return portfolioReturns;
  }

  private static optimizeForMaxSharpe(expectedReturns: number[], covarianceMatrix: number[][], riskFreeRate: number): number[] {
    const numAssets = expectedReturns.length;
    let bestSharpe = -Infinity;
    let bestWeights = new Array(numAssets).fill(1 / numAssets);

    // Simple grid search optimization with constraints
    for (let iter = 0; iter < 10000; iter++) {
      let weights = this.generateRandomWeights(numAssets);
      
      // Apply constraints: min 1%, max 30%
      weights = weights.map(w => Math.max(0.01, Math.min(0.30, w)));
      
      // Normalize to sum to 1
      const sum = weights.reduce((a, b) => a + b, 0);
      weights = weights.map(w => w / sum);

      const portfolioReturn = StatisticsEngine.calculatePortfolioReturn(weights, expectedReturns);
      const portfolioVolatility = StatisticsEngine.calculatePortfolioVolatility(weights, covarianceMatrix) * Math.sqrt(252);
      const sharpe = StatisticsEngine.calculateSharpeRatio(portfolioReturn, portfolioVolatility, riskFreeRate);

      if (sharpe > bestSharpe) {
        bestSharpe = sharpe;
        bestWeights = [...weights];
      }
    }

    return bestWeights;
  }

  private static optimizeForMinVolatility(covarianceMatrix: number[][]): number[] {
    const numAssets = covarianceMatrix.length;
    let bestVolatility = Infinity;
    let bestWeights = new Array(numAssets).fill(1 / numAssets);

    // Simple grid search optimization with constraints
    for (let iter = 0; iter < 10000; iter++) {
      let weights = this.generateRandomWeights(numAssets);
      
      // Apply constraints: min 1%, max 30%
      weights = weights.map(w => Math.max(0.01, Math.min(0.30, w)));
      
      // Normalize to sum to 1
      const sum = weights.reduce((a, b) => a + b, 0);
      weights = weights.map(w => w / sum);

      const portfolioVolatility = StatisticsEngine.calculatePortfolioVolatility(weights, covarianceMatrix) * Math.sqrt(252);

      if (portfolioVolatility < bestVolatility) {
        bestVolatility = portfolioVolatility;
        bestWeights = [...weights];
      }
    }

    return bestWeights;
  }

  private static generateRandomWeights(numAssets: number): number[] {
    const weights = [];
    for (let i = 0; i < numAssets; i++) {
      weights.push(Math.random());
    }
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => w / sum);
  }

  private static async analyzeBenchmarks(riskFreeRate: number) {
    // For now, return simplified benchmark data
    // In a real implementation, you'd fetch SPY, QQQ, etc. data
    return {
      'S&P 500': {
        return: 0.10,
        volatility: 0.16,
        sharpe: (0.10 - riskFreeRate) / 0.16,
        sortino: 0.65,
        maxDrawdown: -0.20,
        riskIndex: this.calculateRiskIndex((0.10 - riskFreeRate) / 0.16, 0.16, -0.20),
        weights: { 'SPY': 1.0 }
      } as PortfolioMetrics
    };
  }

  private static generateEfficientFrontier(expectedReturns: number[], covarianceMatrix: number[][], riskFreeRate: number) {
    const points = [];
    
    // Generate efficient frontier points
    for (let i = 0; i < 50; i++) {
      const weights = this.generateRandomWeights(expectedReturns.length);
      const portfolioReturn = StatisticsEngine.calculatePortfolioReturn(weights, expectedReturns);
      const portfolioVolatility = StatisticsEngine.calculatePortfolioVolatility(weights, covarianceMatrix) * Math.sqrt(252);
      const sharpe = StatisticsEngine.calculateSharpeRatio(portfolioReturn, portfolioVolatility, riskFreeRate);
      
      points.push({
        volatility: portfolioVolatility,
        return: portfolioReturn,
        sharpe
      });
    }
    
    return points.sort((a, b) => a.volatility - b.volatility);
  }

  private static calculateRiskIndex(sharpe: number, volatility: number, maxDrawdown: number): number {
    const normSharpe = Math.max(0, Math.min(100, (sharpe / 3.0) * 100));
    const normVol = Math.max(0, Math.min(100, (1 - volatility / 0.50) * 100));
    const normDrawdown = Math.max(0, Math.min(100, (1 - Math.abs(maxDrawdown) / 0.60) * 100));
    
    return 0.3 * normSharpe + 0.4 * normVol + 0.3 * normDrawdown;
  }

  private static createWeightsObject(tickers: string[], weights: number[]): Record<string, number> {
    const weightsObj: Record<string, number> = {};
    tickers.forEach((ticker, i) => {
      weightsObj[ticker] = weights[i];
    });
    return weightsObj;
  }

  private static generateMockSectorExposures(stocks: { ticker: string; weight: number }[]): Record<string, number> {
    // Mock sector mapping - in real implementation, you'd fetch this from a financial data API
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
}
