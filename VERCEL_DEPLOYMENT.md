# Vercel Deployment Guide

This guide will help you deploy the SpendAI frontend to Vercel.

## Prerequisites

1. A GitHub account with the spend-ai repository
2. A Vercel account (free tier available)
3. Your backend deployed (Railway, Heroku, etc.)

## Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `kritinkaul/spend-ai`
4. Vercel will automatically detect the configuration

## Step 2: Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add the following:

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Your deployed backend URL | `https://your-backend.railway.app` |

### Optional Environment Variables (for full functionality)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI features | `AIzaSyC...` |
| `VITE_FINNHUB_API_KEY` | Finnhub API key for stock data | `d1g87hhr01qk4ao1o8e0d1g87hhr01qk4ao1o8eg` |
| `VITE_ALPHAVANTAGE_API_KEY` | Alpha Vantage API key for stock data | `C25T9SFRULAC82VY` |
| `VITE_CURRENCY_API_KEY` | Currency API key for exchange rates | `your_currency_api_key` |

## Step 3: Deploy

1. Click "Deploy" in the Vercel dashboard
2. Vercel will automatically:
   - Install dependencies in the `frontend` directory
   - Run the build command: `npm ci --production=false && npm run build`
   - Deploy the built files from `frontend/dist`

## Step 4: Verify Deployment

1. Once deployed, Vercel will provide you with a URL
2. Test the application by:
   - Uploading a CSV file
   - Checking if the dashboard loads
   - Verifying API calls work

## Troubleshooting

### Build Fails with "vite: command not found"

This usually means dependencies aren't being installed properly. The current configuration should fix this by:
- Using `npm ci --production=false` to install all dependencies (including dev dependencies)
- Running the build from the correct directory

### API Calls Fail

1. Check that `VITE_API_URL` is set correctly in Vercel environment variables
2. Ensure your backend is deployed and accessible
3. Verify CORS is configured on your backend

### Environment Variables Not Working

1. Make sure all environment variables are prefixed with `VITE_`
2. Redeploy after adding environment variables
3. Check the browser console for any errors

## Custom Domain (Optional)

1. In your Vercel project, go to **Settings > Domains**
2. Add your custom domain
3. Configure DNS records as instructed by Vercel

## Automatic Deployments

Vercel will automatically deploy when you push to the `main` branch. You can also:
- Set up preview deployments for pull requests
- Configure branch-specific environment variables
- Set up deployment notifications

## Performance Optimization

The current configuration includes:
- Source maps for debugging
- Optimized build output
- Proper caching headers
- SPA routing configuration

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set
3. Test the backend API endpoints directly
4. Check the browser console for client-side errors 