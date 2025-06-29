#!/bin/bash

# Test script for backend API endpoints
# Usage: ./test-api.sh [API_URL]

API_URL=${1:-"http://localhost:3000"}

echo "🧪 Testing Homepage Backend API"
echo "🔗 API URL: $API_URL"
echo

# Test health endpoint
echo "1️⃣ Testing health endpoint..."
curl -s "$API_URL/api/health" | jq '.' || echo "❌ Health check failed"
echo

# Test stock quote endpoint
echo "2️⃣ Testing stock quote endpoint (AAPL)..."
curl -s "$API_URL/api/options/stock/AAPL" | jq '.' || echo "❌ Stock quote failed"
echo

# Test options chain endpoint  
echo "3️⃣ Testing options chain endpoint (AAPL)..."
curl -s "$API_URL/api/options/chain/AAPL" | jq '.data.calls[0:3]' || echo "❌ Options chain failed"
echo

# Test error handling
echo "4️⃣ Testing error handling (invalid symbol)..."
curl -s "$API_URL/api/options/stock/INVALID123" | jq '.' || echo "❌ Error handling test failed"
echo

echo "✅ API testing complete!"
echo
echo "💡 Usage examples:"
echo "  Health check: curl $API_URL/api/health"
echo "  Stock quote:  curl $API_URL/api/options/stock/AAPL"
echo "  Options data: curl $API_URL/api/options/chain/AAPL"
