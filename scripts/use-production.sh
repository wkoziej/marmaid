#!/bin/bash
# ABOUTME: Switch frontend to production environment configuration
# ABOUTME: Copies .env.production to .env.local for development use

set -e

echo "🔄 Switching to PRODUCTION environment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production not found!"
    echo "Please create the production environment file first."
    exit 1
fi

# Copy production env to local env
cp .env.production .env.local

echo "⚠️  Frontend now using PRODUCTION environment"
echo "📊 Project: aajurxtbngbixsdptfzz"
echo "🌐 URL: https://aajurxtbngbixsdptfzz.supabase.co"
echo ""
echo "🚨 WARNING: You are now connected to PRODUCTION database!"
echo "Use with caution. Run 'npm run dev' to start development server"