# LingoCoach Cloud Functions Deployment Script
# This script helps you deploy Cloud Functions to Firebase

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "LingoCoach Cloud Functions Deploy" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "functions")) {
    Write-Host "❌ Error: functions directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root." -ForegroundColor Yellow
    exit 1
}

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
Set-Location functions
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 2: Check for .env file
Write-Host ""
Write-Host "🔑 Step 2: Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit functions/.env and add your GEMINI_API_KEY" -ForegroundColor Red
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if API key is set
$envContent = Get-Content ".env" -Raw
if ($envContent -match "your_gemini_api_key_here") {
    Write-Host "⚠️  Warning: GEMINI_API_KEY is not configured!" -ForegroundColor Red
    Write-Host "Please edit functions/.env and add your actual API key." -ForegroundColor Yellow
    exit 1
}

# Step 3: Build TypeScript
Write-Host ""
Write-Host "🔨 Step 3: Building TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 4: Deploy to Firebase
Write-Host ""
Write-Host "🚀 Step 4: Deploying to Firebase..." -ForegroundColor Yellow
Set-Location ..
firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Cloud Functions are now live at:" -ForegroundColor Cyan
    Write-Host "- generateSentence" -ForegroundColor White
    Write-Host "- analyzeTranslation" -ForegroundColor White
    Write-Host ""
    Write-Host "Region: asia-southeast1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}
