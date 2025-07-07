# SpendAI Backend Configuration

## 🚀 Live Backend URL
**https://spend-ai-production.up.railway.app**

## Railway Environment Variables to Set

```
PORT=8000
NODE_ENV=production
CORS_ORIGIN=https://your-app-name.vercel.app
JWT_SECRET=spend-ai-super-secret-key-2024
```

## API Endpoints

- **Health Check**: `GET /api/health`
- **Upload CSV**: `POST /api/upload`
- **Get Summary**: `GET /api/summary`
- **Get Analytics**: `GET /api/analytics`
- **Get Transactions**: `GET /api/transactions`
- **Get Categories**: `GET /api/transactions/categories`
- **Delete All Data**: `DELETE /api/analysis/all-data`

## Test Backend Health

```bash
curl https://spend-ai-production.up.railway.app/api/health
```

Should return: `{"status":"ok"}`

## Next Steps

1. Deploy frontend to Vercel
2. Update CORS_ORIGIN in Railway with your Vercel URL
3. Test the full application 