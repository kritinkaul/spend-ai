// Enhanced Finnhub API Service for comprehensive stock data
// Uses Finnhub API for all stock-related functionality

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || "d1g87hhr01qk4ao1o8e0d1g87hhr01qk4ao1o8eg";

// Direct API calls to Finnhub (no proxy needed)
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Enhanced cache for API responses with different durations
const cache = new Map<string, { data: any; timestamp: number }>();
const QUOTE_CACHE_DURATION = 30000; // 30 seconds for quotes
const NEWS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for news
const PROFILE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for company profiles
const METRICS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for metrics

export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface CandleData {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string; // Status
  t: number[]; // Timestamps
  v: number[]; // Volume
}

export interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface SearchResponse {
  count: number;
  result: SearchResult[];
}

export interface CompanyProfile {
  name: string;
  ticker: string;
  currency: string;
  marketCapitalization: number;
  ipo: string;
  finnhubIndustry: string;
  weburl: string;
  logo: string;
  exchange: string;
  country: string;
  shareOutstanding: number;
  phone: string;
}

export interface NewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface BasicFinancials {
  metric: {
    '10DayAverageTradingVolume': number;
    '52WeekHigh': number;
    '52WeekLow': number;
    '52WeekLowDate': string;
    '52WeekHighDate': string;
    'beta': number;
    'marketCapitalization': number;
    'peBasicExclExtraTTM': number;
    'pbAnnual': number;
    'dividendYieldIndicatedAnnual': number;
    'epsBasicExclExtraTTM': number;
  };
  series: {
    annual: any;
    quarterly: any;
  };
}

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
  logo?: string;
  phone?: string;
  ipo?: string;
  shareOutstanding?: number;
}

export interface HistoricalData {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IntradayData {
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

export interface TimeRange {
  label: string;
  value: string;
  days: number;
}

class FinnhubStockService {
  private getCachedData(key: string, duration: number): any | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < duration) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchFromAPI(url: string, cacheDuration: number = QUOTE_CACHE_DURATION): Promise<any> {
    // Check cache first
    const cachedData = this.getCachedData(url, cacheDuration);
    if (cachedData) {
      console.log('✅ Using cached data for:', url);
      return cachedData;
    }

    console.log('🔄 Making API call:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('API access denied. Please check your Finnhub API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 404) {
          throw new Error('Data not found for this symbol.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // Validate the response
      if (data.error) {
        throw new Error(`API returned error: ${data.error}`);
      }
      
      // Cache successful response
      this.setCachedData(url, data);
      console.log('✅ API response received and cached');
      return data;
    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`;
    const data = await this.fetchFromAPI(url, QUOTE_CACHE_DURATION);
    
    // Validate response data
    if (data.c === undefined || data.c === 0) {
      throw new Error(`Invalid stock symbol: ${symbol}`);
    }
    
    return data;
  }

  // Convert Finnhub quote to MarketStack-compatible format
  async getStockPrice(symbol: string): Promise<StockPrice> {
    const quote = await this.getStockQuote(symbol);
    
    return {
      symbol: symbol.toUpperCase(),
      price: quote.c,
      change: quote.d,
      change_percent: quote.dp,
      volume: 0, // Volume not available in quote endpoint
      high: quote.h,
      low: quote.l,
      open: quote.o,
      previous_close: quote.pc,
      timestamp: new Date(quote.t * 1000).toISOString(),
    };
  }

  async getMultipleQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    console.log('🔄 Fetching quotes for symbols:', symbols);
    
    // Use Promise.allSettled to handle individual failures gracefully
    const promises = symbols.map(async symbol => {
      try {
        const quote = await this.getStockQuote(symbol);
        console.log(`✅ Got quote for ${symbol}: $${quote.c}`);
        return { symbol, quote, success: true };
      } catch (error) {
        console.error(`❌ Failed to fetch quote for ${symbol}:`, error);
        return { symbol, quote: null, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });
    
    const results = await Promise.allSettled(promises);
    const quotes: Record<string, StockQuote> = {};
    const errors: string[] = [];
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.success && result.value.quote) {
          quotes[result.value.symbol] = result.value.quote;
        } else {
          errors.push(`${result.value.symbol}: ${result.value.error}`);
        }
      }
    });
    
    console.log('✅ Successfully fetched quotes for:', Object.keys(quotes));
    if (errors.length > 0) {
      console.warn('⚠️ Errors:', errors);
    }
    
    return quotes;
  }

  async getHistoricalData(symbol: string, days: number = 30): Promise<CandleData> {
    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`;
    const data = await this.fetchFromAPI(url, PROFILE_CACHE_DURATION);
    
    if (data.s !== 'ok' || !data.c || data.c.length === 0) {
      throw new Error(`No historical data available for ${symbol}`);
    }
    
    return data;
  }

  // Convert historical data to MarketStack-compatible format
  async getHistoricalDataFormatted(symbol: string, range: string = '1M'): Promise<HistoricalData[]> {
    let days = 30;
    switch (range) {
      case '1D': days = 1; break;
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case '6M': days = 180; break;
      case '1Y': days = 365; break;
      case '5Y': days = 1825; break;
    }

    const data = await this.getHistoricalData(symbol, days);
    
    return data.t.map((timestamp, index) => ({
      datetime: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v[index],
    }));
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`;
    const data = await this.fetchFromAPI(url, PROFILE_CACHE_DURATION);
    
    if (!data || !data.name) {
      throw new Error(`No company profile found for ${symbol}`);
    }
    
    return {
      name: data.name || 'Unknown Company',
      ticker: data.ticker || symbol,
      currency: data.currency || 'USD',
      marketCapitalization: data.marketCapitalization || 0,
      ipo: data.ipo || 'N/A',
      finnhubIndustry: data.finnhubIndustry || 'N/A',
      weburl: data.weburl || '',
      logo: data.logo || '',
      exchange: data.exchange || 'N/A',
      country: data.country || 'US',
      shareOutstanding: data.shareOutstanding || 0,
      phone: data.phone || '',
    };
  }

  // Convert company profile to MarketStack-compatible format
  async getCompanyInfo(symbol: string): Promise<CompanyInfo> {
    try {
      const profile = await this.getCompanyProfile(symbol);
      
      return {
        symbol: symbol.toUpperCase(),
        name: profile.name,
        exchange: profile.exchange,
        currency: profile.currency,
        country: profile.country,
        type: 'Common Stock',
        market_cap: profile.marketCapitalization,
        sector: profile.finnhubIndustry,
        industry: profile.finnhubIndustry,
        website: profile.weburl,
        description: undefined,
        logo: profile.logo,
        phone: profile.phone,
        ipo: profile.ipo,
        shareOutstanding: profile.shareOutstanding,
      };
    } catch (error) {
      console.error(`❌ Failed to fetch company info for ${symbol}:`, error);
      throw new Error(`Unable to fetch company info for ${symbol}. ${error instanceof Error ? error.message : 'Please try again later.'}`);
    }
  }

  async getBasicFinancials(symbol: string): Promise<BasicFinancials> {
    const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`;
    const data = await this.fetchFromAPI(url, METRICS_CACHE_DURATION);
    
    if (!data || !data.metric) {
      throw new Error(`No financial metrics found for ${symbol}`);
    }
    
    return data;
  }

  async getCompanyNews(symbol: string, days: number = 7): Promise<NewsArticle[]> {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${API_KEY}`;
    const data = await this.fetchFromAPI(url, NEWS_CACHE_DURATION);
    
    if (!Array.isArray(data)) {
      throw new Error(`No news found for ${symbol}`);
    }
    
    // Filter and sort news articles
    return data
      .filter(item => item.headline && item.headline.length > 10)
      .sort((a, b) => b.datetime - a.datetime)
      .slice(0, 10); // Top 10 most recent
  }

  async searchStocks(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];
    
    const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${API_KEY}`;
    console.log('🔍 Searching stocks:', query);
    
    try {
      const response: SearchResponse = await this.fetchFromAPI(url, PROFILE_CACHE_DURATION);
      
      // Filter and limit results to top 10 US stocks
      if (response && response.result && Array.isArray(response.result)) {
        const filtered = response.result
          .filter(item => item.type === 'Common Stock' && !item.symbol.includes('.'))
          .slice(0, 10);
        
        console.log('✅ Search results:', filtered.length, 'stocks found');
        return filtered;
      }
      
      console.log('⚠️ No valid search results');
      return [];
    } catch (error) {
      console.error('❌ Search failed:', error);
      return [];
    }
  }

  // Convert search results to MarketStack-compatible format
  async searchStocksFormatted(query: string): Promise<StockSearchResult[]> {
    const results = await this.searchStocks(query);
    
    return results.map(item => ({
      symbol: item.symbol,
      instrument_name: item.description,
      exchange: 'N/A',
      mic_code: 'N/A',
      currency: 'USD',
      country: 'US',
      type: item.type,
    }));
  }

  async getTrendingStocks(): Promise<string[]> {
    try {
      console.log('🔄 Fetching trending stocks from news...');
      const url = `${FINNHUB_BASE_URL}/news?category=general&token=${API_KEY}`;
      const newsData: NewsArticle[] = await this.fetchFromAPI(url, NEWS_CACHE_DURATION);
      
      if (!newsData || !Array.isArray(newsData)) {
        console.log('⚠️ No news data, using fallback trending stocks');
        return ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL'];
      }

      // Extract tickers from news articles
      const tickers = new Set<string>();
      newsData.slice(0, 20).forEach(article => {
        if (article.related && typeof article.related === 'string') {
          const relatedTickers = article.related.split(',').map(t => t.trim().toUpperCase());
          relatedTickers.forEach(ticker => {
            if (ticker.length <= 5 && /^[A-Z]+$/.test(ticker)) {
              tickers.add(ticker);
            }
          });
        }
      });

      const trendingList = Array.from(tickers).slice(0, 6);
      
      // If we don't have enough tickers from news, fill with fallback
      const fallbackTickers = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL'];
      while (trendingList.length < 6) {
        const nextTicker = fallbackTickers.find(ticker => !trendingList.includes(ticker));
        if (nextTicker) {
          trendingList.push(nextTicker);
        } else {
          break;
        }
      }

      console.log('✅ Found trending stocks:', trendingList);
      return trendingList;
    } catch (error) {
      console.error('❌ Error fetching trending stocks:', error);
      return ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL'];
    }
  }

  // Market status endpoint
  async getMarketStatus(): Promise<{ is_market_open: boolean; market_state: string }> {
    try {
      const url = `${FINNHUB_BASE_URL}/stock/market-status?exchange=US&token=${API_KEY}`;
      const data = await this.fetchFromAPI(url, 60000); // 1-minute cache
      
      return {
        is_market_open: data.isOpen || false,
        market_state: data.isOpen ? 'open' : 'closed'
      };
    } catch (error) {
      console.warn('⚠️ Market status not available:', error);
      // Fallback: check if it's likely market hours (9:30 AM - 4:00 PM ET, Mon-Fri)
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const isWeekday = day >= 1 && day <= 5;
      const isMarketHours = hour >= 9 && hour < 16;
      
      return {
        is_market_open: isWeekday && isMarketHours,
        market_state: isWeekday && isMarketHours ? 'open' : 'closed'
      };
    }
  }
}

export const stockApi = new FinnhubStockService();
export const finnhubStockService = new FinnhubStockService(); // For backwards compatibility

// Export the service as stocksAPI for compatibility with existing components
export const stocksAPI = new FinnhubStockService(); 