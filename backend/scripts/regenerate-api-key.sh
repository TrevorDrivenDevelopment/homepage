#!/bin/bash

# Script to regenerate the API Gateway API key
# This will create a new API key and invalidate the old one
# Usage: ./regenerate-api-key.sh

set -e

REGION="us-east-2"
ENVIRONMENT="prod"
STACK_NAME="HomepageStack"

echo "🔄 Regenerating API Gateway API Key..."
echo "Region: $REGION"
echo "Stack: $STACK_NAME"
echo ""

# Get current stack outputs
echo "📋 Getting current stack information..."
STACK_OUTPUTS=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs' \
  --output json)

if [ "$STACK_OUTPUTS" == "null" ] || [ "$STACK_OUTPUTS" == "[]" ]; then
  echo "❌ Could not find stack outputs. Make sure the stack is deployed."
  exit 1
fi

# Get current API Gateway API ID and Usage Plan
API_ID=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="ApiGatewayId") | .OutputValue')
CURRENT_API_KEY_ID=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="ApiKeyId") | .OutputValue // empty')

if [ -z "$API_ID" ]; then
  echo "❌ Could not find API Gateway ID in stack outputs"
  exit 1
fi

echo "✅ Found API Gateway ID: $API_ID"

# Get Usage Plan ID
echo "📋 Finding Usage Plan..."
USAGE_PLANS=$(aws apigateway get-usage-plans --region "$REGION" --query 'items[?contains(name, `homepage-usage-plan`)]' --output json)
USAGE_PLAN_ID=$(echo "$USAGE_PLANS" | jq -r '.[0].id // empty')

if [ -z "$USAGE_PLAN_ID" ]; then
  echo "❌ Could not find Usage Plan. Looking for any usage plan..."
  USAGE_PLANS=$(aws apigateway get-usage-plans --region "$REGION" --output json)
  echo "Available usage plans:"
  echo "$USAGE_PLANS" | jq -r '.items[] | "- \(.name) (\(.id))"'
  exit 1
fi

echo "✅ Found Usage Plan ID: $USAGE_PLAN_ID"

# Create new API key
echo "🔑 Creating new API key..."
NEW_API_KEY=$(aws apigateway create-api-key \
  --name "homepage-api-key-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)" \
  --description "Homepage API key for ${ENVIRONMENT} (regenerated $(date))" \
  --enabled \
  --region "$REGION" \
  --output json)

NEW_API_KEY_ID=$(echo "$NEW_API_KEY" | jq -r '.id')
NEW_API_KEY_VALUE=$(echo "$NEW_API_KEY" | jq -r '.value')

echo "✅ Created new API key with ID: $NEW_API_KEY_ID"

# Add new API key to usage plan
echo "🔗 Adding new API key to usage plan..."
aws apigateway create-usage-plan-key \
  --usage-plan-id "$USAGE_PLAN_ID" \
  --key-id "$NEW_API_KEY_ID" \
  --key-type "API_KEY" \
  --region "$REGION" > /dev/null

echo "✅ New API key added to usage plan"

# Store new API key in SSM Parameter Store
echo "💾 Storing new API key in SSM Parameter Store..."
aws ssm put-parameter \
  --name "/homepage/${ENVIRONMENT}/client-api-key" \
  --value "$NEW_API_KEY_VALUE" \
  --type "SecureString" \
  --description "Homepage API key for client applications (regenerated $(date))" \
  --overwrite \
  --region "$REGION" > /dev/null

echo "✅ New API key stored in SSM: /homepage/${ENVIRONMENT}/client-api-key"

# Remove old API key from usage plan (if it exists)
if [ -n "$CURRENT_API_KEY_ID" ]; then
  echo "🗑️ Removing old API key from usage plan..."
  aws apigateway delete-usage-plan-key \
    --usage-plan-id "$USAGE_PLAN_ID" \
    --key-id "$CURRENT_API_KEY_ID" \
    --region "$REGION" 2>/dev/null || echo "⚠️ Old API key was not in usage plan or already removed"
  
  echo "🗑️ Deleting old API key..."
  aws apigateway delete-api-key \
    --api-key "$CURRENT_API_KEY_ID" \
    --region "$REGION" 2>/dev/null || echo "⚠️ Old API key was already deleted"
  
  echo "✅ Old API key removed"
fi

echo ""
echo "🎉 API Key regeneration complete!"
echo ""
echo "📋 Summary:"
echo "- New API Key ID: $NEW_API_KEY_ID"
echo "- Stored in SSM: /homepage/${ENVIRONMENT}/client-api-key"
echo "- Usage Plan: $USAGE_PLAN_ID"
echo ""
echo "🔧 To retrieve the new API key:"
echo "  ./get-api-key.sh"
echo ""
echo "⚠️ Important: Update any applications using the old API key"
echo "📝 The old API key has been invalidated and will no longer work"
