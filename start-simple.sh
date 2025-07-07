#!/bin/bash

# Execute from the script's directory to ensure paths are correct
cd "$(dirname "$0")"

echo "🚀 Starting SpendAI Development Environment (No Docker)..."

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "ts-node-dev.*src/index.ts"
pkill -f "vite"
sleep 2

# Install backend dependencies if needed
echo "📦 Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
fi

# Setup database
echo "🗄️  Setting up SQLite database..."
npx prisma generate
npx prisma db push

# Seed database if it's empty
if [ ! -f "data/spendai.db" ] || [ ! -s "data/spendai.db" ]; then
    echo "🌱 Seeding database with sample data..."
    npm run db:seed
fi

cd ..

# Install frontend dependencies if needed
echo "📦 Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi
cd ..

# Start backend in a subshell
echo "🚀 Starting backend server..."
(cd backend && npm run dev) &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend failed to start. Check the logs above."
    exit 1
fi
echo "✅ Backend is running!"

# Start frontend in a subshell
echo "🎨 Starting frontend server..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "🎉 SpendAI is now running!"
echo "📊 Backend: http://localhost:8000"
echo "🎨 Frontend: http://localhost:3000"
echo "🗄️  Database: SQLite (backend/data/spendai.db)"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to clean up background processes on exit
cleanup() {
    echo -e "\n🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for background processes to finish
wait $BACKEND_PID $FRONTEND_PID 