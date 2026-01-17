#!/bin/bash

# LingoCoach Cloud Functions Deployment Script
# This script helps you deploy Cloud Functions to Firebase

echo "=================================="
echo "LingoCoach Cloud Functions Deploy"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "functions" ]; then
    echo "❌ Error: functions directory not found!"
    echo "Please run this script from the project root."
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
cd functions
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Step 2: Check for .env file
echo ""
echo "🔑 Step 2: Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit functions/.env and add your GEMINI_API_KEY"
    echo "Then run this script again."
    exit 1
fi

# Check if API key is set
if grep -q "your_gemini_api_key_here" .env; then
    echo "⚠️  Warning: GEMINI_API_KEY is not configured!"
    echo "Please edit functions/.env and add your actual API key."
    exit 1
fi

# Step 3: Build TypeScript
echo ""
echo "🔨 Step 3: Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Step 4: Deploy to Firebase
echo ""
echo "🚀 Step 4: Deploying to Firebase..."
cd ..
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Your Cloud Functions are now live at:"
    echo "- generateSentence"
    echo "- analyzeTranslation"
    echo ""
    echo "Region: asia-southeast1"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check the error messages above."
    exit 1
fi
