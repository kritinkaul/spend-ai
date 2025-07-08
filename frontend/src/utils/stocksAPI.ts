// Stock API Service for Real-time and Historical Data using Alpha Vantage API
// Alpha Vantage provides reliable stock data with good free tier limits

const API_KEY = import.meta.env.VITE_ALPHAVANTAGE_API_KEY || "C25T9SFRULAC82VY";

// Using Alpha Vantage API for comprehensive stock data
const ALPHAVANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Enhanced cache for API responses with longer durations to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const STOCK_PRICE_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for stock prices
const HISTORICAL_CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours for historical data
const COMPANY_INFO_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for company info

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previous_close: number;
  timestamp: string;
}

export interface HistoricalData {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockSearchResult {
  symbol: string;
  instrument_name: string;
  exchange: string;
  mic_code: string;
  currency: string;
  country: string;
  type: string;
}

export interface CompanyInfo {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  country: string;
  type: string;
  market_cap?: number;
  sector?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export interface IntradayData {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeRange = '1D' | '1M' | '6M' | '1Y' | '5Y';

class StocksAPIService {
  private getCachedData(key: string, maxAge: number): any | null {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
  }

  // Clear cache if needed (for testing or manual refresh)
  clearCache(): void {
    cache.clear();
    console.log('🧹 Cache cleared');
  }

  private async fetchFromAPI(params: Record<string, string>): Promise<any> {
    const url = new URL(ALPHAVANTAGE_BASE_URL);
    url.searchParams.append('apikey', API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const cacheKey = url.toString();
    let cacheDuration = STOCK_PRICE_CACHE_DURATION;

    // Determine cache duration based on function type
    if (params.function?.includes('TIME_SERIES')) {
      cacheDuration = HISTORICAL_CACHE_DURATION;
    } else if (params.function?.includes('OVERVIEW') || params.function?.includes('SEARCH')) {
      cacheDuration = COMPANY_INFO_CACHE_DURATION;
    }

    // Check cache first
    const cachedData = this.getCachedData(cacheKey, cacheDuration);
    if (cachedData) {
      console.log('✅ Using cached data for:', params.function);
      return cachedData;
    }

    console.log('🔄 Making Alpha Vantage API call:', params.function, params.symbol || params.keywords);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Alpha Vantage allows 25 requests per day on free tier.');
        } else {
          throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // Check for Alpha Vantage specific errors
      if (data['Error Message']) {
        throw new Error(`API Error: ${data['Error Message']}`);
      }
      
      if (data['Note']) {
        throw new Error('Alpha Vantage API rate limit reached. Please try again in a minute.');
      }
      
      // Cache successful response
      this.setCachedData(cacheKey, data);
      console.log('✅ Alpha Vantage API response received and cached');
      return data;
    } catch (error) {
      console.error('❌ Alpha Vantage API call failed:', error);
      
      // Try to return cached data even if expired, as fallback
      const staleData = cache.get(cacheKey);
      if (staleData) {
        console.log('⚠️ Using stale cached data as fallback');
        return staleData.data;
      }
      
      throw error;
    }
  }

  async getStockPrice(symbol: string): Promise<StockPrice> {
    try {
      const data = await this.fetchFromAPI({
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase()
      });
      
      const quote = data['Global Quote'];
      if (!quote) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }
      
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']) || 0,
        change: parseFloat(quote['09. change']) || 0,
        change_percent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
        volume: parseInt(quote['06. volume']) || 0,
        high: parseFloat(quote['03. high']) || 0,
        low: parseFloat(quote['04. low']) || 0,
        open: parseFloat(quote['02. open']) || 0,
        previous_close: parseFloat(quote['08. previous close']) || 0,
        timestamp: quote['07. latest trading day'] || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Failed to fetch stock price for ${symbol}:`, error);
      throw new Error(`Unable to fetch data for ${symbol}. ${error instanceof Error ? error.message : 'Please try again later.'}`);
    }
  }

  async getHistoricalData(symbol: string, range: TimeRange): Promise<HistoricalData[]> {
    try {
      let functionType = 'TIME_SERIES_DAILY';
      let timeSeriesKey = 'Time Series (Daily)';
      
      // For intraday data (1D), use different endpoint
      if (range === '1D') {
        return await this.getIntradayData(symbol);
      }

      const data = await this.fetchFromAPI({
        function: functionType,
        symbol: symbol.toUpperCase(),
        outputsize: range === '5Y' ? 'full' : 'compact' // full gives 20+ years, compact gives 100 days
      });
      
      const timeSeries = data[timeSeriesKey];
      if (!timeSeries) {
        throw new Error(`No historical data found for ${symbol}`);
      }

      // Convert Alpha Vantage data to our format
      const historicalData: HistoricalData[] = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          datetime: date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']) || 0,
        }))
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()); // Sort chronologically

      // Filter data based on time range
      const now = new Date();
      let cutoffDate: Date;
      
      switch (range) {
        case '1M':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '6M':
          cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case '1Y':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case '5Y':
          cutoffDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      return historicalData.filter(item => new Date(item.datetime) >= cutoffDate);
    } catch (error) {
      console.error(`❌ Failed to fetch historical data for ${symbol}:`, error);
      throw new Error(`Unable to fetch historical data for ${symbol}. ${error instanceof Error ? error.message : 'Please try again later.'}`);
    }
  }

  async getIntradayData(symbol: string): Promise<IntradayData[]> {
    try {
      const data = await this.fetchFromAPI({
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol.toUpperCase(),
        interval: '5min', // 5-minute intervals for good balance
        outputsize: 'compact' // Gets last 100 data points
      });
      
      const timeSeries = data['Time Series (5min)'];
      if (!timeSeries) {
        throw new Error(`Intraday data not available for ${symbol}`);
      }

      // Convert to our format and get today's data only
      const today = new Date().toISOString().split('T')[0];
      
      return Object.entries(timeSeries)
        .filter(([datetime]) => datetime.startsWith(today))
        .map(([datetime, values]: [string, any]) => ({
          datetime,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']) || 0,
        }))
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    } catch (error) {
      console.error(`❌ Intraday data not available for ${symbol}:`, error);
      // Fallback to recent daily data if intraday fails
      try {
        const dailyData = await this.fetchFromAPI({
          function: 'TIME_SERIES_DAILY',
          symbol: symbol.toUpperCase(),
          outputsize: 'compact'
        });
        
        const timeSeries = dailyData['Time Series (Daily)'];
        if (timeSeries) {
          const lastFiveDays = Object.entries(timeSeries)
            .slice(0, 5)
            .map(([date, values]: [string, any]) => ({
              datetime: date + ' 16:00:00', // Add time for consistency
              open: parseFloat(values['1. open']),
              high: parseFloat(values['2. high']),
              low: parseFloat(values['3. low']),
              close: parseFloat(values['4. close']),
              volume: parseInt(values['5. volume']) || 0,
            }))
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
          
          return lastFiveDays;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback to daily data also failed:', fallbackError);
      }
      
      throw new Error(`Intraday data not available for ${symbol}. Using daily data instead.`);
    }
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    if (!query || query.length < 1) return [];
    
    try {
      const data = await this.fetchFromAPI({
        function: 'SYMBOL_SEARCH',
        keywords: query.toUpperCase()
      });
      
      const bestMatches = data['bestMatches'];
      if (!bestMatches || !Array.isArray(bestMatches)) {
        return [];
      }

      return bestMatches.slice(0, 10).map((item: any) => ({
        symbol: item['1. symbol'],
        instrument_name: item['2. name'] || item['1. symbol'],
        exchange: item['4. region'] || 'US',
        mic_code: item['4. region'] || 'XNAS',
        currency: item['8. currency'] || 'USD',
        country: item['4. region'] || 'US',
        type: item['3. type'] || 'Equity',
      }));
    } catch (error) {
      console.error(`❌ Stock search failed for "${query}":`, error);
      return [];
    }
  }

  async getCompanyInfo(symbol: string): Promise<CompanyInfo> {
    try {
      const data = await this.fetchFromAPI({
        function: 'OVERVIEW',
        symbol: symbol.toUpperCase()
      });
      
      if (!data || !data.Symbol) {
        throw new Error(`No company info found for ${symbol}`);
      }
      
      return {
        symbol: data.Symbol,
        name: data.Name || 'Unknown Company',
        exchange: data.Exchange || 'N/A',
        currency: data.Currency || 'USD',
        country: data.Country || 'US',
        type: 'Common Stock',
        market_cap: data.MarketCapitalization ? parseInt(data.MarketCapitalization) : undefined,
        sector: data.Sector || undefined,
        industry: data.Industry || undefined,
        website: data.OfficialSite || undefined,
        description: data.Description || undefined,
      };
    } catch (error) {
      console.error(`❌ Failed to fetch company info for ${symbol}:`, error);
      throw new Error(`Unable to fetch company info for ${symbol}. ${error instanceof Error ? error.message : 'Please try again later.'}`);
    }
  }
}

export const stocksAPI = new StocksAPIService(); 