# SpendAI Backend 🚀

A clean Node.js + Express backend for SpendAI financial analysis.

## Features

- ✅ **Health Check**: `GET /api/health` - Test if backend is running
- ✅ **CSV Upload**: `POST /api/upload` - Upload and parse CSV transactions  
- ✅ **Summary**: `GET /api/summary` - Get spending summary data
- ✅ **Analytics**: `GET /api/analytics` - Get financial analytics  
- ✅ **Transactions**: `GET /api/transactions` - Get all transactions
- ✅ **Categories**: `GET /api/transactions/categories` - Get spending by category
- ✅ **Delete Data**: `DELETE /api/analysis/all-data` - Delete all user data (mock)
- ✅ **Register**: `POST /api/auth/register` - User registration (mock)
- ✅ **Login**: `POST /api/auth/login` - User login (mock)

## Quick Start

```bash
cd backend
npm install
cp env.example .env
npm run dev
```

## API Endpoints

### Health Check
```bash
GET /api/health
```
Returns: `{ "status": "ok" }`

### Upload CSV
```bash
POST /api/upload
Content-Type: multipart/form-data
Body: csvFile (file)
```
Returns: Array of parsed transactions
```json
[
  { "date": "2024-10-01", "amount": 22.99, "category": "Food", "description": "Chipotle" }
]
```

### Get Summary
```bash
GET /api/summary
```
Returns: Spending summary
```json
{
  "totalSpent": 1234.56,
  "topCategories": [
    { "category": "Food", "amount": 400 },
    { "category": "Rent", "amount": 600 }
  ]
}
```

### Register User
```bash
POST /api/auth/register
Content-Type: application/json
Body: {"email": "user@example.com", "password": "password123", "name": "User Name"}
```
Returns: User object with mock JWT token

### Login User
```bash
POST /api/auth/login
Content-Type: application/json
Body: {"email": "user@example.com", "password": "password123"}
```
Returns: User object with mock JWT token

## Tech Stack

- **Node.js** + **Express.js**
- **Multer** for file uploads
- **csv-parser** for CSV processing
- **CORS** enabled for localhost:3000

## Project Structure

```
backend/
├── routes/          # API routes
├── controllers/     # Business logic
├── utils/          # Helper functions
├── uploads/        # Temporary file storage
├── server.js      # Main server file
├── .env.example   # Environment variables template
└── README.md      # This file
```

## Development

- Backend runs on **http://localhost:3002**
- CORS enabled for frontend on **http://localhost:3000**
- File uploads are processed and cleaned up automatically

---

Ready to connect with your frontend! 🎯 