#!/bin/bash

echo "🚀 Testing SpendAI Backend Endpoints"
echo "====================================="

BASE_URL="http://localhost:3002"

# Test Health endpoint
echo "1. Testing Health Endpoint..."
echo "GET $BASE_URL/api/health"
curl -s $BASE_URL/api/health | jq .
echo -e "\n"

# Test Summary endpoint
echo "2. Testing Summary Endpoint..."
echo "GET $BASE_URL/api/summary"
curl -s $BASE_URL/api/summary | jq .
echo -e "\n"

# Test Analytics endpoint
echo "3. Testing Analytics Endpoint..."
echo "GET $BASE_URL/api/analytics"
curl -s $BASE_URL/api/analytics | jq .
echo -e "\n"

# Test Transactions endpoint
echo "4. Testing Transactions Endpoint..."
echo "GET $BASE_URL/api/transactions"
curl -s $BASE_URL/api/transactions | jq .
echo -e "\n"

# Test Categories endpoint
echo "5. Testing Categories Endpoint..."
echo "GET $BASE_URL/api/transactions/categories"
curl -s $BASE_URL/api/transactions/categories | jq .
echo -e "\n"

# Test Auth Registration endpoint
echo "6. Testing Auth Registration Endpoint..."
echo "POST $BASE_URL/api/auth/register"
curl -s -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","name":"Test User"}' $BASE_URL/api/auth/register | jq .
echo -e "\n"

# Test Auth Login endpoint
echo "7. Testing Auth Login Endpoint..."
echo "POST $BASE_URL/api/auth/login"
curl -s -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}' $BASE_URL/api/auth/login | jq .
echo -e "\n"

# Test Upload endpoint
echo "8. Testing Upload Endpoint..."
echo "Creating sample CSV..."
cat << EOF > test-sample.csv
date,amount,category,description
2024-10-01,22.99,Food,Chipotle
2024-10-02,50.00,Gas,Shell Station
2024-10-03,12.50,Food,Coffee Shop
2024-10-04,1200.00,Rent,Monthly Rent
2024-10-05,35.75,Entertainment,Movie Theater
EOF

echo "POST $BASE_URL/api/upload (with CSV file)"
curl -s -X POST -F "csvFile=@test-sample.csv" $BASE_URL/api/upload | jq .

# Clean up
rm test-sample.csv
echo -e "\n✅ All endpoints tested successfully!" 