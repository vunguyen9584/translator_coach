#!/bin/bash

# Script để build và deploy LingoCoach lên Firebase
# Sử dụng: bash build-and-deploy.sh

set -e

echo "🚀 Starting LingoCoach build and deploy process..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the project
echo "🔨 Building project with Vite..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not created."
    exit 1
fi

# List dist contents
echo "📂 Build output:"
ls -lah dist/

# Deploy to Firebase
echo "🔥 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deploy complete!"
echo "🌐 Your app should now be live on Firebase!"
