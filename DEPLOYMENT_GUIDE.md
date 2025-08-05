# 🚀 SpendAI Deployment Guide

## Quick Deployment Steps

### 1. GitHub Repository Setup ✅
- [x] Git initialized
- [x] Files committed
- [x] Git config set

**Next**: Create GitHub repository and push code

### 2. Backend Deployment (Railway)

#### Step 2.1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"

#### Step 2.2: Deploy Backend
1. Select your `spend-ai` repository
2. Railway will auto-detect it's a Node.js project
3. Set environment variables:
   ```
   PORT=8000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   JWT_SECRET=your_super_secret_key_here
   ```

#### Step 2.3: Add PostgreSQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will auto-connect it to your app
4. Copy the `DATABASE_URL` and add it to environment variables

### 3. Frontend Deployment (Vercel)

#### Step 3.1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `spend-ai` repository

#### Step 3.2: Configure Frontend
1. Set build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`

#### Step 3.3: Set Environment Variables
```
VITE_API_URL=https://your-backend-url.railway.app
```

### 4. Update CORS Origin
Once you have your Vercel URL, update the backend CORS_ORIGIN in Railway:
```
CORS_ORIGIN=https://your-app.vercel.app
```

### 5. Test Your Deployment
1. Test file upload
2. Test API endpoints
3. Test responsive design
4. Test all features

## URLs You'll Get
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`

## Troubleshooting
- If uploads don't work, check file permissions
- If API calls fail, check CORS settings
- If database errors occur, check DATABASE_URL

## Next Steps
1. Update README with live URL
2. Test all features thoroughly
3. Monitor application performance
4. Set up monitoring and alerts 