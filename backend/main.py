from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import uvicorn
from datetime import datetime
import os
from dotenv import load_dotenv
import numpy as np
import pandas as pd
import yfinance as yf
from scipy.optimize import minimize
import warnings
import traceback

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Import our optimizers
from black_litterman_optimizer import EnhancedBlackLittermanOptimizer
from eft_optimizer import EFTOptimizer
from backtester import fetch_data, calculate_metrics_and_charts, scenario_stress_test

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Quant IQ Vision API",
    description="Backend API for Quant IQ Vision portfolio analysis and optimization",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:5174",  # Alternative Vite dev port
        "http://localhost:5175",  # Alternative Vite dev port
        "http://localhost:5176",  # Alternative Vite dev port
        "http://localhost:3000",  # Alternative dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class PortfolioRequest(BaseModel):
    symbols: List[str]
    weights: Optional[List[float]] = None
    risk_free_rate: Optional[float] = 0.02
    target_return: Optional[float] = None
    optimization_method: Optional[str] = "efficient_frontier"

class PortfolioResponse(BaseModel):
    symbols: List[str]
    weights: List[float]
    expected_return: float
    volatility: float
    sharpe_ratio: float
    efficient_frontier: List[dict]
    timestamp: datetime

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str

class MonteCarloRequest(BaseModel):
    tickers: List[str]
    weights: List[float]
    start_date: str
    end_date: str
    initial_value: float = 100000
    n_simulations: int = 10000
    n_days: int = 252
    benchmark: str = "SPY"

class MonteCarloResponse(BaseModel):
    percentiles: Dict[str, List[float]]
    mean_path: List[float]
    final_distribution: List[float]
    var_5: float
    mean_final: float
    probability_of_loss: float
    normalized_prices: Dict[str, List[float]]
    normalized_dates: List[str]
    return_distributions: Dict[str, List[float]]
    correlation_matrix: Dict[str, Dict[str, float]]
    message: str

class HestonRequest(BaseModel):
    tickers: List[str]
    weights: List[float]
    start_date: str
    end_date: str
    initial_value: float = 100000
    n_paths: int = 10000
    n_days: int = 252
    confidence_level: float = 0.90

class HestonResponse(BaseModel):
    final_distribution: List[float]
    var_value: float
    var_dollar: float
    var_percent: float
    cvar_value: float
    cvar_dollar: float
    lower_bound: float
    upper_bound: float
    mean_value: float
    initial_value: float
    confidence_level: float
    message: str

class BlackLittermanRequest(BaseModel):
    tickers: List[str]
    views: Dict[str, float]  # ticker -> expected return
    confidences: Dict[str, float]  # ticker -> confidence level (0.1 to 1.0)
    period: Optional[str] = "2y"  # 1y, 2y, 3y, 5y
    tau: Optional[float] = 0.05  # uncertainty scaling factor
    rf_rate: Optional[float] = 0.045  # risk-free rate
    include_dividends: Optional[bool] = True

class BlackLittermanResponse(BaseModel):
    optimal_weights: Dict[str, float]
    posterior_returns: Dict[str, float]
    portfolio_stats: Dict[str, Any]  # Changed from float to Any to handle nested dicts
    comparison_table: List[Dict[str, Any]]  # Changed from float to Any to handle strings
    stock_info: Dict[str, Dict[str, Any]]
    message: str
    allocation_summary: Optional[List[Dict[str, Any]]] = None
    key_insights: Optional[List[str]] = None
    model_parameters: Optional[Dict[str, Any]] = None

class EFTRequest(BaseModel):
    tickers: List[str]
    weights: List[float]
    start_date: str
    end_date: str
    risk_free_rate: Optional[float] = 0.02
    weight_bounds: Optional[List[float]] = [0.01, 0.30]  # [min_weight, max_weight]
    n_simulations: Optional[int] = 10000
    n_frontier_points: Optional[int] = 100

class EFTResponse(BaseModel):
    portfolio_metrics: Dict[str, Any]
    efficient_frontier: List[Dict[str, float]]
    monte_carlo_simulation: Dict[str, List[float]]
    benchmarks: Dict[str, Dict[str, Any]]
    composition: Dict[str, Any]
    optimization_settings: Dict[str, Any]
    message: str

class SimpleEFTRequest(BaseModel):
    tickers: List[str]
    start_date: Optional[str] = "2020-01-01"
    risk_free_rate: Optional[float] = 0.02
    weight_bounds_min: Optional[float] = 0.01
    weight_bounds_max: Optional[float] = 0.30

class BacktestRequest(BaseModel):
    tickers: List[str]
    weights: List[float]
    start_date: str
    end_date: str
    benchmark: Optional[str] = 'SPY'
    risk_free_rate: Optional[float] = 0.02
    initial_value: Optional[float] = 100000
    n_simulations: Optional[int] = 10000
    n_days: Optional[int] = 252

class BacktestResponse(BaseModel):
    riskIndex: float
    weights: Dict[str, float]
    minVolatility: Dict[str, Any]
    efficientFrontier: List[Dict[str, Any]]
    comparison: Dict[str, Any]

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0"
    )

# Example portfolio analysis endpoint
@app.post("/api/portfolio/analyze", response_model=PortfolioResponse)
async def analyze_portfolio(request: PortfolioRequest):
    try:
        # This is a placeholder implementation
        # You'll integrate your existing portfolio analysis logic here
        
        # Mock response for now
        weights = request.weights or [1.0 / len(request.symbols)] * len(request.symbols)
        
        return PortfolioResponse(
            symbols=request.symbols,
            weights=weights,
            expected_return=0.08,
            volatility=0.15,
            sharpe_ratio=0.4,
            efficient_frontier=[
                {"return": 0.05, "risk": 0.10},
                {"return": 0.08, "risk": 0.15},
                {"return": 0.12, "risk": 0.25}
            ],
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Market data endpoint
@app.get("/api/market-data/{symbol}")
async def get_market_data(symbol: str):
    try:
        # Placeholder for market data retrieval
        # You'll integrate your existing market data service here
        return {
            "symbol": symbol,
            "price": 150.0,
            "change": 2.5,
            "change_percent": 1.67,
            "volume": 1000000,
            "timestamp": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")

# Monte Carlo simulation endpoint
@app.post("/api/portfolio/montecarlo", response_model=MonteCarloResponse)
async def monte_carlo_simulation(request: MonteCarloRequest = Body(...)):
    try:
        # Validate input tickers
        if not request.tickers or len(request.tickers) == 0:
            raise HTTPException(status_code=400, detail="At least one ticker must be provided")
        
        # Clean and validate tickers
        valid_tickers = []
        for ticker in request.tickers:
            if ticker and isinstance(ticker, str) and ticker.strip():
                valid_tickers.append(ticker.strip().upper())
        
        if not valid_tickers:
            raise HTTPException(status_code=400, detail="No valid tickers provided")
        
        if len(valid_tickers) != len(request.weights):
            raise HTTPException(status_code=400, detail="Number of tickers must match number of weights")
        
        # Update request with cleaned tickers
        request.tickers = valid_tickers
        TICKERS = request.tickers
        WEIGHTS = np.array(request.weights)
        START_DATE = request.start_date
        END_DATE = request.end_date
        INITIAL_PORTFOLIO_VALUE = request.initial_value
        N_SIMULATIONS = request.n_simulations
        N_DAYS = request.n_days
        BENCHMARK = request.benchmark

        tickers_to_fetch = TICKERS + [BENCHMARK]
        price_data_raw = yf.download(tickers_to_fetch, start=START_DATE, end=END_DATE, auto_adjust=False)
        
        # Add null check for yfinance data
        if price_data_raw is None or "Adj Close" not in price_data_raw.columns:
            raise ValueError("Failed to fetch market data")
            
        price_data = price_data_raw["Adj Close"].dropna()
        log_returns = np.log(price_data / price_data.shift(1)).dropna()

        # --- Historical Price Performance ---
        normalized_prices_df = (price_data / price_data.iloc[0] * 100)
        normalized_prices = {col: normalized_prices_df[col].tolist() for col in normalized_prices_df.columns}
        normalized_dates = [d.strftime("%Y-%m-%d") for d in normalized_prices_df.index]

        # --- Return Distributions ---
        return_distributions = {ticker: log_returns[ticker].dropna().tolist() for ticker in TICKERS}

        # --- Correlation Matrix ---
        corr_matrix = log_returns[TICKERS].corr()
        correlation_matrix = corr_matrix.to_dict()

        # --- Monte Carlo Simulation ---
        mean_log_returns = log_returns.mean()
        cov_matrix = log_returns.cov()
        portfolio_mean_returns = mean_log_returns[TICKERS].values
        portfolio_cov_matrix = cov_matrix.loc[TICKERS, TICKERS].values
        
        # Ensure price_data[TICKERS] is DataFrame before using .iloc
        ticker_prices = price_data[TICKERS]
        if isinstance(ticker_prices, pd.DataFrame):
            last_prices = ticker_prices.iloc[-1].values
        else:
            last_prices = np.array([price_data[ticker].iloc[-1] if hasattr(price_data[ticker], 'iloc') else price_data[ticker][-1] for ticker in TICKERS])
            
        chol_matrix = np.linalg.cholesky(portfolio_cov_matrix)
        simulated_portfolio_paths = np.zeros((N_DAYS + 1, N_SIMULATIONS))
        simulated_portfolio_paths[0, :] = INITIAL_PORTFOLIO_VALUE
        variances = np.diag(portfolio_cov_matrix)
        drift = portfolio_mean_returns - 0.5 * variances

        for i in range(N_SIMULATIONS):
            random_shocks = np.random.normal(0, 1, size=(N_DAYS, len(TICKERS)))
            correlated_shocks = random_shocks @ chol_matrix.T
            daily_returns = np.exp(drift + correlated_shocks)
            price_paths = last_prices * np.cumprod(daily_returns, axis=0)
            portfolio_value_path = price_paths @ WEIGHTS
            scale_factor = INITIAL_PORTFOLIO_VALUE / (last_prices @ WEIGHTS)
            simulated_portfolio_paths[1:, i] = portfolio_value_path * scale_factor

        # Calculate percentiles at each time step
        percentile_10 = np.percentile(simulated_portfolio_paths, 10, axis=1).tolist()
        percentile_50 = np.percentile(simulated_portfolio_paths, 50, axis=1).tolist()
        percentile_90 = np.percentile(simulated_portfolio_paths, 90, axis=1).tolist()
        mean_path = np.mean(simulated_portfolio_paths, axis=1).tolist()
        final_values = simulated_portfolio_paths[-1]
        mean_final = float(np.mean(final_values))
        var_5 = float(np.percentile(final_values, 5))
        probability_of_loss = float(np.mean(final_values < INITIAL_PORTFOLIO_VALUE))

        return MonteCarloResponse(
            percentiles={
                "p10": percentile_10,
                "p50": percentile_50,
                "p90": percentile_90
            },
            mean_path=mean_path,
            final_distribution=final_values.tolist(),
            var_5=var_5,
            mean_final=mean_final,
            probability_of_loss=probability_of_loss,
            normalized_prices=normalized_prices,
            normalized_dates=normalized_dates,
            return_distributions=return_distributions,
            correlation_matrix=correlation_matrix,
            message="Monte Carlo simulation completed successfully."
        )
    except Exception as e:
        return MonteCarloResponse(
            percentiles={"p10": [], "p50": [], "p90": []},
            mean_path=[],
            final_distribution=[],
            var_5=0.0,
            mean_final=0.0,
            probability_of_loss=0.0,
            normalized_prices={},
            normalized_dates=[],
            return_distributions={},
            correlation_matrix={},
            message=f"Error: {str(e)}"
        )

# Heston simulation endpoint
@app.post("/api/portfolio/heston", response_model=HestonResponse)
async def heston_simulation(request: HestonRequest = Body(...)):
    try:
        # Validate input tickers
        if not request.tickers or len(request.tickers) == 0:
            raise HTTPException(status_code=400, detail="At least one ticker must be provided")
        
        # Clean and validate tickers
        valid_tickers = []
        for ticker in request.tickers:
            if ticker and isinstance(ticker, str) and ticker.strip():
                valid_tickers.append(ticker.strip().upper())
        
        if not valid_tickers:
            raise HTTPException(status_code=400, detail="No valid tickers provided")
        
        if len(valid_tickers) != len(request.weights):
            raise HTTPException(status_code=400, detail="Number of tickers must match number of weights")
        
        # Update request with cleaned tickers
        request.tickers = valid_tickers
        TICKERS = request.tickers
        WEIGHTS = np.array(request.weights)
        START_DATE = request.start_date
        END_DATE = request.end_date
        INITIAL_PORTFOLIO_VALUE = request.initial_value
        N_PATHS = request.n_paths
        N_DAYS_FORWARD = request.n_days
        CONFIDENCE_LEVEL = request.confidence_level
        
        dt = 1 / 252
        SEED = 42
        WINDOW = 21  # Rolling window for realized vol

        # ======================= Data Download ================================
        # Download historical data for calibration (longer period)
        HISTORICAL_START_DATE = '2015-01-01'
        
        # ======================= Data Download ================================
        # Download historical data for calibration (longer period)
        HISTORICAL_START_DATE = '2015-01-01'
        hist_price_data_raw = yf.download(TICKERS, start=HISTORICAL_START_DATE, end=END_DATE, auto_adjust=True)
        
        if hist_price_data_raw is None or hist_price_data_raw.empty:
            raise ValueError("Failed to fetch historical market data")
            
        # Handle single vs multiple tickers
        if len(TICKERS) == 1:
            if 'Close' not in hist_price_data_raw.columns:
                raise ValueError("Failed to fetch historical market data - no Close column")
            hist_price_data = hist_price_data_raw['Close'].dropna()
        else:
            if 'Close' not in hist_price_data_raw.columns or hist_price_data_raw['Close'].empty:
                raise ValueError("Failed to fetch historical market data - no Close data")
            hist_price_data = hist_price_data_raw['Close'].dropna()
        
        if hist_price_data.empty:
            raise ValueError("No historical price data available")
            
        daily_returns = hist_price_data.pct_change().dropna()

        # Adjusted close prices for simulation and log returns
        data_raw = yf.download(TICKERS, start=START_DATE, end=END_DATE, auto_adjust=True)
        
        if data_raw is None or data_raw.empty:
            raise ValueError("Failed to fetch current market data")
            
        # Handle single vs multiple tickers for current data
        if len(TICKERS) == 1:
            if 'Close' not in data_raw.columns:
                raise ValueError("Failed to fetch current market data - no Close column")
            price_data = data_raw['Close'].dropna()
        else:
            if 'Close' not in data_raw.columns or data_raw['Close'].empty:
                raise ValueError("Failed to fetch current market data - no Close data")
            price_data = data_raw['Close'].dropna()

        if price_data.empty:
            raise ValueError("No current price data available")

        log_returns = np.log(price_data / price_data.shift(1)).dropna()

        # Validate data dimensions
        if len(TICKERS) == 1:
            mean_return = log_returns.mean()
            var_return = log_returns.var()
            # Ensure scalar values are properly converted to arrays
            mu_vec = np.array([float(mean_return * 252)])
            cov_matrix = np.array([[float(var_return * 252)]])
        else:
            mu_vec = log_returns.mean().values * 252   # Annualized mean return
            cov_matrix = log_returns.cov().values * 252
            
        n_assets = len(TICKERS)

        # ==================== Calibrate Heston Parameters =====================
        heston_params = {}

        def heston_loss(params, returns):
            kappa, theta, xi, rho = params
            v0 = np.var(returns) * 252
            v = np.zeros(len(returns))
            v[0] = v0
            for t in range(1, len(returns)):
                z = np.random.normal()
                v[t] = np.abs(v[t-1] + kappa * (theta - v[t-1]) * dt + xi * np.sqrt(v[t-1] * dt) * z)
            model_vol = np.sqrt(v)
            actual_vol = returns.rolling(WINDOW).std().dropna().values * np.sqrt(252)
            model_vol = model_vol[-len(actual_vol):]
            return np.mean((model_vol - actual_vol) ** 2)

        # Calibrate parameters for each stock
        for ticker in TICKERS:
            try:
                # Handle single ticker case
                if len(TICKERS) == 1:
                    returns = log_returns.dropna()
                else:
                    returns = log_returns[ticker].dropna()
                    
                initial_guess = [3.0, np.var(returns) * 252, 0.5, -0.7]
                bounds = [(0.01, 10), (0.001, 0.5), (0.01, 2.0), (-0.99, 0.99)]
                result = minimize(heston_loss, initial_guess, args=(returns,), method='L-BFGS-B', bounds=bounds)
                heston_params[ticker] = result.x
                
            except Exception as e:
                # Use default parameters if calibration fails
                heston_params[ticker] = [3.0, 0.04, 0.5, -0.7]

        # =================== Heston Simulation ================================
        np.random.seed(SEED)
        S = np.zeros((N_DAYS_FORWARD + 1, N_PATHS, n_assets))
        V = np.zeros((N_DAYS_FORWARD + 1, N_PATHS, n_assets))

        # Initialize starting prices - handle both DataFrame and Series
        if hasattr(price_data, 'values'):
            if len(price_data.shape) == 2:
                starting_prices = price_data.iloc[-1].values
            else:
                starting_prices = np.array([price_data.iloc[-1]])
        else:
            starting_prices = np.array([price_data.iloc[-1]])
        
        S[0] = starting_prices * np.ones((N_PATHS, n_assets))
        
        # Initialize volatility with calibrated long-term variance
        for i in range(n_assets):
            _, theta, _, _ = heston_params[TICKERS[i]]
            V[0, :, i] = theta

        # Heston simulation
        for t in range(1, N_DAYS_FORWARD + 1):
            Z_uncorr = np.random.normal(size=(N_PATHS, n_assets))
            Z_vol = np.random.normal(size=(N_PATHS, n_assets))

            for i, ticker in enumerate(TICKERS):
                kappa, theta, xi, rho = heston_params[ticker]
                Z_price = rho * Z_vol[:, i] + np.sqrt(1 - rho ** 2) * Z_uncorr[:, i]

                V[t, :, i] = np.abs(V[t-1, :, i] + kappa * (theta - V[t-1, :, i]) * dt + xi * np.sqrt(V[t-1, :, i] * dt) * Z_vol[:, i])
                S[t, :, i] = S[t-1, :, i] * np.exp((mu_vec[i] - 0.5 * V[t, :, i]) * dt + np.sqrt(V[t, :, i] * dt) * Z_price)

        # =================== Portfolio Aggregation ============================
        final_prices = S[-1]  # shape: (N_PATHS, n_assets)
        
        # Get last prices for normalization - handle both DataFrame and Series
        if hasattr(price_data, 'values'):
            if len(price_data.shape) == 2:
                last_prices_array = price_data.iloc[-1].values
            else:
                last_prices_array = np.array([price_data.iloc[-1]])
        else:
            last_prices_array = S[0, 0, :]
        
        # Convert proportional weights to actual share counts
        # WEIGHTS are proportions (0.1, 0.1, etc.), need to convert to share counts
        portfolio_value_at_start = np.sum(last_prices_array * WEIGHTS)
        share_counts = (WEIGHTS * INITIAL_PORTFOLIO_VALUE) / last_prices_array
        
        # Calculate final portfolio values using share counts
        final_portfolio_values = final_prices.dot(share_counts)

        # =================== Risk Metrics ====================================
        VaR_value = np.percentile(final_portfolio_values, 100 * (1 - CONFIDENCE_LEVEL))
        VaR_dollar = INITIAL_PORTFOLIO_VALUE - VaR_value
        VaR_pct = VaR_dollar / INITIAL_PORTFOLIO_VALUE
        CVaR_value = final_portfolio_values[final_portfolio_values <= VaR_value].mean()
        CVaR_dollar = INITIAL_PORTFOLIO_VALUE - CVaR_value
        lower_bound = np.percentile(final_portfolio_values, 5)
        upper_bound = np.percentile(final_portfolio_values, 95)
        mean_value = np.mean(final_portfolio_values)

        return HestonResponse(
            final_distribution=final_portfolio_values.tolist(),
            var_value=float(VaR_value),
            var_dollar=float(VaR_dollar),
            var_percent=float(VaR_pct),
            cvar_value=float(CVaR_value),
            cvar_dollar=float(CVaR_dollar),
            lower_bound=float(lower_bound),
            upper_bound=float(upper_bound),
            mean_value=float(mean_value),
            initial_value=INITIAL_PORTFOLIO_VALUE,
            confidence_level=CONFIDENCE_LEVEL,
            message="Heston simulation completed successfully with calibrated parameters."
        )
    except Exception as e:
        return HestonResponse(
            final_distribution=[],
            var_value=0.0,
            var_dollar=0.0,
            var_percent=0.0,
            cvar_value=0.0,
            cvar_dollar=0.0,
            lower_bound=0.0,
            upper_bound=0.0,
            mean_value=0.0,
            initial_value=request.initial_value,
            confidence_level=request.confidence_level,
            message=f"Error: {str(e)}"
        )

# Black-Litterman optimization endpoint
@app.post("/api/portfolio/black-litterman", response_model=BlackLittermanResponse)
async def black_litterman_optimization(request: BlackLittermanRequest = Body(...)):
    try:
        # Validate input tickers
        if not request.tickers or len(request.tickers) == 0:
            raise HTTPException(status_code=400, detail="At least one ticker must be provided")
        
        # Clean and validate tickers
        valid_tickers = []
        for ticker in request.tickers:
            if ticker and isinstance(ticker, str) and ticker.strip():
                valid_tickers.append(ticker.strip().upper())
        
        if not valid_tickers:
            raise HTTPException(status_code=400, detail="No valid tickers provided")
        
        if len(valid_tickers) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 tickers allowed")
        
        # Update request with cleaned tickers
        request.tickers = valid_tickers
        # Initialize the optimizer
        optimizer = EnhancedBlackLittermanOptimizer(
            tickers=request.tickers,
            period=request.period or "2y",
            tau=request.tau or 0.05,
            rf_rate=request.rf_rate or 0.045,
            include_dividends=request.include_dividends if request.include_dividends is not None else True
        )
        
        # Fetch market data
        try:
            fetch_result = optimizer.fetch_market_data()
            if fetch_result is False:
                raise HTTPException(status_code=400, detail="Failed to fetch market data for the provided tickers")
        except Exception as e:
            print(f"Error fetching market data: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to fetch market data: {str(e)}")
        
        # Run optimization with user views
        posterior_returns, optimal_weights = optimizer.optimize_portfolio(request.views, request.confidences)
        
        if posterior_returns is None or optimal_weights is None:
            raise HTTPException(status_code=500, detail="Optimization failed")
        
        # Calculate portfolio statistics
        raw_portfolio_stats = optimizer.calculate_portfolio_stats(optimal_weights, posterior_returns)
        
        # Convert to dictionaries for JSON response - ensure all numpy types are converted
        def convert_numpy_types(obj: Any) -> Any:
            """Convert numpy types to native Python types for JSON serialization"""
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            return obj
        
        # Get comprehensive portfolio summary (this returns a dict, not prints)
        try:
            portfolio_summary = optimizer.print_comprehensive_summary(optimal_weights, posterior_returns)
            if portfolio_summary is None:
                # Fallback: create summary manually
                portfolio_summary = optimizer.get_comprehensive_portfolio_summary(optimal_weights, posterior_returns)
        except Exception as e:
            print(f"Error getting portfolio summary: {str(e)}")
            # Fallback: create basic summary
            portfolio_summary = {
                'portfolio_stats': raw_portfolio_stats,
                'comparison_table': [],
                'allocation_summary': [],
                'key_insights': [],
                'model_parameters': {}
            }
        
        # Convert types for JSON serialization
        optimal_weights_dict = convert_numpy_types(optimal_weights.to_dict())
        posterior_returns_dict = convert_numpy_types(posterior_returns.to_dict())
        portfolio_summary = convert_numpy_types(portfolio_summary)
        
        # Extract components for backward compatibility
        portfolio_stats = portfolio_summary.get('portfolio_stats', raw_portfolio_stats)
        comparison_table = portfolio_summary.get('comparison_table', [])
        
        # Get stock information for backward compatibility
        try:
            stock_info = convert_numpy_types(optimizer.get_stock_info())
        except Exception as e:
            print(f"Error getting stock info: {str(e)}")
            stock_info = {}
        
        # Ensure portfolio_stats has correct keys for frontend
        portfolio_stats['expected_return'] = portfolio_stats.get('expected_return', 0.0)
        portfolio_stats['volatility'] = portfolio_stats.get('volatility', 0.0)
        portfolio_stats['sharpe_ratio'] = portfolio_stats.get('sharpe_ratio', 0.0)
        portfolio_stats['dividend_yield'] = portfolio_stats.get('portfolio_dividend_yield', 0.0)
        
        return BlackLittermanResponse(
            optimal_weights=optimal_weights_dict,
            posterior_returns=posterior_returns_dict,
            portfolio_stats=portfolio_stats,
            comparison_table=comparison_table,
            stock_info=stock_info,
            message="Black-Litterman optimization completed successfully",
            allocation_summary=portfolio_summary['allocation_summary'],
            key_insights=portfolio_summary['key_insights'],
            model_parameters=portfolio_summary['model_parameters']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")

# EFT (Efficient Frontier Theory) optimization endpoint
@app.post("/api/portfolio/eft", response_model=EFTResponse)
async def eft_optimization(request: EFTRequest = Body(...)):
    """
    Efficient Frontier Theory (EFT) portfolio optimization endpoint.
    
    This endpoint performs comprehensive portfolio analysis using Efficient Frontier,
    including efficient frontier calculation, Monte Carlo simulation, and benchmark comparison.
    Matches the exact logic from the original notebook.
    """
    try:
        # Validate input tickers first
        if not request.tickers or len(request.tickers) == 0:
            raise HTTPException(status_code=400, detail="At least one ticker must be provided")
        
        # Clean and validate tickers
        valid_tickers = []
        for ticker in request.tickers:
            if ticker and isinstance(ticker, str) and ticker.strip():
                valid_tickers.append(ticker.strip().upper())
        
        if not valid_tickers:
            raise HTTPException(status_code=400, detail="No valid tickers provided")
        
        if len(valid_tickers) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 tickers allowed")
        
        # Update request with cleaned tickers
        request.tickers = valid_tickers
        
        print(f"[EFT LOG] Received request for tickers: {request.tickers}")
        print(f"[EFT LOG] Weights: {request.weights}")
        print(f"[EFT LOG] Date range: {request.start_date} to {request.end_date}")
        
        # Validate inputs
        if len(request.tickers) != len(request.weights):
            raise HTTPException(
                status_code=400, 
                detail="Number of tickers must match number of weights"
            )
        
        if not np.isclose(sum(request.weights), 1.0, atol=1e-3):
            raise HTTPException(
                status_code=400,
                detail="Weights must sum to 1.0"
            )
        
        if any(w < 0 for w in request.weights):
            raise HTTPException(
                status_code=400,
                detail="Weights cannot be negative"
            )
        
        # Prepare portfolio data
        tickers_and_weights = dict(zip(request.tickers, request.weights))
        # Use exact same default weight bounds as original notebook
        weight_bounds = (request.weight_bounds[0], request.weight_bounds[1]) if request.weight_bounds and len(request.weight_bounds) >= 2 else (0.01, 0.30)
        
        print(f"[EFT LOG] Using weight bounds: {weight_bounds}")
        
        # Initialize EFT optimizer
        optimizer = EFTOptimizer(
            tickers_and_weights=tickers_and_weights,
            start_date=request.start_date,
            end_date=request.end_date,
            risk_free_rate=request.risk_free_rate or 0.02,
            weight_bounds=weight_bounds
        )
        
        # Run comprehensive analysis
        print(f"[EFT LOG] Starting comprehensive analysis...")
        analysis_results = optimizer.get_comprehensive_analysis()
        
        # Ensure all numpy types are converted to JSON-serializable types
        def convert_numpy_types(obj: Any) -> Any:
            """Convert numpy types to native Python types for JSON serialization"""
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            return obj
        
        # Convert analysis results
        analysis_results = convert_numpy_types(analysis_results)
        
        print(f"[EFT LOG] Analysis complete, returning results")
        
        return EFTResponse(
            portfolio_metrics=analysis_results['portfolio_metrics'],
            efficient_frontier=analysis_results['efficient_frontier'],
            monte_carlo_simulation=analysis_results['monte_carlo_simulation'],
            benchmarks=analysis_results['benchmarks'],
            composition=analysis_results['composition'],
            optimization_settings=analysis_results['optimization_settings'],
            message="EFT optimization completed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[EFT LOG] Error during optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"EFT optimization error: {str(e)}")

# Simple EFT endpoint for easy testing
@app.post("/api/portfolio/eft-simple", response_model=EFTResponse)
async def eft_optimization_simple(request: SimpleEFTRequest = Body(...)):
    """
    Simplified EFT endpoint - just provide tickers and get analysis!
    
    This endpoint creates equal weights for all provided tickers and uses sensible defaults.
    Perfect for quick testing and analysis.
    """
    try:
        # Validate tickers
        if not request.tickers or len(request.tickers) == 0:
            raise HTTPException(
                status_code=400,
                detail="At least one ticker must be provided"
            )
        
        if len(request.tickers) > 20:
            raise HTTPException(
                status_code=400,
                detail="Maximum 20 tickers allowed"
            )
        
        # Create equal weights for all tickers
        equal_weight = 1.0 / len(request.tickers)
        weights = [equal_weight] * len(request.tickers)
        
        # Use today's date as end date
        end_date = pd.to_datetime('today').strftime('%Y-%m-%d')
        
        # Prepare portfolio data
        tickers_and_weights = dict(zip(request.tickers, weights))
        weight_bounds = (request.weight_bounds_min or 0.01, request.weight_bounds_max or 0.30)
        
        # Initialize EFT optimizer
        optimizer = EFTOptimizer(
            tickers_and_weights=tickers_and_weights,
            start_date=request.start_date or "2020-01-01",
            end_date=end_date,
            risk_free_rate=request.risk_free_rate or 0.02,
            weight_bounds=weight_bounds
        )
        
        # Run comprehensive analysis
        analysis_results = optimizer.get_comprehensive_analysis()
        
        # Ensure all numpy types are converted to JSON-serializable types
        def convert_numpy_types(obj: Any) -> Any:
            """Convert numpy types to native Python types for JSON serialization"""
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            return obj
        
        # Convert analysis results
        analysis_results = convert_numpy_types(analysis_results)
        
        return EFTResponse(
            portfolio_metrics=analysis_results['portfolio_metrics'],
            efficient_frontier=analysis_results['efficient_frontier'],
            monte_carlo_simulation=analysis_results['monte_carlo_simulation'],
            benchmarks=analysis_results['benchmarks'],
            composition=analysis_results['composition'],
            optimization_settings=analysis_results['optimization_settings'],
            message=f"Simple EFT analysis completed for {len(request.tickers)} stocks with equal weights"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simple EFT analysis error: {str(e)}")

@app.post("/api/portfolio/backtest")
async def run_backtest(request: BacktestRequest):
    try:
        price_data, log_returns = fetch_data(
            request.tickers,
            request.benchmark,
            request.start_date,
            request.end_date
        )
        result = calculate_metrics_and_charts(
            price_data,
            log_returns,
            request.tickers,
            np.array(request.weights),
            request.benchmark,
            request.start_date,
            request.end_date,
            request.risk_free_rate,
            request.initial_value,
            request.n_simulations,
            request.n_days
        )
        scenarioResults, scenarioDistributions = scenario_stress_test(
            price_data,
            log_returns,
            request.tickers,
            np.array(request.weights),
            request.benchmark,
            n_sim=1000,
            initial_amount=request.initial_value or 100000
        )
        return {**result, "scenarioResults": scenarioResults, "scenarioDistributions": scenarioDistributions}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "message": "Quant IQ Vision API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "eft_analysis": "/api/portfolio/eft",
            "eft_simple": "/api/portfolio/eft-simple (🚀 Easy testing: just provide tickers!)",
            "monte_carlo": "/api/portfolio/montecarlo",
            "heston": "/api/portfolio/heston",
            "black_litterman": "/api/portfolio/black-litterman",
            "backtest": "/api/portfolio/backtest"
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    ) 