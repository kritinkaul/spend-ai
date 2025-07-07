import { fetchCompanyNews } from '../utils/fetchCompanyNews';
import { generateInsightWithGemini, AIInsight } from '../utils/geminiApi';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// AIInsight type is imported above and used directly in the service

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<any>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<any>;
  };
}

class AIApiService {
  private async callGeminiAPI(prompt: string): Promise<string> {
    // Check if API key is available
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Gemini API key not configured');
    }

    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    console.log('🧠 Calling Gemini API for stock analysis...');

    const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error:', response.status, errorText);
      
      if (response.status === 403) {
        throw new Error('Invalid API key or insufficient permissions');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from AI');
    }

    const content = data.candidates[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Empty response from AI');
    }

    console.log('✅ Gemini API response received');
    return content;
  }

  async generateStockInsights(symbol: string): Promise<AIInsight[]> {
    console.log(`🚀 Generating real-time AI insights for ${symbol} using Finnhub news + Gemini analysis...`);
    
    try {
      // Step 1: Fetch real company news from Finnhub
      console.log(`📰 Fetching recent news for ${symbol}...`);
      const news = await fetchCompanyNews(symbol);
      
      if (!news || news.length === 0) {
        console.warn(`⚠️ No recent news found for ${symbol}, using fallback`);
        return [this.getFallbackInsight(symbol)];
      }
      
      // Step 2: Generate AI insight using Gemini with real news
      console.log(`🤖 Generating Gemini analysis for ${symbol} using ${news.length} news items...`);
      const insight = await generateInsightWithGemini(symbol, news);
      
      console.log(`✅ Generated real-time AI insight for ${symbol}: ${insight.type} (${insight.confidence}% confidence)`);
      return [insight];
      
    } catch (error) {
      console.error('❌ Error generating real-time AI insights:', error);
      
      // Check if it's an API configuration error
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          console.warn('⚠️ API key configuration issue, using fallback');
          return [this.getFallbackInsight(symbol, error.message)];
        }
      }
      
      // For other errors, still return fallback
      return [this.getFallbackInsight(symbol)];
    }
  }



  private extractSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
    const lowerText = text.toLowerCase();
    
    const bullishKeywords = ['positive', 'bullish', 'growth', 'increase', 'strong', 'buy', 'outperform', 'upward', 'rise', 'gain'];
    const bearishKeywords = ['negative', 'bearish', 'decline', 'decrease', 'weak', 'sell', 'underperform', 'downward', 'fall', 'loss'];
    
    const bullishCount = bullishKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const bearishCount = bearishKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  }

  // Fallback insights for when API is unavailable
  getFallbackInsight(symbol: string, errorMessage?: string): AIInsight {
    // If there's an API configuration error, provide a helpful message
    if (errorMessage && errorMessage.includes('API key')) {
      return {
        id: `${symbol}-config-error-${Date.now()}`,
        type: 'neutral',
        title: `${symbol} - API Configuration Needed`,
        content: `Real-time insights unavailable. Please configure your Finnhub and Gemini API keys in the .env file to enable AI-powered market analysis.`,
        confidence: 0,
        timestamp: new Date().toISOString(),
        symbol: symbol
      };
    }
    
    const fallbackMessages = [
      {
        title: `Technical Analysis for ${symbol}`,
        content: `Unable to fetch fresh insights for ${symbol}. AI analysis is temporarily unavailable due to API limitations. Please try again later or check your API configuration.`,
        type: 'neutral' as const,
        confidence: 50
      }
    ];

    const fallback = fallbackMessages[0];
    
    return {
      id: `${symbol}-fallback-${Date.now()}`,
      type: fallback.type,
      title: fallback.title,
      content: fallback.content,
      confidence: fallback.confidence,
      timestamp: new Date().toISOString(),
      symbol: symbol
    };
  }

  async generateMarketSummary(symbols: string[]): Promise<string> {
    try {
      const prompt = `Provide a brief market summary for these stocks: ${symbols.join(', ')}. 
      
      Focus on:
      - Overall market sentiment
      - Key trends affecting these stocks
      - Any notable events or catalysts
      
      Keep it concise (2-3 sentences) and informative.`;

      return await this.callGeminiAPI(prompt);
    } catch (error) {
      console.error('Error generating market summary:', error);
      return `Market analysis for ${symbols.join(', ')} is currently unavailable. Please check back later for updated insights.`;
    }
  }
}

export const aiApi = new AIApiService(); 