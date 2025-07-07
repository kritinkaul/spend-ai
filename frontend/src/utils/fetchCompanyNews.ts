interface NewsItem {
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

export interface CompanyNews {
  headline: string;
  summary: string;
  url: string;
  source: string;
  datetime: number;
}

export async function fetchCompanyNews(symbol: string): Promise<CompanyNews[]> {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  
  if (!apiKey || apiKey === 'your_finnhub_api_key_here') {
    throw new Error('Finnhub API key not configured. Please set VITE_FINNHUB_API_KEY in your .env file');
  }

  // Get date range: last 7 days
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const toDate = today.toISOString().split('T')[0];
  const fromDate = weekAgo.toISOString().split('T')[0];

  const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`;

  try {
    console.log(`📰 Fetching news for ${symbol} from ${fromDate} to ${toDate}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Finnhub API key');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later');
      } else {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }
    }

    const newsData: NewsItem[] = await response.json();
    
    if (!Array.isArray(newsData)) {
      throw new Error('Invalid response format from Finnhub API');
    }

    // Filter and format the news - get top 3 most recent
    const recentNews = newsData
      .filter(item => item.headline && item.headline.length > 10) // Filter out short/invalid headlines
      .sort((a, b) => b.datetime - a.datetime) // Sort by most recent first
      .slice(0, 3) // Take top 3
      .map(item => ({
        headline: item.headline,
        summary: item.summary || '',
        url: item.url,
        source: item.source,
        datetime: item.datetime
      }));

    console.log(`✅ Fetched ${recentNews.length} news items for ${symbol}`);
    return recentNews;
    
  } catch (error) {
    console.error('❌ Error fetching company news:', error);
    throw error;
  }
} 