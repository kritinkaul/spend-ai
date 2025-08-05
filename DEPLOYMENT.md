# 🚀 Deployment Guide - SpendAI

This guide explains how to deploy the SpendAI application to various cloud platforms. The application is designed to be easily deployable and demonstrates modern DevOps practices.

## 📋 Prerequisites

- GitHub account
- Cloud platform accounts (free tiers available)
- Basic understanding of command line

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   - Vercel      │    │   - Railway     │    │   - Supabase    │
│   - Netlify     │    │   - Heroku      │    │   - Railway     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway is perfect for full-stack applications and offers a generous free tier.

#### Backend Deployment
1. **Fork this repository** to your GitHub account
2. **Sign up** at [railway.app](https://railway.app)
3. **Connect your GitHub** account
4. **Create a new project** → "Deploy from GitHub repo"
5. **Select your forked repository**
6. **Set environment variables**:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```
7. **Deploy** - Railway will automatically detect it's a Node.js app

#### Frontend Deployment
1. **Deploy to Vercel** (see Option 2 below)
2. **Update CORS settings** in backend environment variables

### Option 2: Vercel + Supabase (Most Popular)

#### Backend (Vercel Functions)
1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import your GitHub repository**
3. **Configure build settings**:
   - Build Command: `cd backend && npm install && npm run build`
   - Output Directory: `backend/dist`
4. **Set environment variables** in Vercel dashboard

#### Database (Supabase)
1. **Sign up** at [supabase.com](https://supabase.com)
2. **Create a new project**
3. **Get your database URL** from Settings → Database
4. **Update your backend** DATABASE_URL environment variable

#### Frontend (Vercel)
1. **Same Vercel project** - Vercel can handle both frontend and backend
2. **Configure build settings**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

### Option 3: Heroku (Traditional)

#### Backend
1. **Sign up** at [heroku.com](https://heroku.com)
2. **Install Heroku CLI**
3. **Create app**: `heroku create your-app-name`
4. **Add PostgreSQL**: `heroku addons:create heroku-postgresql:mini`
5. **Deploy**: `git push heroku main`

#### Frontend
1. **Create separate Heroku app** for frontend
2. **Use static buildpack**: `heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static.git`
3. **Deploy static files**

## 🔧 Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Server
PORT=8000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend-domain.com
VITE_APP_NAME=SpendAI
```

## 🗄️ Database Setup

### PostgreSQL Setup
1. **Create database** on your chosen platform
2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```
3. **Seed data** (optional):
   ```bash
   npm run db:seed
   ```

### Database Providers
- **Supabase** - Free tier, great for small projects
- **Railway** - Integrated with Railway deployment
- **Heroku Postgres** - Reliable, good free tier
- **AWS RDS** - Enterprise-grade, pay-as-you-go

## 📊 Monitoring & Analytics

### Recommended Tools
- **Sentry** - Error tracking
- **LogRocket** - User session replay
- **Google Analytics** - User analytics
- **Uptime Robot** - Uptime monitoring

### Setup Example (Sentry)
```bash
# Install Sentry
npm install @sentry/node @sentry/tracing

# Initialize in your app
import * as Sentry from "@sentry/node";
Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

## 🔒 Security Checklist

- [ ] **HTTPS enabled** on all domains
- [ ] **Environment variables** properly set
- [ ] **CORS configured** for production domains
- [ ] **Rate limiting** enabled
- [ ] **Input validation** implemented
- [ ] **SQL injection** protection (Prisma handles this)
- [ ] **XSS protection** (helmet.js)
- [ ] **CSRF protection** (if needed)

## 🚀 Performance Optimization

### Backend
- **Enable compression** (already configured)
- **Implement caching** with Redis
- **Database indexing** (Prisma handles basic indexes)
- **Connection pooling** (Prisma handles this)

### Frontend
- **Code splitting** (Vite handles this)
- **Image optimization**
- **CDN** for static assets
- **Service worker** for caching

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load balancer** for multiple backend instances
- **Database read replicas** for read-heavy workloads
- **CDN** for static assets
- **Redis cluster** for session management

### Vertical Scaling
- **Upgrade database** plan
- **Increase server** resources
- **Optimize queries** and add indexes

## 🧪 Testing Before Deployment

```bash
# Run all tests
npm test

# Build for production
npm run build

# Test production build locally
npm run start

# Check for security vulnerabilities
npm audit
```

## 📝 Deployment Checklist

- [ ] **All tests pass**
- [ ] **Environment variables** configured
- [ ] **Database migrations** run
- [ ] **SSL certificates** installed
- [ ] **Domain names** configured
- [ ] **Monitoring** set up
- [ ] **Backup strategy** in place
- [ ] **Documentation** updated

## 🎯 Key Features

This deployment demonstrates:

1. **Modern Tech Stack** - PostgreSQL, Docker, TypeScript
2. **Production Readiness** - Environment management, security
3. **Scalability** - Containerization, database design
4. **DevOps Knowledge** - CI/CD, monitoring, deployment
5. **Best Practices** - Security, performance, testing

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Verify database is running
- Check firewall settings

**Build Fails**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

**CORS Errors**
- Verify CORS_ORIGIN is set correctly
- Check frontend URL matches backend CORS settings

**Environment Variables**
- Ensure all required variables are set
- Check for typos in variable names
- Verify values are properly quoted

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify environment variables are set correctly
3. Test locally first
4. Check the platform's documentation

--- 