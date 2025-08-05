#!/bin/bash

# Execute from the script's directory to ensure paths are correct
cd "$(dirname "$0")"

echo "🚀 Starting SpendAI Development Environment (Simple Mode)..."

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "ts-node-dev.*src/index.ts"
pkill -f "vite"
sleep 2

# Check if PostgreSQL is available
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL found - using PostgreSQL"
    DB_TYPE="postgresql"
else
    echo "⚠️  PostgreSQL not found - falling back to SQLite for development"
    DB_TYPE="sqlite"
    # Update the schema to use SQLite
    cat > backend/prisma/schema.sqlite.prisma << 'EOF'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./data/spendai.db"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  uploads     Upload[]
  transactions Transaction[]
  analyses    Analysis[]
  insights    Insight[]

  @@map("users")
}

model Upload {
  id        String   @id @default(cuid())
  userId    String
  fileName  String
  fileType  String
  fileSize  Int
  status    String @default("PROCESSING")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@map("uploads")
}

model Transaction {
  id          String   @id @default(cuid())
  uploadId    String
  userId      String
  date        DateTime
  description String
  amount      Decimal
  category    String?
  subcategory String?
  merchant    String?
  isRecurring Boolean  @default(false)
  frequency   String?  // monthly, weekly, etc.
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  upload User @relation(fields: [userId], references: [id], onDelete: Cascade)
  uploadFile Upload @relation(fields: [uploadId], references: [id], onDelete: Cascade)

  @@map("transactions")
}

model Analysis {
  id                String   @id @default(cuid())
  userId            String
  period            String   // e.g., "2024-01", "2024-Q1"
  totalSpent        Decimal
  totalIncome       Decimal
  netAmount         Decimal
  categoryBreakdown String   // { "Food": 500, "Transport": 200, ... }
  topMerchants      String   // { "Amazon": 300, "Starbucks": 150, ... }
  recurringPayments String   // { "Netflix": 15.99, "Spotify": 9.99, ... }
  spendingScore     Int      // 1-100 health score
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("analyses")
}

model Insight {
  id          String   @id @default(cuid())
  userId      String
  type        String
  title       String
  description String
  category    String?
  amount      Decimal?
  priority    String @default("MEDIUM")
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("insights")
}
EOF
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
fi

# Setup database
echo "🗄️  Setting up database..."
if [ "$DB_TYPE" = "sqlite" ]; then
    # Use SQLite schema
    cp prisma/schema.sqlite.prisma prisma/schema.prisma
    echo "DATABASE_URL=\"file:./data/spendai.db\"" > .env
    echo "PORT=8000" >> .env
    echo "NODE_ENV=development" >> .env
    echo "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" >> .env
    echo "JWT_EXPIRES_IN=7d" >> .env
    echo "CORS_ORIGIN=http://localhost:3000" >> .env
else
    # Use PostgreSQL schema
    echo "DATABASE_URL=\"postgresql://postgres:password@localhost:5432/spendai?schema=public\"" > .env
    echo "PORT=8000" >> .env
    echo "NODE_ENV=development" >> .env
    echo "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" >> .env
    echo "JWT_EXPIRES_IN=7d" >> .env
    echo "CORS_ORIGIN=http://localhost:3000" >> .env
fi

npx prisma generate
npx prisma db push

# Seed the database
echo "🌱 Seeding database..."
npm run db:seed

cd ..

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
if [ "$DB_TYPE" = "sqlite" ]; then
    echo "🗄️  Database: SQLite (backend/data/spendai.db)"
else
    echo "🗄️  Database: PostgreSQL (localhost:5432)"
fi
echo ""
echo "Sample Credentials:"
echo "  Email: user@example.com"
echo "  Password: password123"
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