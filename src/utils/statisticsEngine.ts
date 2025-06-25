
// Real statistical calculations for portfolio optimization
export class StatisticsEngine {
  static calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  static calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = this.calculateMean(squaredDiffs);
    return Math.sqrt(variance);
  }
  
  static calculateCorrelationMatrix(returnsMatrix: number[][]): number[][] {
    const n = returnsMatrix.length;
    const correlationMatrix: number[][] = [];
    
    for (let i = 0; i < n; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1;
        } else {
          correlationMatrix[i][j] = this.calculateCorrelation(returnsMatrix[i], returnsMatrix[j]);
        }
      }
    }
    
    return correlationMatrix;
  }
  
  static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = this.calculateMean(x);
    const meanY = this.calculateMean(y);
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - meanX;
      const yDiff = y[i] - meanY;
      numerator += xDiff * yDiff;
      sumXSquared += xDiff * xDiff;
      sumYSquared += yDiff * yDiff;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  static calculateCovarianceMatrix(returnsMatrix: number[][]): number[][] {
    const n = returnsMatrix.length;
    const covarianceMatrix: number[][] = [];
    
    for (let i = 0; i < n; i++) {
      covarianceMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        covarianceMatrix[i][j] = this.calculateCovariance(returnsMatrix[i], returnsMatrix[j]);
      }
    }
    
    return covarianceMatrix;
  }
  
  static calculateCovariance(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = this.calculateMean(x);
    const meanY = this.calculateMean(y);
    
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (x[i] - meanX) * (y[i] - meanY);
    }
    
    return sum / (n - 1); // Sample covariance
  }
  
  static calculatePortfolioReturn(weights: number[], expectedReturns: number[]): number {
    return weights.reduce((sum, weight, i) => sum + weight * expectedReturns[i], 0);
  }
  
  static calculatePortfolioVolatility(weights: number[], covarianceMatrix: number[][]): number {
    let variance = 0;
    
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        variance += weights[i] * weights[j] * covarianceMatrix[i][j];
      }
    }
    
    return Math.sqrt(variance);
  }
  
  static calculateSharpeRatio(portfolioReturn: number, portfolioVolatility: number, riskFreeRate: number): number {
    return portfolioVolatility === 0 ? 0 : (portfolioReturn - riskFreeRate) / portfolioVolatility;
  }
  
  static calculateMaxDrawdown(returns: number[]): number {
    let maxDrawdown = 0;
    let peak = 1;
    let cumulativeReturn = 1;
    
    for (const ret of returns) {
      cumulativeReturn *= (1 + ret);
      if (cumulativeReturn > peak) {
        peak = cumulativeReturn;
      }
      const drawdown = (peak - cumulativeReturn) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return -maxDrawdown; // Return as negative percentage
  }
  
  static calculateSortinoRatio(returns: number[], riskFreeRate: number): number {
    const excessReturns = returns.map(r => r - riskFreeRate / 252); // Daily risk-free rate
    const downside = excessReturns.filter(r => r < 0);
    
    if (downside.length === 0) return 0;
    
    const downsideDeviation = Math.sqrt(downside.reduce((sum, r) => sum + r * r, 0) / downside.length);
    const avgExcessReturn = this.calculateMean(excessReturns);
    
    return downsideDeviation === 0 ? 0 : (avgExcessReturn * 252) / (downsideDeviation * Math.sqrt(252));
  }
}
