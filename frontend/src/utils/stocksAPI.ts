// Stock API Service for Real-time and Historical Data using Marketstack API
// Updated to use new API key from environment variable

const API_KEY = import.meta.env.VITE_MARKETSTACK_API_KEY || "6f740961dcb6f26956f428a488bc085f";

// Using Marketstack API for comprehensive stock data
const MARKETSTACK_BASE_URL = 'http://api.marketstack.com/v1';

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

  private async fetchFromAPI(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${MARKETSTACK_BASE_URL}${endpoint}`);
    url.searchParams.append('access_key', API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const cacheKey = url.toString();
    let cacheDuration = STOCK_PRICE_CACHE_DURATION;

    // Determine cache duration based on endpoint
    if (endpoint.includes('eod')) {
      cacheDuration = HISTORICAL_CACHE_DURATION;
    } else if (endpoint.includes('tickers')) {
      cacheDuration = COMPANY_INFO_CACHE_DURATION;
    }

    // Check cache first
    const cachedData = this.getCachedData(cacheKey, cacheDuration);
    if (cachedData) {
      console.log('✅ Using cached data for:', endpoint);
      return cachedData;
    }

    console.log('🔄 Making API call:', endpoint, params);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your VITE_MARKETSTACK_API_KEY.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        } else if (response.status === 404) {
          throw new Error('Stock symbol not found.');
        } else {
          throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // Check for API-specific errors
      if (data.error) {
        throw new Error(`API Error: ${data.error.message || data.error.code || 'Unknown error'}`);
      }
      
      // Cache successful response
      this.setCachedData(cacheKey, data);
      console.log('✅ API response received and cached');
      return data;
    } catch (error) {
      console.error('❌ API call failed:', error);
      
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
      // Get latest EOD data for the symbol
      const data = await this.fetchFromAPI('/eod', { 
        symbols: symbol.toUpperCase(),
        limit: '2' // Get last 2 days to calculate change
      });
      
      if (!data || !data.data || data.data.length === 0) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }
      
      const latest = data.data[0];
      const previous = data.data[1] || latest;
      
      const change = latest.close - previous.close;
      const changePercent = previous.close > 0 ? (change / previous.close) * 100 : 0;
      
      return {
        symbol: latest.symbol,
        price: parseFloat(latest.close) || 0,
        change: parseFloat(change.toFixed(2)) || 0,
        change_percent: parseFloat(changePercent.toFixed(2)) || 0,
        volume: parseInt(latest.volume) || 0,
        high: parseFloat(latest.high) || 0,
        low: parseFloat(latest.low) || 0,
        open: parseFloat(latest.open) || 0,
        previous_close: parseFloat(previous.close) || 0,
        timestamp: latest.date || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Failed to fetch stock price for ${symbol}:`, error);
      throw new Error(`Unable to fetch data for ${symbol}. ${error instanceof Error ? error.message : 'Please try again later.'}`);
    }
  }

  async getHistoricalData(symbol: string, range: TimeRange): Promise<HistoricalData[]> {
    try {
      const now = new Date();
      const endDate = now.toISOString().split('T')[0];
      
      let startDate: string;
      let limit: string;
      
      switch (range) {
        case '1D':
          // For intraday, we'll try the intraday endpoint
          try {
            return await this.getIntradayData(symbol);
          } catch (error) {
            // Fallback to last 5 days of EOD data
            startDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            limit = '5';
            break;
          }
        case '1M':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          limit = '30';
          break;
        case '6M':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          limit = '180';
          break;
        case '1Y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          limit = '365';
          break;
        case '5Y':
          startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          limit = '1000';
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          limit = '30';
      }

      const data = await this.fetchFromAPI('/eod', {
        symbols: symbol.toUpperCase(),
        date_from: startDate,
        date_to: endDate,
        limit,
        sort: 'ASC'
      });
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error(`No historical data found for ${symbol}`);
      }

      return data.data.map((item: any) => ({
        datetime: item.date,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume) || 0,
      }));
    } catch (error) {
      console.error(`❌ Failed to fetch historical data for ${symbol}:`, error);
      throw new Error(`Unable to fetch historical data for ${symbol}. ${error instanceof Error ? error.message : 'Please try again later.'}`);
    }
  }

  async getIntradayData(symbol: string): Promise<IntradayData[]> {
    try {
      // Note: Intraday data might not be available in free MarketStack plan
      const data = await this.fetchFromAPI('/intraday', {
        symbols: symbol.toUpperCase(),
        interval: '1min',
        limit: '100'
      });
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error(`Intraday data not available for ${symbol} (may require premium plan)`);
      }

      return data.data.map((item: any) => ({
        datetime: item.date,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume) || 0,
      }));
    } catch (error) {
      console.error(`❌ Intraday data not available for ${symbol}:`, error);
      throw new Error(`Intraday data not available for ${symbol}. This may require a premium MarketStack plan.`);
    }
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    if (!query || query.length < 1) return [];
    
    try {
      const data = await this.fetchFromAPI('/tickers', { 
        search: query.toUpperCase(),
        limit: '10'
      });
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        return [];
      }

      return data.data.map((item: any) => ({
        symbol: item.symbol,
        instrument_name: item.name || item.symbol,
        exchange: item.stock_exchange?.name || item.exchange || 'N/A',
        mic_code: item.stock_exchange?.mic || 'N/A',
        currency: item.stock_exchange?.currency || 'USD',
        country: item.stock_exchange?.country || 'US',
        type: 'Common Stock',
      }));
    } catch (error) {
      console.error(`❌ Stock search failed for "${query}":`, error);
      return [];
    }
  }

  async getCompanyInfo(symbol: string): Promise<CompanyInfo> {
    try {
      const data = await this.fetchFromAPI('/tickers', { 
        symbols: symbol.toUpperCase(),
        limit: '1'
      });
      
      if (!data || !data.data || data.data.length === 0) {
        throw new Error(`No company info found for ${symbol}`);
      }
      
      const item = data.data[0];
      
      return {
        symbol: item.symbol,
        name: item.name || 'Unknown Company',
        exchange: item.stock_exchange?.name || 'N/A',
        currency: item.stock_exchange?.currency || 'USD',
        country: item.stock_exchange?.country || 'US',
        type: 'Common Stock',
        market_cap: undefined, // Marketstack doesn't provide market cap in basic plan
        sector: undefined,
        industry: undefined,
        website: undefined,
        description: undefined,
      };
    } catch (error) {
      console.error(`❌ Failed to fetch company info for ${symbol}:`, error);
      throw new Error(`Unable to fetch company info for ${symbol}. ${error instanceof Error ? error.message : 'Please try again later.'}`);
    }
  }
}

export const stocksAPI = new StocksAPIService(); 