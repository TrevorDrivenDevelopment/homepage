#!/bin/bash

# Build script for backend deployment with Bun
set -e

echo "🔨 Building backend with Bun..."

# Clean previous build
rm -rf dist

# Install dependencies with Bun
echo "📦 Installing dependencies with Bun..."
bun install

# Run TypeScript compilation (for Lambda compatibility)
echo "🏗️  Compiling TypeScript..."
bun run build:tsc

# Copy package.json for Lambda runtime
cp package.json dist/
# Note: bun doesn't generate lockfiles in the same way, so we'll create a minimal one
echo '{"lockfileVersion": 3}' > dist/package-lock.json

# Install production dependencies in dist for Lambda
cd dist
echo "📦 Installing production dependencies for Lambda..."
# Use npm for Lambda compatibility (AWS Lambda runtime expects npm-style dependencies)
npm install --only=production --no-package-lock
cd ..

echo "✅ Backend build complete!"
echo "📁 Build artifacts are in the dist/ directory"
echo "🎯 Ready for SAM deployment"
