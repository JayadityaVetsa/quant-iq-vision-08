
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Stock {
  ticker: string;
  weight: number;
}

export interface PortfolioData {
  stocks: Stock[];
  initialValue: number;
  riskFreeRate: number;
}

export interface OptimizationResults {
  currentPortfolio: PortfolioMetrics;
  maxSharpePortfolio: PortfolioMetrics;
  minVolatilityPortfolio: PortfolioMetrics;
  benchmarkResults: Record<string, PortfolioMetrics>;
  sectorExposures: Record<string, number>;
  efficientFrontierData: EfficientFrontierPoint[];
}

export interface PortfolioMetrics {
  return: number;
  volatility: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  riskIndex: number;
  weights: Record<string, number>;
}

export interface EfficientFrontierPoint {
  volatility: number;
  return: number;
  sharpe: number;
}

interface PortfolioContextType {
  portfolioData: PortfolioData | null;
  optimizationResults: OptimizationResults | null;
  isAnalyzing: boolean;
  setPortfolioData: (data: PortfolioData) => void;
  setOptimizationResults: (results: OptimizationResults) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  clearResults: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider = ({ children }: PortfolioProviderProps) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const clearResults = () => {
    setPortfolioData(null);
    setOptimizationResults(null);
    setIsAnalyzing(false);
  };

  return (
    <PortfolioContext.Provider value={{
      portfolioData,
      optimizationResults,
      isAnalyzing,
      setPortfolioData,
      setOptimizationResults,
      setIsAnalyzing,
      clearResults
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
