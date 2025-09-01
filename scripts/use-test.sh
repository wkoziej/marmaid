#!/bin/bash
# ABOUTME: Switch frontend to test environment configuration
# ABOUTME: Copies .env.test to .env.local for development use

set -e

echo "🔄 Switching to TEST environment..."

# Check if .env.test exists
if [ ! -f "frontend/.env.test" ]; then
    echo "❌ Error: frontend/.env.test not found!"
    echo "Please create the test environment file first."
    exit 1
fi

# Copy test env to local env
cp frontend/.env.test frontend/.env.local

echo "✅ Frontend now using TEST environment"
echo "📊 Project: myxicttnpflkwnofbhci"  
echo "🌐 URL: https://myxicttnpflkwnofbhci.supabase.co"
echo ""
echo "Run 'npm run dev' in frontend/ to start development server"