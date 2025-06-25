
// Real market data service using Alpha Vantage API (free tier)
export class MarketDataService {
  private static readonly API_KEY = 'demo'; // Users should get their own free API key
  private static readonly BASE_URL = 'https://www.alphavantage.co/query';
  
  static async fetchStockData(symbol: string, outputSize: 'compact' | 'full' = 'compact') {
    const url = `${this.BASE_URL}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=${outputSize}&apikey=${this.API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(`API Error: ${data['Error Message']}`);
      }
      
      if (data['Note']) {
        throw new Error('API call frequency limit reached. Please try again later.');
      }
      
      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }
      
      return this.processTimeSeriesData(timeSeries);
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw error;
    }
  }
  
  private static processTimeSeriesData(timeSeries: any) {
    const dates = Object.keys(timeSeries).sort();
    const prices = dates.map(date => ({
      date,
      price: parseFloat(timeSeries[date]['5. adjusted close'])
    }));
    
    return prices;
  }
  
  static calculateReturns(prices: { date: string; price: number }[]) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      const currentPrice = prices[i].price;
      const previousPrice = prices[i - 1].price;
      const dailyReturn = (currentPrice - previousPrice) / previousPrice;
      returns.push({
        date: prices[i].date,
        return: dailyReturn
      });
    }
    return returns;
  }
}
