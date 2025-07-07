#!/bin/bash

echo "🧪 Testing SpendAI Backend API"
echo "================================"

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s http://localhost:8000/health | jq .
echo ""

# Test 2: Register User
echo "2. Registering New User..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com", "password": "password123"}')

echo $REGISTER_RESPONSE | jq .

# Extract token
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo ""

if [ "$TOKEN" != "null" ]; then
    echo "✅ Registration successful! Token: ${TOKEN:0:50}..."
    
    # Test 3: Upload File
    echo ""
    echo "3. Uploading Transaction File..."
    UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:8000/api/upload \
      -H "Authorization: Bearer $TOKEN" \
      -F "transactions=@../sample-data/sample-transactions.csv")
    
    echo $UPLOAD_RESPONSE | jq .
    echo ""
    
    # Test 4: Check Database
    echo "4. Checking Database..."
    TRANSACTION_COUNT=$(sqlite3 data/spendai.db "SELECT COUNT(*) FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com');")
    echo "📊 Total transactions for test user: $TRANSACTION_COUNT"
    
else
    echo "❌ Registration failed!"
fi

echo ""
echo "�� Testing Complete!" 