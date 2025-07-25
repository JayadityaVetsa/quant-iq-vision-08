
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Stock {
  ticker: string;
  weight: number;
}

export interface Portfolio {
  id: string;
  name: string;
  stocks: Stock[];
  initialValue: number;
  riskFreeRate: number;
  createdAt: string;
  updatedAt: string;
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
  monteCarloSimulation?: {
    returns: number[];
    volatilities: number[];
    sharpe_ratios: number[];
  };
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
  // Legacy support
  portfolioData: PortfolioData | null;
  optimizationResults: OptimizationResults | null;
  isAnalyzing: boolean;
  setPortfolioData: (data: PortfolioData) => void;
  setOptimizationResults: (results: OptimizationResults) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  clearResults: () => void;
  
  // Enhanced portfolio management
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  createPortfolio: (name: string, stocks: Stock[], initialValue?: number, riskFreeRate?: number) => Portfolio;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  setActivePortfolio: (portfolio: Portfolio | null) => void;
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
  
  // Enhanced portfolio state
  const [portfolios, setPortfolios] = useState<Portfolio[]>(() => {
    const saved = localStorage.getItem('quantifyiq-portfolios');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePortfolio, setActivePortfolioState] = useState<Portfolio | null>(() => {
    const saved = localStorage.getItem('quantifyiq-active-portfolio');
    return saved ? JSON.parse(saved) : null;
  });

  // Save portfolios to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('quantifyiq-portfolios', JSON.stringify(portfolios));
  }, [portfolios]);

  // Save active portfolio to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('quantifyiq-active-portfolio', JSON.stringify(activePortfolio));
  }, [activePortfolio]);

  const clearResults = () => {
    setPortfolioData(null);
    setOptimizationResults(null);
    setIsAnalyzing(false);
  };

  const createPortfolio = (name: string, stocks: Stock[], initialValue = 100000, riskFreeRate = 0.02): Portfolio => {
    const now = new Date().toISOString();
    const newPortfolio: Portfolio = {
      id: `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      stocks,
      initialValue,
      riskFreeRate,
      createdAt: now,
      updatedAt: now
    };
    
    setPortfolios(prev => [...prev, newPortfolio]);
    return newPortfolio;
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    setPortfolios(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
    
    // Update active portfolio if it's the one being updated
    if (activePortfolio?.id === id) {
      setActivePortfolioState(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  };

  const deletePortfolio = (id: string) => {
    setPortfolios(prev => prev.filter(p => p.id !== id));
    
    // Clear active portfolio if it's the one being deleted
    if (activePortfolio?.id === id) {
      setActivePortfolioState(null);
    }
  };

  const setActivePortfolio = (portfolio: Portfolio | null) => {
    setActivePortfolioState(portfolio);
    
    // Update legacy portfolioData for backward compatibility
    if (portfolio) {
      setPortfolioData({
        stocks: portfolio.stocks,
        initialValue: portfolio.initialValue,
        riskFreeRate: portfolio.riskFreeRate
      });
    } else {
      setPortfolioData(null);
    }
  };

  return (
    <PortfolioContext.Provider value={{
      // Legacy support
      portfolioData,
      optimizationResults,
      isAnalyzing,
      setPortfolioData,
      setOptimizationResults,
      setIsAnalyzing,
      clearResults,
      
      // Enhanced portfolio management
      portfolios,
      activePortfolio,
      createPortfolio,
      updatePortfolio,
      deletePortfolio,
      setActivePortfolio
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
