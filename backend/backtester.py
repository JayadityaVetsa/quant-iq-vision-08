import yfinance as yf
import numpy as np
import pandas as pd

# =============================
# SECTION 1: CONFIGURABLE DEFAULTS
# =============================
DEFAULT_BENCHMARK = 'SPY'
DEFAULT_RISK_FREE_RATE = 0.02
DEFAULT_INITIAL_PORTFOLIO_VALUE = 100000
DEFAULT_N_SIMULATIONS = 10000
DEFAULT_N_DAYS = 252

# =============================
# SECTION 2: DATA FETCHING
# =============================
def fetch_data(tickers, benchmark, start_date, end_date):
    tickers_to_fetch = list(set(tickers + [benchmark]))
    price_data = yf.download(tickers_to_fetch, start='1985-01-01', end=end_date, auto_adjust=False, progress=False)['Adj Close'].dropna(how="all")
    log_returns = np.log(price_data / price_data.shift(1)).dropna(how="all", axis=0)
    return price_data, log_returns

# =============================
# SECTION 3: MONTE CARLO SIMULATION
# =============================
def run_monte_carlo_simulation(log_returns, last_prices, tickers, weights, n_simulations, n_days, initial_value):
    mean_log_returns = log_returns[tickers].mean()
    portfolio_cov_matrix = log_returns[tickers].cov()
    chol_matrix = np.linalg.cholesky(portfolio_cov_matrix)
    drift = mean_log_returns.values - 0.5 * np.diag(portfolio_cov_matrix)
    sim_paths = np.zeros((n_days + 1, n_simulations))
    sim_paths[0, :] = initial_value
    scale_factor = initial_value / (last_prices.values @ weights)
    for i in range(n_simulations):
        shocks = np.random.normal(0, 1, size=(n_days, len(tickers)))
        daily_returns = np.exp(drift + (chol_matrix @ shocks.T).T)
        price_paths = last_prices.values * np.cumprod(daily_returns, axis=0)
        sim_paths[1:, i] = (price_paths @ weights) * scale_factor
    return sim_paths

# =============================
# SECTION 4: METRICS & CHART DATA
# =============================
def calculate_metrics_and_charts(price_data, log_returns, tickers, weights, benchmark, start_date, end_date, risk_free_rate, initial_value, n_simulations, n_days):
    # Slice user period
    price_data_user = price_data.loc[start_date:end_date]
    log_returns_user = log_returns.loc[start_date:end_date]
    last_prices = price_data_user[tickers].iloc[-1]
    portfolio_returns = (log_returns_user[tickers] * weights).sum(axis=1)
    benchmark_returns = log_returns_user[benchmark]
    sim_paths = run_monte_carlo_simulation(log_returns_user, last_prices, tickers, weights, n_simulations, n_days, initial_value)
    # Risk Gauge
    annual_vol = portfolio_returns.std() * np.sqrt(252)
    var_6mo = annual_vol * np.sqrt(0.5) * 1.645
    risk_index = np.interp(var_6mo, [0.02, 0.05, 0.12, 0.18, 0.25, 0.35], [20, 35, 60, 80, 90, 95])
    risk_index = float(np.clip(risk_index, 1, 99))
    # Weights Pie Chart
    weights_dict = {t: float(w) for t, w in zip(tickers, weights)}
    # Min Volatility Portfolio (naive: lowest std dev single asset)
    min_vol_idx = np.argmin([log_returns_user[t].std() for t in tickers])
    min_vol_weights = np.zeros(len(tickers))
    min_vol_weights[min_vol_idx] = 1.0
    min_vol_returns = (log_returns_user[tickers] * min_vol_weights).sum(axis=1)
    min_vol_annual_vol = min_vol_returns.std() * np.sqrt(252)
    min_vol_annual_ret = np.exp(min_vol_returns.mean() * 252) - 1
    min_vol_sharpe = (min_vol_annual_ret - risk_free_rate) / min_vol_annual_vol
    min_vol_chart = {
        'weights': {t: float(w) for t, w in zip(tickers, min_vol_weights)},
        'annual_vol': float(min_vol_annual_vol),
        'annual_ret': float(min_vol_annual_ret),
        'sharpe': float(min_vol_sharpe)
    }
    # Efficient Frontier (simulate random portfolios)
    n_points = 50
    ef_data = []
    for _ in range(n_points):
        w = np.random.dirichlet(np.ones(len(tickers)), 1)[0]
        ret = np.exp((log_returns_user[tickers] * w).sum(axis=1).mean() * 252) - 1
        vol = (log_returns_user[tickers] * w).sum(axis=1).std() * np.sqrt(252)
        ef_data.append({'weights': {t: float(wi) for t, wi in zip(tickers, w)}, 'annual_ret': float(ret), 'annual_vol': float(vol)})
    # Comparison Chart Data
    annual_ret = np.exp(portfolio_returns.mean() * 252) - 1
    sharpe = (annual_ret - risk_free_rate) / annual_vol
    comparison = {
        'currentPortfolio': {
            'weights': weights_dict,
            'annual_ret': float(annual_ret),
            'annual_vol': float(annual_vol),
            'sharpe': float(sharpe),
            'riskIndex': risk_index
        },
        'minVolatilityPortfolio': min_vol_chart,
        'efficientFrontier': ef_data
    }
    return {
        'riskIndex': risk_index,
        'weights': weights_dict,
        'minVolatility': min_vol_chart,
        'efficientFrontier': ef_data,
        'comparison': comparison
    }

SCENARIO_EVENTS = [
    {"label": "1987 Black Monday", "start": "1987-10-01", "end": "1987-11-30"},
    {"label": "1998 LTCM/Russia Default", "start": "1998-07-01", "end": "1998-10-01"},
    {"label": "2000 Dot-Com Bust", "start": "2000-03-01", "end": "2001-04-30"},
    {"label": "2008 Global Financial Crisis", "start": "2008-09-01", "end": "2009-03-01"},
    {"label": "2011 US Debt Ceiling/Euro Crisis", "start": "2011-07-01", "end": "2011-11-30"},
    {"label": "2015-16 China/Commodities Crash", "start": "2015-07-01", "end": "2016-03-01"},
    {"label": "2018 Q4 Rate Panic", "start": "2018-09-01", "end": "2018-12-31"},
    {"label": "2020 COVID Crash", "start": "2020-02-15", "end": "2020-04-15"},
    {"label": "2022 Rate Hikes Slowdown", "start": "2022-01-01", "end": "2022-10-15"},
    {"label": "2020-2021 Bull Rally", "start": "2020-04-16", "end": "2021-12-31"}
]

def scenario_stress_test(price_data, log_returns, tickers, weights, benchmark, scenario_events=SCENARIO_EVENTS, n_sim=1000, initial_amount: float=100000.0):
    scenarioResults = []
    scenarioDistributions = []
    for event in scenario_events:
        try:
            window_returns = log_returns.loc[event["start"]:event["end"]]
            available_tickers = [t for t in tickers if t in window_returns.columns and not window_returns[t].isnull().any()]
            window_bench = benchmark if benchmark in window_returns.columns else None
            if len(available_tickers) < 2 or window_bench is None:
                continue
            scenario_weights = np.array([1/len(available_tickers)] * len(available_tickers))
            event_returns = window_returns[available_tickers]
            event_bench_returns = window_returns[window_bench]
            avg_days = len(event_returns)
            col_mean = event_returns.mean()
            col_cov = event_returns.cov()
            drift = col_mean.values - 0.5 * np.diag(col_cov)
            chol = np.linalg.cholesky(col_cov)
            sim_len = avg_days
            # Use the last available price from the window instead of exact end date
            last_prices = price_data[available_tickers].loc[window_returns.index[-1]]
            sim_paths = np.zeros((sim_len + 1, n_sim))
            sim_paths[0, :] = initial_amount
            scale_factor = initial_amount / (last_prices.values @ scenario_weights)
            for i in range(n_sim):
                shocks = np.random.normal(0, 1, size=(sim_len, len(available_tickers)))
                daily_returns = np.exp(drift + (chol @ shocks.T).T)
                price_paths = last_prices.values * np.cumprod(daily_returns, axis=0)
                sim_paths[1:, i] = (price_paths @ scenario_weights) * scale_factor
            portfolio_outcomes = sim_paths[-1]
            bench_compound_ret = (np.exp(event_bench_returns.cumsum()) * initial_amount).iloc[-1]
            bench_drawdown = (bench_compound_ret - initial_amount) / initial_amount
            drawdown = (portfolio_outcomes - initial_amount) / initial_amount
            scenarioResults.append({
                "Event": event["label"],
                "Scenario Length (days)": sim_len,
                "Stocks Used": ", ".join(available_tickers),
                "Portfolio Mean Return": float(np.mean(drawdown)),
                "Benchmark Return": float(bench_drawdown),
            })
            scenarioDistributions.append({
                "eventLabel": f"Stress Test: {event['label']} ({sim_len}d, {len(available_tickers)} stocks)",
                "returns": drawdown.tolist(),
                "portfolioMean": float(np.mean(drawdown)),
                "benchmark": float(bench_drawdown)
            })
        except Exception as e:
            print(f"Skipping scenario {event['label']} due to error: {e}")
            continue
    return scenarioResults, scenarioDistributions 