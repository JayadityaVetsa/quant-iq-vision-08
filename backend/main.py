from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
from datetime import datetime
import os
from dotenv import load_dotenv
import numpy as np
import pandas as pd
import yfinance as yf
from scipy.optimize import minimize

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
        "http://localhost:3000",  # Alternative dev port
        "http://127.0.0.1:5173",
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
    tickers: list[str]
    weights: list[float]
    start_date: str
    end_date: str
    initial_value: float = 100000
    n_simulations: int = 10000
    n_days: int = 252
    benchmark: str = "SPY"

class MonteCarloResponse(BaseModel):
    percentiles: Dict[str, list[float]]
    mean_path: list[float]
    final_distribution: list[float]
    var_5: float
    mean_final: float
    probability_of_loss: float
    normalized_prices: Dict[str, list[float]]
    normalized_dates: list[str]
    return_distributions: Dict[str, list[float]]
    correlation_matrix: Dict[str, Dict[str, float]]
    message: str

class HestonRequest(BaseModel):
    tickers: list[str]
    weights: list[float]
    start_date: str
    end_date: str
    initial_value: float = 100000
    n_paths: int = 10000
    n_days: int = 252
    confidence_level: float = 0.90
    kappa: float = 3.0
    theta: float = 0.04
    xi: float = 0.5
    rho: float = -0.7

class HestonResponse(BaseModel):
    final_distribution: list[float]
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
        TICKERS = request.tickers
        WEIGHTS = np.array(request.weights)
        START_DATE = request.start_date
        END_DATE = request.end_date
        INITIAL_PORTFOLIO_VALUE = request.initial_value
        N_SIMULATIONS = request.n_simulations
        N_DAYS = request.n_days
        BENCHMARK = request.benchmark

        tickers_to_fetch = TICKERS + [BENCHMARK]
        price_data = yf.download(tickers_to_fetch, start=START_DATE, end=END_DATE, auto_adjust=False)["Adj Close"].dropna()
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
        last_prices = price_data[TICKERS].iloc[-1].values
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
        TICKERS = request.tickers
        WEIGHTS = np.array(request.weights)
        START_DATE = request.start_date
        END_DATE = request.end_date
        INITIAL_PORTFOLIO_VALUE = request.initial_value
        N_PATHS = request.n_paths
        N_DAYS_FORWARD = request.n_days
        CONFIDENCE_LEVEL = request.confidence_level
        KAPPA = request.kappa
        THETA = request.theta
        XI = request.xi
        RHO = request.rho
        
        dt = 1 / 252
        SEED = 42
        WINDOW = 21  # Rolling window for realized vol

        # ======================= Data Download ================================
        # Download historical data for calibration (longer period)
        HISTORICAL_START_DATE = '2015-01-01'
        hist_price_data = yf.download(TICKERS, start=HISTORICAL_START_DATE, end=END_DATE, auto_adjust=True)['Close'].dropna()
        daily_returns = hist_price_data.pct_change().dropna()

        # Adjusted close prices for simulation and log returns
        data = yf.download(TICKERS, start=START_DATE, end=END_DATE, auto_adjust=True)
        price_data = data['Close'].dropna()

        log_returns = np.log(price_data / price_data.shift(1)).dropna()

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
            returns = log_returns[ticker].dropna()
            initial_guess = [3.0, np.var(returns) * 252, 0.5, -0.7]
            bounds = [(0.01, 10), (0.001, 0.5), (0.01, 2.0), (-0.99, 0.99)]
            result = minimize(heston_loss, initial_guess, args=(returns,), method='L-BFGS-B', bounds=bounds)
            heston_params[ticker] = result.x

        # =================== Heston Simulation ================================
        np.random.seed(SEED)
        S = np.zeros((N_DAYS_FORWARD + 1, N_PATHS, n_assets))
        V = np.zeros((N_DAYS_FORWARD + 1, N_PATHS, n_assets))

        S[0] = price_data.iloc[-1].values * np.ones((N_PATHS, n_assets))
        for i in range(n_assets):
            _, theta, _, _ = heston_params[TICKERS[i]]
            V[0, :, i] = theta

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
        final_portfolio_values = final_prices.dot(WEIGHTS)
        final_portfolio_values *= INITIAL_PORTFOLIO_VALUE / np.sum(price_data.iloc[-1].values * WEIGHTS)

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

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Quant IQ Vision API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
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