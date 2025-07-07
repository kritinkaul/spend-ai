import { CompanyNews } from './fetchCompanyNews';

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export interface AIInsight {
  id: string;
  type: 'bullish' | 'bearish' | 'neutral';
  title: string;
  content: string;
  confidence: number;
  timestamp: string;
  symbol: string;
}

export async function generateInsightWithGemini(symbol: string, news: CompanyNews[]): Promise<AIInsight> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file');
  }

  if (!news || news.length === 0) {
    throw new Error('No news data available to analyze');
  }

  // Build the prompt for Gemini
  const companyName = getCompanyName(symbol);
  const newsHeadlines = news.map((item, index) => `${index + 1}. ${item.headline}`).join('\n');
  
  const prompt = `You are a financial analyst. Read these recent headlines about ${companyName} (${symbol}) and analyze the market impact.

Recent Headlines:
${newsHeadlines}

Provide analysis in this exact JSON format:
{
  "type": "bullish" | "bearish" | "neutral",
  "title": "Brief descriptive title (max 60 characters)",
  "content": "1-2 sentence summary of market impact. Focus on actual strategic or financial takeaways, avoid hype.",
  "confidence": number between 60-95
}

Focus on:
- Strategic business implications
- Financial performance indicators
- Market positioning changes
- Risk factors or opportunities

Keep it professional and avoid speculation. If news is mixed or unclear, use "neutral" type.`;

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

  try {
    console.log(`🤖 Generating Gemini insight for ${symbol} based on ${news.length} news items`);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Gemini API key');
      } else if (response.status === 429) {
        throw new Error('Gemini API rate limit exceeded');
      } else {
        throw new Error(`Gemini API error: ${response.status}`);
      }
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const aiText = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON response
    let parsedInsight;
    try {
      // Clean up the response - remove any markdown code blocks
      const cleanedText = aiText.replace(/```json\n?|\n?```/g, '').trim();
      parsedInsight = JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn('Failed to parse Gemini JSON response, using fallback format');
      // Fallback: extract key info from text
      parsedInsight = {
        type: aiText.toLowerCase().includes('bullish') ? 'bullish' : 
              aiText.toLowerCase().includes('bearish') ? 'bearish' : 'neutral',
        title: `${symbol} Market Analysis`,
        content: aiText.substring(0, 200) + (aiText.length > 200 ? '...' : ''),
        confidence: 75
      };
    }

    const insight: AIInsight = {
      id: `${symbol}-${Date.now()}`,
      type: parsedInsight.type || 'neutral',
      title: parsedInsight.title || `${symbol} Market Analysis`,
      content: parsedInsight.content || 'Analysis completed successfully.',
      confidence: parsedInsight.confidence || 75,
      timestamp: new Date().toISOString(),
      symbol: symbol
    };

    console.log(`✅ Generated ${insight.type} insight for ${symbol} with ${insight.confidence}% confidence`);
    return insight;
    
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error);
    throw error;
  }
}

// Helper function to get company names
function getCompanyName(symbol: string): string {
  const companyMap: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.'
  };
  
  return companyMap[symbol] || `${symbol} Corporation`;
} 