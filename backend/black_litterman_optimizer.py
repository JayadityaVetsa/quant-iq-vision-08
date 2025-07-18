import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional, Union
import warnings
warnings.filterwarnings('ignore')

class EnhancedBlackLittermanOptimizer:
    def __init__(self, tickers, period="2y", tau=0.05, rf_rate=0.045, include_dividends=True):
        """
        Enhanced Black-Litterman Portfolio Optimizer with Dividend Integration

        Parameters:
        - tickers: List of stock tickers
        - period: Historical data period (1y, 2y, 3y, 5y)
        - tau: Uncertainty scaling factor (typically 0.025-0.1)
        - rf_rate: Risk-free rate
        - include_dividends: Whether to incorporate dividend yields in optimization
        """
        self.tickers = tickers
        self.period = period
        self.tau = tau
        self.rf_rate = rf_rate
        self.include_dividends = include_dividends

        # Data storage with type annotations
        self.price_data: Optional[pd.DataFrame] = None
        self.returns_data: Optional[pd.DataFrame] = None
        self.dividend_data: Optional[Dict[str, pd.Series]] = None
        self.dividend_yields: Optional[Union[pd.Series, Dict[str, float]]] = None
        self.total_returns_data: Optional[pd.DataFrame] = None
        self.cov_matrix: Optional[pd.DataFrame] = None
        self.market_caps: Optional[Dict[str, float]] = None
        self.stock_fundamentals: Optional[Dict[str, Dict[str, Any]]] = None
        self.implied_returns: Optional[pd.Series] = None

    def fetch_market_data(self):
        """Fetch real market data including dividend information"""
        print("📡 Fetching comprehensive market data...")

        try:
            # Download price data with dividends
            data = yf.download(self.tickers, period=self.period, progress=False, auto_adjust=False)

            if len(self.tickers) == 1:
                # Handle single ticker case
                adj_close_data = data['Adj Close']
                self.price_data = pd.DataFrame({self.tickers[0]: adj_close_data}).dropna()
            else:
                self.price_data = data['Adj Close'].dropna()

            # Calculate price returns
            assert self.price_data is not None, "Price data should not be None"
            self.returns_data = self.price_data.pct_change().dropna()

            if self.include_dividends:
                print("💰 Processing dividend data...")
                self._fetch_dividend_data()
                self._calculate_total_returns()
            else:
                self.total_returns_data = self.returns_data.copy()

            # Calculate covariance matrix using appropriate returns
            returns_for_cov = self.total_returns_data if self.include_dividends else self.returns_data
            assert returns_for_cov is not None, "Returns data should not be None"
            self.cov_matrix = returns_for_cov.cov() * 252  # Annualized

            # Get real market caps and dividend information
            self._fetch_stock_fundamentals()

            # Calculate market-implied returns using proper CAMP approach
            self._calculate_implied_returns()

            print(f"✅ Successfully fetched data for {len(self.tickers)} stocks")
            if self.include_dividends and self.dividend_yields is not None:
                if isinstance(self.dividend_yields, pd.Series) and not self.dividend_yields.empty:
                    avg_div_yield = self.dividend_yields[self.dividend_yields > 0].mean()
                    print(f"📊 Average dividend yield: {avg_div_yield:.2%}")
                elif self.include_dividends:
                    print("📊 No dividend-paying stocks found in the selected period.")
            elif self.include_dividends:
                print("📊 No dividend-paying stocks found in the selected period.")

            return True

        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            return False

    def _fetch_dividend_data(self):
        """Fetch and process dividend data for each stock with corrected yield calculation."""
        self.dividend_data = {}
        self.dividend_yields = {}

        end_date = datetime.now()
        period_days = {'1y': 365, '2y': 730, '3y': 1095, '5y': 1825}
        start_date = end_date - timedelta(days=period_days.get(self.period, 730))

        for ticker in self.tickers:
            try:
                stock = yf.Ticker(ticker)
                dividends = stock.dividends

                if not dividends.empty:
                    if dividends.index.tz is not None:
                        dividends.index = dividends.index.tz_convert(None)

                    period_dividends = dividends[dividends.index >= start_date].copy()

                    if not period_dividends.empty:
                        last_price = self.price_data[ticker].iloc[-1] if ticker in self.price_data.columns and not self.price_data.empty else 0
                        annual_dividends = 0

                        if len(period_dividends) > 1:
                            # Calculate the average time between payments to find frequency
                            days_between_divs = period_dividends.index.to_series().diff().dt.days.dropna()
                            if not days_between_divs.empty and days_between_divs.mean() > 0:
                                avg_days_between = days_between_divs.mean()
                                payments_per_year = 365 / avg_days_between
                                
                                # Use the most recent dividend payment as the basis for annualization
                                last_payment_amount = period_dividends.iloc[-1]
                                annual_dividends = last_payment_amount * payments_per_year
                            else:
                                annual_dividends = period_dividends.sum()
                        elif len(period_dividends) == 1:
                            annual_dividends = period_dividends.sum()

                        dividend_yield = annual_dividends / last_price if last_price > 0 else 0
                        self.dividend_data[ticker] = period_dividends
                        self.dividend_yields[ticker] = dividend_yield
                    else:
                        self.dividend_data[ticker] = pd.Series(dtype=float)
                        self.dividend_yields[ticker] = 0.0
                else:
                    self.dividend_data[ticker] = pd.Series(dtype=float)
                    self.dividend_yields[ticker] = 0.0

            except Exception as e:
                print(f"⚠️  Warning: Could not fetch dividend data for {ticker}: {e}")
                self.dividend_data[ticker] = pd.Series(dtype=float)
                self.dividend_yields[ticker] = 0.0

        self.dividend_yields = pd.Series(self.dividend_yields)

    def _calculate_total_returns(self):
        """Calculate total returns incorporating both price changes and dividends"""
        print("🔄 Calculating total returns (price + dividends)...")

        self.total_returns_data = self.returns_data.copy()

        for ticker in self.tickers:
            if ticker in self.dividend_data and len(self.dividend_data[ticker]) > 0:
                dividend_series = self.dividend_data[ticker]

                for div_date, div_amount in dividend_series.items():
                    try:
                        price_dates = self.price_data.index
                        if price_dates.tz is not None:
                            price_dates = price_dates.tz_convert(None)

                        closest_dates = price_dates[price_dates >= div_date]
                        if len(closest_dates) > 0:
                            closest_date = closest_dates[0]
                            price_at_date = self.price_data[ticker].loc[closest_date]

                            if closest_date in self.total_returns_data.index and price_at_date > 0:
                                dividend_return = div_amount / price_at_date
                                self.total_returns_data.loc[closest_date, ticker] += dividend_return

                    except Exception as e:
                        continue

    def _fetch_stock_fundamentals(self):
        """Get market caps and additional fundamental data"""
        self.market_caps = {}
        self.stock_fundamentals = {}

        for ticker in self.tickers:
            try:
                stock = yf.Ticker(ticker)
                info = stock.info

                market_cap = info.get('marketCap', 0)
                if market_cap == 0 or market_cap is None:
                    shares = info.get('sharesOutstanding', info.get('impliedSharesOutstanding', 1e9))
                    price = self.price_data[ticker].iloc[-1] if ticker in self.price_data.columns else 100
                    market_cap = shares * price

                self.market_caps[ticker] = market_cap
                self.stock_fundamentals[ticker] = {
                    'name': info.get('longName', ticker),
                    'sector': info.get('sector', 'Unknown'),
                    'market_cap': market_cap,
                    'pe_ratio': info.get('trailingPE', 'N/A'),
                    'dividend_yield_yf': info.get('dividendYield', 0) or 0,
                    'payout_ratio': info.get('payoutRatio', 'N/A')
                }

            except Exception as e:
                print(f"⚠️  Warning: Could not fetch fundamentals for {ticker}: {e}")
                price = self.price_data[ticker].iloc[-1] if ticker in self.price_data.columns else 100
                self.market_caps[ticker] = 1e10  # 10B default
                self.stock_fundamentals[ticker] = {
                    'name': ticker,
                    'sector': 'Unknown',
                    'market_cap': 1e10,
                    'pe_ratio': 'N/A',
                    'dividend_yield_yf': 0,
                    'payout_ratio': 'N/A'
                }

    def _calculate_implied_returns(self):
        """Calculate market-implied equilibrium returns using proper methodology"""
        try:
            # Market cap weights
            total_market_cap = sum(self.market_caps.values())
            market_weights = pd.Series({ticker: cap/total_market_cap for ticker, cap in self.market_caps.items()})

            # Risk aversion parameter (typical range 2-5)
            risk_aversion = 3.0

            # Market-implied excess returns: π = λ * Σ * w_market
            cov_array = self.cov_matrix.values
            weights_array = market_weights.reindex(self.tickers).values

            implied_excess = risk_aversion * np.dot(cov_array, weights_array)

            # Convert to absolute returns by adding risk-free rate
            self.implied_returns = pd.Series(
                implied_excess + self.rf_rate,
                index=self.tickers
            )

            # Sanity check: implied returns should be reasonable (5-15% typically)
            for ticker in self.tickers:
                if self.implied_returns.loc[ticker] > 0.5:  # Cap at 50%
                    print(f"⚠️  Capping extreme implied return for {ticker}")
                    self.implied_returns.loc[ticker] = 0.15  # 15% cap
                elif self.implied_returns.loc[ticker] < 0:
                    self.implied_returns.loc[ticker] = 0.05  # 5% floor

        except Exception as e:
            print(f"⚠️  Warning: Using fallback implied returns calculation: {e}")
            # Fallback: use historical returns as proxy
            returns_for_implied = self.total_returns_data if self.include_dividends else self.returns_data
            historical_returns = returns_for_implied.mean() * 252
            self.implied_returns = historical_returns.reindex(self.tickers).fillna(0.08)

    def optimize_portfolio(self, views, confidences):
        """Run Black-Litterman optimization with corrected implementation"""
        print("\n🧠 Running Enhanced Black-Litterman optimization...")
        print(f"    {'📊 Using total returns (price + dividends)' if self.include_dividends else '📈 Using price returns only'}")

        try:
            # Convert views and confidences to proper format
            P = np.eye(len(self.tickers))  # Identity matrix for absolute views
            Q = np.array([views[ticker] for ticker in self.tickers])

            # Build omega matrix with proper scaling
            omega_diag = []
            for ticker in self.tickers:
                confidence = confidences[ticker]
                asset_variance = self.cov_matrix.loc[ticker, ticker]
                # Omega represents uncertainty - lower confidence = higher uncertainty
                omega_value = (1/confidence - 1) * self.tau * asset_variance
                omega_diag.append(omega_value)

            omega = np.diag(omega_diag)

            # Market cap weights
            total_market_cap = sum(self.market_caps.values())
            market_weights = np.array([self.market_caps[ticker]/total_market_cap for ticker in self.tickers])

            # Black-Litterman calculation
            cov_matrix = self.cov_matrix.values
            tau_cov_inv = np.linalg.inv(self.tau * cov_matrix)
            omega_inv = np.linalg.inv(omega)

            # Posterior precision matrix
            M1 = tau_cov_inv + P.T @ omega_inv @ P
            M1_inv = np.linalg.inv(M1)

            # Posterior expected returns
            pi = self.implied_returns.values  # Use calculated implied returns
            posterior_returns = M1_inv @ (tau_cov_inv @ pi + P.T @ omega_inv @ Q)

            # Posterior covariance matrix
            posterior_cov = M1_inv

            # Calculate optimal weights using mean-variance optimization
            ones = np.ones((len(self.tickers), 1))
            inv_cov = np.linalg.inv(posterior_cov)

            # Portfolio weights (assuming no constraints for simplicity)
            excess_returns = posterior_returns - self.rf_rate
            optimal_weights_array = (inv_cov @ excess_returns) / (ones.T @ inv_cov @ excess_returns)
            optimal_weights_array = optimal_weights_array.flatten()

            # Ensure weights are reasonable (between 0 and 1, sum to 1)
            optimal_weights_array = np.maximum(optimal_weights_array, 0)  # No short selling
            optimal_weights_array = optimal_weights_array / optimal_weights_array.sum()  # Normalize

            # Convert to series
            posterior_returns_series = pd.Series(posterior_returns, index=self.tickers)
            optimal_weights_series = pd.Series(optimal_weights_array, index=self.tickers)

            return posterior_returns_series, optimal_weights_series

        except Exception as e:
            print(f"❌ Optimization error: {e}")
            print("Falling back to equal weights...")
            # Fallback to equal weights
            equal_weights = pd.Series(1/len(self.tickers), index=self.tickers)
            fallback_returns = pd.Series([views[ticker] for ticker in self.tickers], index=self.tickers)
            return fallback_returns, equal_weights

    def calculate_portfolio_stats(self, weights, returns):
        """Calculate comprehensive portfolio statistics"""
        weights_array = weights.values
        returns_array = returns.values
        cov_array = self.cov_matrix.values

        # Portfolio metrics
        expected_return = np.dot(weights_array, returns_array)
        portfolio_variance = np.dot(weights_array.T, np.dot(cov_array, weights_array))
        portfolio_std = np.sqrt(portfolio_variance)
        sharpe_ratio = (expected_return - self.rf_rate) / portfolio_std if portfolio_std > 0 else 0

        # Risk contribution analysis
        marginal_contrib = np.dot(cov_array, weights_array)
        contrib_to_risk = weights_array * marginal_contrib / portfolio_variance if portfolio_variance > 0 else weights_array

        # Dividend analysis
        portfolio_dividend_yield = 0
        if self.include_dividends and self.dividend_yields is not None:
            for ticker in self.tickers:
                portfolio_dividend_yield += weights[ticker] * self.dividend_yields.get(ticker, 0)

        return {
            'expected_return': expected_return,
            'portfolio_std': portfolio_std,
            'portfolio_variance': portfolio_variance,
            'sharpe_ratio': sharpe_ratio,
            'portfolio_dividend_yield': portfolio_dividend_yield,
            'risk_contributions': dict(zip(self.tickers, contrib_to_risk))
        }

    def get_comprehensive_portfolio_summary(self, weights, returns, portfolio_value=100000):
        """Get comprehensive portfolio allocation summary with detailed breakdown"""
        stats = self.calculate_portfolio_stats(weights, returns)
        
        # Get latest prices
        latest_prices = {}
        for ticker in self.tickers:
            try:
                latest_prices[ticker] = self.price_data[ticker].iloc[-1]
            except:
                latest_prices[ticker] = 100  # fallback price

        # Calculate allocation details
        allocation_summary = []
        for ticker in self.tickers:
            weight = weights[ticker]
            investment_amount = portfolio_value * weight
            shares_to_buy = investment_amount / latest_prices[ticker]
            
            allocation_summary.append({
                'ticker': ticker,
                'company_name': self.stock_fundamentals[ticker]['name'],
                'final_weight': weight,
                'investment_amount': investment_amount,
                'shares_to_buy': shares_to_buy,
                'latest_price': latest_prices[ticker],
                'expected_return': returns[ticker],
                'dividend_yield': self.dividend_yields.get(ticker, 0) if self.dividend_yields is not None else 0,
                'risk_contribution': stats['risk_contributions'][ticker],
                'market_cap_weight': self.market_caps[ticker] / sum(self.market_caps.values()),
                'sector': self.stock_fundamentals[ticker]['sector']
            })

        # Sort by final weight descending
        allocation_summary.sort(key=lambda x: x['final_weight'], reverse=True)

        # Portfolio-level statistics
        portfolio_stats = {
            'expected_return': stats['expected_return'],
            'volatility': stats['portfolio_std'],
            'sharpe_ratio': stats['sharpe_ratio'],
            'portfolio_dividend_yield': stats['portfolio_dividend_yield'],
            'risk_free_rate': self.rf_rate,
            'tau_parameter': self.tau,
            'data_period': self.period,
            'dividend_integration': self.include_dividends,
            'number_of_stocks': len(self.tickers)
        }

        # Detailed comparison table
        comparison_data = []
        for ticker in self.tickers:
            market_weight = self.market_caps[ticker] / sum(self.market_caps.values())
            bl_weight = weights[ticker]
            
            comparison_data.append({
                'ticker': ticker,
                'market_implied_return': self.implied_returns[ticker],
                'your_view': returns[ticker],  # posterior return
                'bl_posterior_return': returns[ticker],
                'portfolio_weight': bl_weight,
                'market_cap_weight': market_weight,
                'dividend_yield': self.dividend_yields.get(ticker, 0) if self.dividend_yields is not None else 0,
                'view_vs_market': returns[ticker] - self.implied_returns[ticker],
                'weight_vs_market': bl_weight - market_weight,
                'expected_price_return': returns[ticker] - (self.dividend_yields.get(ticker, 0) if self.dividend_yields is not None else 0)
            })

        # Key insights
        insights = []
        
        # Largest position
        largest_position = max(allocation_summary, key=lambda x: x['final_weight'])
        insights.append(f"Largest position: {largest_position['ticker']} ({largest_position['final_weight']*100:.1f}%)")
        
        # Overweight vs market
        overweight_stocks = [item for item in allocation_summary if item['final_weight'] > item['market_cap_weight']]
        if len(overweight_stocks) > 0:
            overweight_tickers = [item['ticker'] for item in overweight_stocks]
            insights.append(f"Overweight vs market: {', '.join(overweight_tickers)}")
        
        # Underweight vs market
        underweight_stocks = [item for item in allocation_summary if item['final_weight'] < item['market_cap_weight']]
        if len(underweight_stocks) > 0:
            underweight_tickers = [item['ticker'] for item in underweight_stocks]
            insights.append(f"Underweight vs market: {', '.join(underweight_tickers)}")

        # Dividend analysis
        dividend_stocks = [item for item in allocation_summary if item['dividend_yield'] > 0.01]
        if len(dividend_stocks) > 0:
            dividend_contribution = sum(item['final_weight'] * item['dividend_yield'] for item in dividend_stocks)
            insights.append(f"Dividend-paying stocks contribute {dividend_contribution*100:.1f}% to portfolio yield")

        return {
            'allocation_summary': allocation_summary,
            'portfolio_stats': portfolio_stats,
            'comparison_table': comparison_data,
            'key_insights': insights,
            'model_parameters': {
                'tau': self.tau,
                'data_period': self.period,
                'dividend_integration': self.include_dividends,
                'number_of_stocks': len(self.tickers)
            }
        }

    def create_comparison_table(self, views, posterior_returns, weights):
        """Create comprehensive comparison table"""
        # Market cap weights
        total_market_cap = sum(self.market_caps.values())
        market_weights = {ticker: cap/total_market_cap for ticker, cap in self.market_caps.items()}

        comparison_df = pd.DataFrame({
            'Ticker': self.tickers,
            'Market_Implied_Return': [self.implied_returns[t] for t in self.tickers],
            'Your_View': [views[t] for t in self.tickers],
            'BL_Posterior_Return': [posterior_returns[t] for t in self.tickers],
            'Portfolio_Weight': [weights[t] for t in self.tickers],
            'Market_Cap_Weight': [market_weights[t] for t in self.tickers],
            'Dividend_Yield': [self.dividend_yields.get(t, 0) if self.include_dividends else 0 for t in self.tickers]
        })

        comparison_df['View_vs_Market'] = comparison_df['Your_View'] - comparison_df['Market_Implied_Return']
        comparison_df['Weight_vs_Market'] = comparison_df['Portfolio_Weight'] - comparison_df['Market_Cap_Weight']

        if self.include_dividends:
            comparison_df['Expected_Price_Return'] = comparison_df['BL_Posterior_Return'] - comparison_df['Dividend_Yield']

        return comparison_df

    def get_stock_info(self):
        """Get comprehensive stock information including dividend data"""
        stock_info = {}
        for ticker in self.tickers:
            info = self.stock_fundamentals.get(ticker, {})
            calculated_div_yield = self.dividend_yields.get(ticker, 0) if self.include_dividends else 0

            stock_info[ticker] = {
                'name': info.get('name', ticker),
                'sector': info.get('sector', 'Unknown'),
                'market_cap': info.get('market_cap', 0),
                'pe_ratio': info.get('pe_ratio', 'N/A'),
                'dividend_yield': calculated_div_yield,
                'yf_dividend_yield': info.get('dividend_yield_yf', 0),
                'payout_ratio': info.get('payout_ratio', 'N/A')
            }
        return stock_info 

    def print_comprehensive_summary(self, weights, returns, portfolio_value=100000):
        """Print comprehensive portfolio summary in a formatted way"""
        summary = self.get_comprehensive_portfolio_summary(weights, returns, portfolio_value)
        
        print("\n" + "="*80)
        print("✅ FINAL PORTFOLIO ALLOCATION SUMMARY")
        print("="*80)
        print(f"\nBased on a ${portfolio_value:,.2f} portfolio, here is your recommended allocation:")
        print("-" * 80)
        print(f"{'Ticker':<8} {'Company Name':<30} {'Final Weight':<12} {'Investment ($)':<15} {'Shares to Buy':<12} {'Latest Price':<12}")
        
        for item in summary['allocation_summary']:
            print(f"{item['ticker']:<8} {item['company_name'][:28]:<30} {item['final_weight']*100:>10.2f}% "
                  f"${item['investment_amount']:>13,.2f} {item['shares_to_buy']:>10.2f} ${item['latest_price']:>10.2f}")
        
        print("-" * 80)
        stats = summary['portfolio_stats']
        print(f"Projected Annual Return: {stats['expected_return']*100:.2f}%")
        print(f"Projected Annual Volatility (Risk): {stats['volatility']*100:.2f}%")
        print(f"Projected Portfolio Dividend Yield: {stats['portfolio_dividend_yield']*100:.2f}%")
        print("="*80)
        
        print("\n" + "="*80)
        print("📊 PORTFOLIO STATISTICS:")
        print("="*80)
        print(f"Expected Annual Return:        {stats['expected_return']*100:>8.2f}%")
        print(f"Annual Volatility:             {stats['volatility']*100:>8.2f}%")
        print(f"Sharpe Ratio:                  {stats['sharpe_ratio']:>8.3f}")
        print(f"Portfolio Dividend Yield:      {stats['portfolio_dividend_yield']*100:>8.2f}%")
        print(f"Risk-Free Rate:                {stats['risk_free_rate']*100:>8.1f}%")
        
        print("\n🔍 DETAILED COMPARISON TABLE:")
        print("-" * 140)
        print(f"{'Ticker':<8} {'Market_Implied_Return':<20} {'Your_View':<12} {'BL_Posterior_Return':<18} {'Portfolio_Weight':<16} {'Market_Cap_Weight':<16} {'Dividend_Yield':<14} {'View_vs_Market':<14} {'Weight_vs_Market':<16} {'Expected_Price_Return':<20}")
        
        for row in summary['comparison_table']:
            print(f"{row['ticker']:<8} {row['market_implied_return']*100:>18.3f}% {row['your_view']*100:>10.3f}% "
                  f"{row['bl_posterior_return']*100:>16.3f}% {row['portfolio_weight']*100:>14.2f}% "
                  f"{row['market_cap_weight']*100:>14.2f}% {row['dividend_yield']*100:>12.2f}% "
                  f"{row['view_vs_market']*100:>+12.2f}% {row['weight_vs_market']*100:>+14.2f}% "
                  f"{row['expected_price_return']*100:>18.2f}%")
        
        print("-" * 140)
        print(f"TOTAL PORTFOLIO DIVIDEND YIELD:            {stats['portfolio_dividend_yield']*100:>8.2f}%")
        
        print("\n🔧 RISK CONTRIBUTIONS:")
        print("-" * 40)
        for item in summary['allocation_summary']:
            print(f"{item['ticker']:<8}: {item['risk_contribution']*100:>6.2f}%")
        
        print("\n💰 DIVIDEND ANALYSIS:")
        print("-" * 70)
        total_div_yield = stats['portfolio_dividend_yield']*100
        for item in summary['allocation_summary']:
            if item['dividend_yield'] > 0:
                div_contribution = item['final_weight'] * item['dividend_yield'] * 100
                print(f"{item['ticker']:<8}: Weight {item['final_weight']*100:>6.2f}% x Div Yield {item['dividend_yield']*100:>6.2f}% = {div_contribution:>6.2f}% contribution")
        print("-" * 70)
        print(f"{'TOTAL PORTFOLIO DIVIDEND YIELD:':<40} {total_div_yield:>8.2f}%")
        
        print("\n💡 KEY INSIGHTS:")
        for insight in summary['key_insights']:
            print(f"• {insight}")
        
        print("\n🔧 MODEL PARAMETERS:")
        params = summary['model_parameters']
        print(f"• Tau (uncertainty scaling): {params['tau']}")
        print(f"• Data period: {params['data_period']}")
        print(f"• Dividend integration: {'✅ Enabled' if params['dividend_integration'] else '❌ Disabled'}")
        print(f"• Number of stocks: {params['number_of_stocks']}")
        
        print("="*80)
        
        return summary 