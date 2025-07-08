// API service for communicating with the FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface PortfolioRequest {
  symbols: string[];
  weights?: number[];
  risk_free_rate?: number;
  target_return?: number;
  optimization_method?: string;
}

export interface PortfolioResponse {
  symbols: string[];
  weights: number[];
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
  efficient_frontier: Array<{
    return: number;
    risk: number;
  }>;
  timestamp: string;
}

export interface MarketDataResponse {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface MonteCarloRequest {
  tickers: string[];
  weights: number[];
  start_date: string;
  end_date: string;
  initial_value?: number;
  n_simulations?: number;
  n_days?: number;
  benchmark?: string;
}

export interface MonteCarloResponse {
  percentiles: {
    p10: number[];
    p50: number[];
    p90: number[];
  };
  mean_path: number[];
  final_distribution: number[];
  var_5: number;
  mean_final: number;
  probability_of_loss: number;
  normalized_prices: Record<string, number[]>;
  normalized_dates: string[];
  return_distributions: Record<string, number[]>;
  correlation_matrix: Record<string, Record<string, number>>;
  message: string;
}

export interface HestonRequest {
  tickers: string[];
  weights: number[];
  start_date: string;
  end_date: string;
  initial_value?: number;
  n_paths?: number;
  n_days?: number;
  confidence_level?: number;
  kappa?: number;
  theta?: number;
  xi?: number;
  rho?: number;
}

export interface HestonResponse {
  final_distribution: number[];
  var_value: number;
  var_dollar: number;
  var_percent: number;
  cvar_value: number;
  cvar_dollar: number;
  lower_bound: number;
  upper_bound: number;
  mean_value: number;
  initial_value: number;
  confidence_level: number;
  message: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Portfolio analysis
  async analyzePortfolio(data: PortfolioRequest): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>('/api/portfolio/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get market data for a symbol
  async getMarketData(symbol: string): Promise<MarketDataResponse> {
    return this.request<MarketDataResponse>(`/api/market-data/${symbol}`);
  }

  // Get market data for multiple symbols
  async getMarketDataBatch(symbols: string[]): Promise<MarketDataResponse[]> {
    const promises = symbols.map(symbol => this.getMarketData(symbol));
    return Promise.all(promises);
  }

  async runMonteCarloSimulation(data: MonteCarloRequest): Promise<MonteCarloResponse> {
    return this.request<MonteCarloResponse>("/api/portfolio/montecarlo", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async runHestonSimulation(data: HestonRequest): Promise<HestonResponse> {
    return this.request<HestonResponse>("/api/portfolio/heston", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

// Export a singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export default ApiService; 