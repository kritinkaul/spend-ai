#!/bin/bash

# Execute from the script's directory to ensure paths are correct
cd "$(dirname "$0")"

echo "🚀 Starting SpendAI Development Environment..."

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "ts-node-dev.*src/index.ts"
pkill -f "vite"
sleep 2

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL and Redis with Docker Compose
echo "🐘 Starting PostgreSQL and Redis..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec spendai-postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# Install dependencies if needed
echo "📦 Checking dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
fi
cd ..

cd frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi
cd ..

# Setup database
echo "🗄️  Setting up database..."
cd backend
npx prisma generate
npx prisma db push
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
echo "🗄️  Database: PostgreSQL (localhost:5432)"
echo "🔴 Redis: localhost:6379"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to clean up background processes on exit
cleanup() {
    echo -e "\n🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "🛑 Stopping Docker services..."
    docker-compose down
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for background processes to finish
wait $BACKEND_PID $FRONTEND_PID 