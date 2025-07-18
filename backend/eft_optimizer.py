import numpy as np
import pandas as pd
import yfinance as yf
import quantstats as qs
from pypfopt import EfficientFrontier, risk_models, expected_returns, objective_functions
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional, Union
import warnings
import time
warnings.filterwarnings('ignore')

# Helper function to safely convert values to float
def safe_float_conversion(value):
    """Safely convert a value to float, handling pandas Series and other types"""
    if hasattr(value, 'iloc'):
        # Handle pandas Series
        return float(value.iloc[0])
    elif hasattr(value, 'item'):
        # Handle numpy scalars
        return float(value.item())
    else:
        # Direct conversion for regular numbers
        return float(value)

# --- Sector Mapping for Benchmarking ---
SECTOR_ETF_MAP = {
    'Technology': 'XLK', 'Financial Services': 'XLF', 'Healthcare': 'XLV',
    'Consumer Cyclical': 'XLY', 'Industrials': 'XLI', 'Energy': 'XLE',
    'Consumer Defensive': 'XLP', 'Real Estate': 'XLRE', 'Utilities': 'XLU',
    'Basic Materials': 'XLB', 'Communication Services': 'XLC'
}

# --------------------------------------------------------------------------
# 📌 2. PORTFOLIO PROFILER CLASS
# --------------------------------------------------------------------------
class PortfolioProfiler:
    """A class to analyze and profile a given investment portfolio."""
    def __init__(self, tickers_and_weights, start_date, end_date, risk_free_rate, weight_bounds=(0, 1)):
        self.tickers = list(tickers_and_weights.keys())
        self.weights = np.array(list(tickers_and_weights.values()))
        self.start_date = start_date
        self.end_date = end_date
        self.risk_free_rate = risk_free_rate
        self.weight_bounds = weight_bounds # Store weight bounds
        self.data = None
        self.returns = None
        self.portfolio_return_series = None
        self.metrics = {}
        self.optimized_portfolios = {}
        self._download_data()
        self._calculate_returns()

    def _download_data(self):
        """Download stock data from yfinance and handle different data structures"""
        print(f"Downloading data for: {', '.join(self.tickers)}...")
        try:
            if len(self.tickers) == 1:
                # Handle single ticker case
                ticker = self.tickers[0]
                data = yf.download(ticker, start=self.start_date, end=self.end_date, auto_adjust=False)
                
                print(f"[DEBUG] Single ticker data type: {type(data)}")
                print(f"[DEBUG] Single ticker data shape: {data.shape}")
                print(f"[DEBUG] Single ticker data columns: {data.columns.tolist()}")
                
                # Handle different data structures returned by yfinance
                if isinstance(data, pd.DataFrame):
                    # Check if we have multi-index columns
                    if isinstance(data.columns, pd.MultiIndex):
                        # Multi-index columns case (e.g., [('Adj Close', 'SPY'), ('Close', 'SPY')])
                        adj_close_col = None
                        for col in data.columns:
                            if 'Adj Close' in str(col[0]):
                                adj_close_col = col
                                break
                        
                        if adj_close_col is not None:
                            self.data = pd.DataFrame({ticker: data[adj_close_col]})
                        else:
                            # Fallback to any close column
                            close_col = None
                            for col in data.columns:
                                if 'Close' in str(col[0]):
                                    close_col = col
                                    break
                            
                            if close_col is not None:
                                self.data = pd.DataFrame({ticker: data[close_col]})
                            else:
                                # Use the last column as a fallback
                                self.data = pd.DataFrame({ticker: data.iloc[:, -1]})
                    elif 'Adj Close' in data.columns:
                        # Regular case: DataFrame with single-level columns
                        self.data = pd.DataFrame({ticker: data['Adj Close']})
                    elif len(data.columns) > 0:
                        # Fallback: use the first column that looks like a close price
                        close_col = None
                        for col in data.columns:
                            if 'Close' in str(col) or 'close' in str(col):
                                close_col = col
                                break
                        
                        if close_col is not None:
                            self.data = pd.DataFrame({ticker: data[close_col]})
                        else:
                            # Use the last column as a fallback
                            self.data = pd.DataFrame({ticker: data.iloc[:, -1]})
                    else:
                        raise ValueError(f"No valid columns found in data for {ticker}")
                elif isinstance(data, pd.Series):
                    # Series case
                    self.data = pd.DataFrame({ticker: data})
                else:
                    raise ValueError(f"Unexpected data type returned for {ticker}: {type(data)}")
                    
            else:
                # Multiple tickers
                raw_data = yf.download(self.tickers, start=self.start_date, end=self.end_date, auto_adjust=False)
                
                if raw_data.empty:
                    raise ValueError("No data retrieved from yfinance")
                
                if isinstance(raw_data.columns, pd.MultiIndex):
                    # Multi-index columns (normal case for multiple tickers)
                    self.data = raw_data['Adj Close']
                else:
                    # Single level columns (edge case)
                    self.data = raw_data
            
            # Ensure we have valid data
            if self.data is None or self.data.empty:
                raise ValueError("No valid data after processing")
            
            # Forward fill then backward fill to handle missing values
            self.data.ffill(inplace=True)
            self.data.bfill(inplace=True)
            
            # Final check for any remaining NaN values
            if self.data.isna().any().any():
                print("Warning: Some NaN values remain after filling")
                # Drop any remaining NaN values
                self.data.dropna(inplace=True)
            
            print(f"Data processing complete. Final shape: {self.data.shape}")
            
        except Exception as e:
            print(f"Error downloading data: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise

    def _calculate_returns(self):
        self.returns = self.data.pct_change().dropna()
        self.portfolio_return_series = (self.returns * self.weights).sum(axis=1)

    def _calculate_risk_index(self, volatility):
        """Calculate risk index exactly as in the original notebook"""
        vol_points = [0.0, 0.05, 0.16, 0.25, 0.35]
        score_points = [0, 23, 73, 90, 100]
        return float(np.interp(volatility, vol_points, score_points))

    def run_analysis(self):
        """Run portfolio analysis exactly matching the original notebook logic"""
        print(f"Running analysis for portfolio: {self.tickers[0] if len(self.tickers)==1 else 'Custom'}...")
        
        # Calculate expected returns and covariance matrix
        mu = expected_returns.mean_historical_return(self.data)
        S = risk_models.sample_cov(self.data)
        
        # Try with original weight bounds first, then progressively relax
        weight_bounds_options = [
            self.weight_bounds,  # Original bounds (e.g., 0.01, 0.30)
            (0.01, 0.50),        # Slightly relaxed upper bound
            (0.01, 0.70),        # More relaxed upper bound
            (0.01, 1.0),         # Relaxed upper bound but keep minimum
            (0.0, 1.0)           # Fully relaxed (last resort)
        ]
        
        max_sharpe_weights = None
        max_sharpe_perf = None
        min_vol_weights = None
        min_vol_perf = None
        
        # Try Max Sharpe optimization with different weight bounds
        for i, bounds in enumerate(weight_bounds_options):
            try:
                ef_sharpe = EfficientFrontier(mu, S, weight_bounds=bounds)
                ef_sharpe.add_objective(objective_functions.L2_reg, gamma=0.1)
                max_sharpe_weights = ef_sharpe.max_sharpe(risk_free_rate=self.risk_free_rate)
                max_sharpe_perf = ef_sharpe.portfolio_performance(verbose=False, risk_free_rate=self.risk_free_rate)
                
                # Check if the result is reasonable (max weight < 0.8)
                max_weight = max(max_sharpe_weights.values())
                if max_weight < 0.8:
                    print(f"Max Sharpe optimization successful with bounds {bounds}")
                    break
                elif i < len(weight_bounds_options) - 1:
                    print(f"Max Sharpe result too concentrated (max weight: {max_weight:.2f}), trying relaxed bounds...")
                    continue
                else:
                    print(f"Max Sharpe optimization completed with bounds {bounds} (max weight: {max_weight:.2f})")
                    break
            except Exception as e:
                if i < len(weight_bounds_options) - 1:
                    print(f"Max Sharpe optimization failed with bounds {bounds}: {str(e)}, trying relaxed bounds...")
                    continue
                else:
                    print(f"Max Sharpe optimization failed with all bounds, using equal weights fallback")
                    # Fallback to equal weights
                    max_sharpe_weights = {ticker: 1.0/len(self.tickers) for ticker in self.tickers}
                    # Calculate performance for equal weights
                    equal_weights_array = np.array([1.0/len(self.tickers)] * len(self.tickers))
                    portfolio_return = np.dot(equal_weights_array, mu.values)
                    portfolio_volatility = np.sqrt(np.dot(equal_weights_array.T, np.dot(S.values, equal_weights_array)))
                    sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_volatility
                    max_sharpe_perf = (portfolio_return, portfolio_volatility, sharpe_ratio)
                    break
        
        # Try Min Volatility optimization with different weight bounds
        for i, bounds in enumerate(weight_bounds_options):
            try:
                ef_vol = EfficientFrontier(mu, S, weight_bounds=bounds)
                ef_vol.add_objective(objective_functions.L2_reg, gamma=0.1)
                min_vol_weights = ef_vol.min_volatility()
                min_vol_perf = ef_vol.portfolio_performance(verbose=False, risk_free_rate=self.risk_free_rate)
                
                # Check if the result is reasonable (max weight < 0.8)
                max_weight = max(min_vol_weights.values())
                if max_weight < 0.8:
                    print(f"Min Volatility optimization successful with bounds {bounds}")
                    break
                elif i < len(weight_bounds_options) - 1:
                    print(f"Min Volatility result too concentrated (max weight: {max_weight:.2f}), trying relaxed bounds...")
                    continue
                else:
                    print(f"Min Volatility optimization completed with bounds {bounds} (max weight: {max_weight:.2f})")
                    break
            except Exception as e:
                if i < len(weight_bounds_options) - 1:
                    print(f"Min Volatility optimization failed with bounds {bounds}: {str(e)}, trying relaxed bounds...")
                    continue
                else:
                    print(f"Min Volatility optimization failed with all bounds, using equal weights fallback")
                    # Fallback to equal weights
                    min_vol_weights = {ticker: 1.0/len(self.tickers) for ticker in self.tickers}
                    # Calculate performance for equal weights
                    equal_weights_array = np.array([1.0/len(self.tickers)] * len(self.tickers))
                    portfolio_return = np.dot(equal_weights_array, mu.values)
                    portfolio_volatility = np.sqrt(np.dot(equal_weights_array.T, np.dot(S.values, equal_weights_array)))
                    sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_volatility
                    min_vol_perf = (portfolio_return, portfolio_volatility, sharpe_ratio)
                    break
        
        # Store optimized portfolios
        self.optimized_portfolios['max_sharpe'] = {'weights': max_sharpe_weights, 'performance': max_sharpe_perf}
        self.optimized_portfolios['min_volatility'] = {'weights': min_vol_weights, 'performance': min_vol_perf}
        
        # Calculate metrics using quantstats (exactly as in original notebook)
        sharpe_result = qs.stats.sharpe(self.portfolio_return_series, rf=self.risk_free_rate)
        sortino_result = qs.stats.sortino(self.portfolio_return_series, rf=self.risk_free_rate)
        volatility_result = qs.stats.volatility(self.portfolio_return_series, annualize=True)
        max_drawdown_result = qs.stats.max_drawdown(self.portfolio_return_series)
        cagr_result = qs.stats.cagr(self.portfolio_return_series)
        
        # Convert results to float, handling pandas Series
        self.metrics['sharpe'] = safe_float_conversion(sharpe_result)
        self.metrics['sortino'] = safe_float_conversion(sortino_result)
        self.metrics['volatility'] = safe_float_conversion(volatility_result)
        self.metrics['max_drawdown'] = safe_float_conversion(max_drawdown_result)
        self.metrics['cagr'] = safe_float_conversion(cagr_result)
        self.metrics['risk_index'] = self._calculate_risk_index(self.metrics['volatility'])
        
        print(f"Analysis complete. Metrics: {self.metrics}")
        
        return self.metrics

# --------------------------------------------------------------------------
# 📌 3. SECTOR & BENCHMARK ANALYSIS
# --------------------------------------------------------------------------
def get_dominant_sector_and_benchmark(tickers_and_weights, sector_map):
    """
    Analyze portfolio sector exposure and determine dominant sector benchmark.
    Matches the exact logic from the original notebook.
    """
    print("\nFetching sector exposure...")
    sector_weights = {}
    for ticker, weight in tickers_and_weights.items():
        try:
            info = yf.Ticker(ticker).info
            sector = info.get('sector', 'Unknown')
            if sector in sector_weights: 
                sector_weights[sector] += weight
            else: 
                sector_weights[sector] = weight
            time.sleep(0.2)  # Match original notebook sleep timing
        except Exception:
            print(f"Could not fetch info for {ticker}. Assuming 'Unknown' sector.")
            sector = 'Unknown'
            if sector in sector_weights: 
                sector_weights[sector] += weight
            else: 
                sector_weights[sector] = weight
    
    if not sector_weights:
        print("No sector data found. Using S&P 500 as default.")
        return 'Unknown', 'SPY'
        
    dominant_sector = max(sector_weights, key=lambda x: sector_weights[x])
    benchmark_etf = sector_map.get(dominant_sector)
    if not benchmark_etf:
        print(f"No benchmark ETF found for '{dominant_sector}'. Using S&P 500.")
        return dominant_sector, 'SPY'
    print(f"Dominant Sector: {dominant_sector} ({benchmark_etf})")
    return dominant_sector, benchmark_etf

# --------------------------------------------------------------------------
# 📌 4. VISUALIZATION FUNCTIONS
# --------------------------------------------------------------------------
def plot_risk_gauge(risk_index, title):
    fig = go.Figure(go.Indicator(mode="gauge+number", value=risk_index, title={'text': title, 'font': {'size': 20}},
        gauge={'axis': {'range': [0, 100]}, 'bar': {'color': "#1f77b4"},
               'steps': [{'range': [0, 23], 'color': 'lightgreen'}, {'range': [23, 47], 'color': 'yellowgreen'},
                         {'range': [47, 78], 'color': 'gold'}, {'range': [78, 90], 'color': 'orange'},
                         {'range': [90, 100], 'color': 'red'}]}))
    fig.update_layout(height=300, margin={'t':30, 'b':30, 'l':30, 'r':30})
    return fig

def plot_composition_pie(weights, title):
    clean_weights = {k: v for k, v in weights.items() if v > 0.001}
    fig = go.Figure(data=[go.Pie(labels=list(clean_weights.keys()), values=list(clean_weights.values()), hole=.3, textinfo='percent+label')])
    fig.update_layout(title_text=title, title_x=0.5)
    return fig

def plot_efficient_frontier_cml(profiler, n_samples=10000):
    mu = expected_returns.mean_historical_return(profiler.data)
    S = risk_models.sample_cov(profiler.data)
    num_assets = len(mu)
    port_returns, port_vols, sharpe_ratios = [], [], []
    
    for _ in range(n_samples):
        weights = np.random.random(num_assets)
        weights /= np.sum(weights)
        ret = np.sum(mu * weights)
        vol = np.sqrt(np.dot(weights.T, np.dot(S, weights)))
        sharpe = (ret - profiler.risk_free_rate) / vol
        port_returns.append(ret)
        port_vols.append(vol)
        sharpe_ratios.append(sharpe)
    
    fig = go.Figure(go.Scatter(x=port_vols, y=port_returns, mode='markers',
        marker=dict(color=sharpe_ratios, colorscale='Viridis', showscale=True, size=5, colorbar=dict(title="Sharpe Ratio")), name='Simulated Portfolios'))
    
    min_vol_perf = profiler.optimized_portfolios['min_volatility']['performance']
    max_sharpe_perf = profiler.optimized_portfolios['max_sharpe']['performance']
    
    # Create efficient frontier curve
    try:
        ef_clone = EfficientFrontier(mu, S, weight_bounds=profiler.weight_bounds) 
        risk_range = np.linspace(min_vol_perf[1], max_sharpe_perf[1] * 1.1, 100)
        return_range = []
        for r in risk_range:
            try:
                ef_temp = EfficientFrontier(mu, S, weight_bounds=profiler.weight_bounds)
                weights = ef_temp.efficient_risk(r)
                return_range.append(ef_temp.portfolio_performance()[0])
            except ValueError:
                return_range.append(np.nan)
        
        # Remove NaN values
        valid_indices = ~np.isnan(return_range)
        risk_range = risk_range[valid_indices]
        return_range = np.array(return_range)[valid_indices]
        
        fig.add_trace(go.Scatter(x=risk_range, y=return_range, mode='lines', name='Efficient Frontier', line=dict(color='black', width=2, dash='dash')))
    except Exception as e:
        print(f"Warning: Could not generate efficient frontier curve: {str(e)}")
    
    # Add individual assets
    individual_vols = np.sqrt(np.diag(S))
    fig.add_trace(go.Scatter(x=individual_vols, y=mu, mode='markers+text', text=profiler.tickers, textposition="top center",
        marker=dict(color='orange', size=10, symbol='circle-open'), name='Individual Assets'))
    
    # Add capital market line
    cml_x = [0, max_sharpe_perf[1]]
    cml_y = [profiler.risk_free_rate, max_sharpe_perf[0]]
    fig.add_trace(go.Scatter(x=cml_x, y=cml_y, mode='lines', name='Capital Market Line', line=dict(color='red', width=2)))
    
    # Add portfolio points
    fig.add_trace(go.Scatter(x=[profiler.metrics['volatility']], y=[profiler.metrics['cagr']], mode='markers', name='Your Portfolio', marker=dict(color='blue', size=14, symbol='star')))
    fig.add_trace(go.Scatter(x=[max_sharpe_perf[1]], y=[max_sharpe_perf[0]], mode='markers', name='Max Sharpe Portfolio', marker=dict(color='limegreen', size=14, symbol='diamond')))
    fig.add_trace(go.Scatter(x=[min_vol_perf[1]], y=[min_vol_perf[0]], mode='markers', name='Min Volatility Portfolio', marker=dict(color='purple', size=14, symbol='x')))
    
    fig.update_layout(title='Efficient Frontier, CML, & Asset Allocation', title_x=0.5, xaxis_title='Annualized Volatility (Risk)', yaxis_title='Annualized Return', yaxis_tickformat='.2%', xaxis_tickformat='.2%', legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1))
    return fig

def plot_metrics_comparison_bar(profiles, names):
    metrics_to_plot = ['risk_index', 'sharpe', 'volatility', 'max_drawdown']
    metric_names = ['Risk Index', 'Sharpe Ratio', 'Annualized Volatility', 'Max Drawdown']
    fig = go.Figure()
    
    for i, metric in enumerate(metrics_to_plot):
        values = [p.metrics[metric] for p in profiles]
        fig.add_trace(go.Bar(x=names, y=values, name=metric_names[i], visible=(i==0)))
    
    buttons = []
    for i, metric_name in enumerate(metric_names):
        visibility = [False] * len(metric_names)
        visibility[i] = True
        buttons.append(dict(label=metric_name, method="update", args=[{"visible": visibility}, {"title": f"Comparison: {metric_name}"}]))
    
    fig.update_layout(updatemenus=[dict(active=0, buttons=buttons, direction="down", pad={"r": 10, "t": 10}, showactive=True, x=0.1, xanchor="left", y=1.15, yanchor="top")], title_text="Comparison: Risk Index", title_x=0.5, yaxis_title="Value")
    return fig

# --------------------------------------------------------------------------
# 📌 5. FULL REPORT GENERATION
# --------------------------------------------------------------------------
def generate_full_report(portfolio_tickers, start_date, end_date, risk_free_rate, weight_bounds):
    """
    Generate comprehensive portfolio analysis report matching the original notebook logic exactly.
    """
    print(f"[EFT LOG] Starting analysis for portfolio: {list(portfolio_tickers.keys())}")
    
    # --- Analyze User Portfolio with constraints for optimization ---
    user_profile = PortfolioProfiler(portfolio_tickers, start_date, end_date, risk_free_rate, weight_bounds)
    user_profile.run_analysis()
    print(f"[EFT LOG] User portfolio analysis complete")
    
    # --- Analyze Benchmarks (no constraints needed) ---
    dominant_sector, sector_etf = get_dominant_sector_and_benchmark(portfolio_tickers, SECTOR_ETF_MAP)
    print(f"[EFT LOG] Dominant sector: {dominant_sector}, Benchmark ETF: {sector_etf}")
    
    # Analyze SPY benchmark
    spy_profile = None
    try:
        print(f"[EFT LOG] Starting SPY analysis...")
        spy_profile = PortfolioProfiler({'SPY': 1.0}, start_date, end_date, risk_free_rate)
        spy_profile.run_analysis()
        print(f"[EFT LOG] SPY analysis complete")
        print(f"[EFT LOG] SPY metrics keys: {list(spy_profile.metrics.keys())}")
        print(f"[EFT LOG] SPY metrics values: {spy_profile.metrics}")
        print(f"[EFT LOG] SPY data shape: {spy_profile.data.shape}")
        print(f"[EFT LOG] SPY returns shape: {spy_profile.returns.shape}")
        print(f"[EFT LOG] SPY portfolio return series shape: {spy_profile.portfolio_return_series.shape}")
    except Exception as e:
        print(f"[EFT LOG] Error analyzing SPY: {str(e)}")
        import traceback
        print(f"[EFT LOG] SPY traceback: {traceback.format_exc()}")
    
    # Analyze sector benchmark
    sector_profile = None
    try:
        sector_profile = PortfolioProfiler({sector_etf: 1.0}, start_date, end_date, risk_free_rate)
        sector_profile.run_analysis()
        print(f"[EFT LOG] {sector_etf} metrics: {sector_profile.metrics}")
    except Exception as e:
        print(f"[EFT LOG] Warning: Could not analyze {sector_etf}: {str(e)}")

    # --- Analyze Optimized Portfolios to get their individual stats ---
    max_sharpe_profile = None
    try:
        max_sharpe_profile = PortfolioProfiler(user_profile.optimized_portfolios['max_sharpe']['weights'], start_date, end_date, risk_free_rate)
        max_sharpe_profile.run_analysis()
        print(f"[EFT LOG] Max Sharpe portfolio analysis complete")
    except Exception as e:
        print(f"[EFT LOG] Warning: Could not analyze max sharpe portfolio: {str(e)}")
    
    # NEW: Run full analysis on the Min Volatility portfolio
    min_vol_profile = None
    try:
        min_vol_profile = PortfolioProfiler(user_profile.optimized_portfolios['min_volatility']['weights'], start_date, end_date, risk_free_rate)
        min_vol_profile.run_analysis()
        print(f"[EFT LOG] Min Volatility portfolio analysis complete")
    except Exception as e:
        print(f"[EFT LOG] Warning: Could not analyze min volatility portfolio: {str(e)}")

    # --- Generate Visuals (for compatibility, but not used in API) ---
    print(f"[EFT LOG] Analysis complete, returning results")
    
    results = {
        'user_profile': user_profile,
        'spy_profile': spy_profile,
        'sector_profile': sector_profile,
        'max_sharpe_profile': max_sharpe_profile,
        'min_vol_profile': min_vol_profile,
        'dominant_sector': dominant_sector,
        'sector_etf': sector_etf
    }
    
    return results

# --------------------------------------------------------------------------
# 📌 6. BACKEND ADAPTER CLASS
# --------------------------------------------------------------------------
class EFTOptimizer:
    """Backend adapter for the EFT analysis"""
    
    def __init__(self, tickers_and_weights: Dict[str, float], start_date: str, end_date: str, 
                 risk_free_rate: float = 0.02, weight_bounds: Tuple[float, float] = (0.01, 0.30)):
        self.tickers_and_weights = tickers_and_weights
        self.start_date = start_date
        self.end_date = end_date
        self.risk_free_rate = risk_free_rate
        self.weight_bounds = weight_bounds
        self.results = None
    
    def get_comprehensive_analysis(self) -> Dict[str, Any]:
        """Get complete portfolio analysis using the exact notebook code"""
        self.results = generate_full_report(
            self.tickers_and_weights, 
            self.start_date, 
            self.end_date, 
            self.risk_free_rate, 
            self.weight_bounds
        )
        
        user_profile = self.results['user_profile']
        spy_profile = self.results['spy_profile']
        sector_profile = self.results['sector_profile']
        max_sharpe_profile = self.results['max_sharpe_profile']
        min_vol_profile = self.results['min_vol_profile']
        
        # Generate efficient frontier data
        efficient_frontier = self._generate_efficient_frontier_data(user_profile)
        
        # Generate monte carlo data
        monte_carlo = self._generate_monte_carlo_data(user_profile)
        
        # Generate benchmark data
        benchmarks = {}
        if spy_profile:
            print(f"[EFT LOG] Adding SPY to benchmarks with metrics: {spy_profile.metrics}")
            benchmarks['S&P 500 (SPY)'] = spy_profile.metrics
        else:
            print(f"[EFT LOG] SPY profile is None, not adding to benchmarks")
        
        if sector_profile:
            sector_etf_name = f"{self.results['sector_etf']} (Sector)"
            print(f"[EFT LOG] Adding {sector_etf_name} to benchmarks with metrics: {sector_profile.metrics}")
            benchmarks[sector_etf_name] = sector_profile.metrics
        else:
            print(f"[EFT LOG] Sector profile is None, not adding to benchmarks")
        
        print(f"[EFT LOG] Final benchmarks structure: {benchmarks}")
        
        # Portfolio composition
        composition = {
            'current_weights': self.tickers_and_weights,
            'max_sharpe_weights': user_profile.optimized_portfolios['max_sharpe']['weights'],
            'min_volatility_weights': user_profile.optimized_portfolios['min_volatility']['weights'],
            'sector_exposure': {
                'dominant_sector': self.results['dominant_sector'],
                'benchmark_etf': self.results['sector_etf']
            }
        }
        
        # Add optimized portfolio metrics to main metrics
        portfolio_metrics = user_profile.metrics.copy()
        portfolio_metrics.update({
            'max_sharpe_return': user_profile.optimized_portfolios['max_sharpe']['performance'][0],
            'max_sharpe_volatility': user_profile.optimized_portfolios['max_sharpe']['performance'][1],
            'max_sharpe_sharpe': user_profile.optimized_portfolios['max_sharpe']['performance'][2],
            'min_vol_return': user_profile.optimized_portfolios['min_volatility']['performance'][0],
            'min_vol_volatility': user_profile.optimized_portfolios['min_volatility']['performance'][1],
            'min_vol_sharpe': user_profile.optimized_portfolios['min_volatility']['performance'][2],
        })
        # Add full metrics for max sharpe and min volatility portfolios
        if max_sharpe_profile:
            portfolio_metrics.update({
                'max_sharpe_sortino': max_sharpe_profile.metrics.get('sortino', 0),
                'max_sharpe_max_drawdown': max_sharpe_profile.metrics.get('max_drawdown', 0),
                'max_sharpe_risk_index': max_sharpe_profile.metrics.get('risk_index', 0),
            })
        if min_vol_profile:
            portfolio_metrics.update({
                'min_vol_sortino': min_vol_profile.metrics.get('sortino', 0),
                'min_vol_max_drawdown': min_vol_profile.metrics.get('max_drawdown', 0),
                'min_vol_risk_index': min_vol_profile.metrics.get('risk_index', 0),
            })
        
        return {
            'portfolio_metrics': portfolio_metrics,
            'efficient_frontier': efficient_frontier,
            'monte_carlo_simulation': monte_carlo,
            'benchmarks': benchmarks,
            'composition': composition,
            'optimization_settings': {
                'risk_free_rate': self.risk_free_rate,
                'weight_bounds': self.weight_bounds,
                'start_date': self.start_date,
                'end_date': self.end_date
            }
        }
    
    def _generate_efficient_frontier_data(self, user_profile) -> List[Dict[str, float]]:
        """Generate efficient frontier data points"""
        try:
            mu = expected_returns.mean_historical_return(user_profile.data)
            S = risk_models.sample_cov(user_profile.data)
            
            min_vol_perf = user_profile.optimized_portfolios['min_volatility']['performance']
            max_sharpe_perf = user_profile.optimized_portfolios['max_sharpe']['performance']
            
            # Generate risk range
            risk_range = np.linspace(min_vol_perf[1], max_sharpe_perf[1] * 1.2, 100)
            efficient_frontier = []
            
            for target_vol in risk_range:
                try:
                    ef = EfficientFrontier(mu, S, weight_bounds=(0.0, 1.0))  # Use relaxed bounds
                    ef.add_objective(objective_functions.L2_reg, gamma=0.1)
                    weights = ef.efficient_risk(target_vol)
                    performance = ef.portfolio_performance(verbose=False, risk_free_rate=self.risk_free_rate)
                    
                    efficient_frontier.append({
                        'return': safe_float_conversion(performance[0]),
                        'volatility': safe_float_conversion(performance[1]),
                        'sharpe': safe_float_conversion(performance[2])
                    })
                except (ValueError, Exception):
                    continue
            
            return efficient_frontier
        except Exception as e:
            print(f"Warning: Could not generate efficient frontier: {str(e)}")
            return []
    
    def _generate_monte_carlo_data(self, user_profile) -> Dict[str, List[float]]:
        """Generate Monte Carlo simulation data"""
        try:
            mu = expected_returns.mean_historical_return(user_profile.data)
            S = risk_models.sample_cov(user_profile.data)
            num_assets = len(mu)
            
            results = {
                'returns': [],
                'volatilities': [],
                'sharpe_ratios': []
            }
            
            for _ in range(10000):
                # Generate random weights
                weights = np.random.random(num_assets)
                weights /= np.sum(weights)
                
                # Calculate portfolio metrics
                portfolio_return = np.sum(mu * weights)
                portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(S, weights)))
                sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_volatility
                
                results['returns'].append(safe_float_conversion(portfolio_return))
                results['volatilities'].append(safe_float_conversion(portfolio_volatility))
                results['sharpe_ratios'].append(safe_float_conversion(sharpe_ratio))
            
            return results
        except Exception as e:
            print(f"Warning: Could not generate Monte Carlo data: {str(e)}")
            return {'returns': [], 'volatilities': [], 'sharpe_ratios': []} 