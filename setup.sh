#!/bin/bash

echo "🚀 Setting up SpendAI Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Backend setup
echo "📦 Setting up backend..."
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Create uploads directory
mkdir -p uploads

# Copy environment file
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Created .env file. Please update it with your configuration."
fi

cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "VITE_API_URL=http://localhost:5000" > .env
    echo "📝 Created .env file for frontend."
fi

cd ..

# Create shared directory
mkdir -p shared

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your database and OpenAI API keys"
echo "2. Set up your PostgreSQL database (or use Supabase)"
echo "3. Run database migrations: cd backend && npx prisma db push"
echo "4. Start the backend: cd backend && npm run dev"
echo "5. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔗 Backend API will be available at: http://localhost:5000"
echo ""
echo "📚 Check PROJECT_PLAN.md for detailed implementation guide" 