#!/bin/bash

# Script to retrieve the Homepage API key from AWS SSM Parameter Store
# Usage: ./get-api-key.sh [environment]

ENVIRONMENT=${1:-prod}
PARAMETER_NAME="/homepage/${ENVIRONMENT}/client-api-key"
REGION="us-east-2"

echo "🔑 Retrieving API key from SSM Parameter Store..."
echo "Parameter: $PARAMETER_NAME"
echo "Region: $REGION"
echo ""

# Get the API key value
API_KEY=$(aws ssm get-parameter \
  --name "$PARAMETER_NAME" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region "$REGION" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$API_KEY" ]; then
  echo "✅ API Key retrieved successfully:"
  echo "X-Api-Key: $API_KEY"
  echo ""
  echo "📋 Example usage:"
  echo "curl -H \"X-Api-Key: $API_KEY\" https://your-api-url/api/options/stock/AAPL"
  echo ""
  echo "💾 To export as environment variable:"
  echo "export HOMEPAGE_API_KEY=\"$API_KEY\""
else
  echo "❌ Failed to retrieve API key from SSM"
  echo "Make sure you have AWS credentials configured and the parameter exists."
  echo ""
  echo "🔍 Debug: Check if parameter exists:"
  echo "aws ssm describe-parameters --parameter-filters \"Key=Name,Values=$PARAMETER_NAME\" --region $REGION"
  exit 1
fi
