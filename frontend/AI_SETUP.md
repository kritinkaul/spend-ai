# AI Stock Analysis Setup Guide

To enable real-time AI stock analysis in SpendAI, you need to configure a Gemini API key.

## Quick Setup:

1. **Get a Gemini API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key (free tier available)

2. **Configure Environment Variable:**
   - Create a `.env` file in the `frontend/` directory
   - Add this line: `VITE_GEMINI_API_KEY=your_actual_api_key_here`
   - Replace `your_actual_api_key_here` with your real API key

3. **Restart Development Server:**
   ```bash
   cd frontend
   npm run dev
   ```

## Example .env file:
```
VITE_GEMINI_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FINNHUB_API_KEY=d1g87hhr01qk4ao1o8e0d1g87hhr01qk4ao1o8eg
```

## Testing:
1. Go to `/stocks` page
2. Click on "AI Stock Analysis" section
3. Select a stock (e.g., AAPL)
4. Click "Refresh" to generate fresh analysis
5. Should see real-time AI insights with sentiment and confidence levels

## Troubleshooting:
- If you see "API key not configured" - check your .env file
- If you see "rate limit exceeded" - wait a few minutes and try again
- If you see "permissions" error - regenerate your API key

## Features:
- ✅ Real-time stock analysis
- ✅ Bullish/Bearish/Neutral sentiment
- ✅ Confidence levels (1-100%)
- ✅ Timestamps for freshness
- ✅ Dark mode support
- ✅ Error handling with fallbacks 