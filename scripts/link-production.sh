#!/bin/bash
# ABOUTME: Link Supabase CLI to production project for migrations
# ABOUTME: Prompts for production database password for security

set -e

echo "🔗 Linking Supabase CLI to PRODUCTION project..."
echo "⚠️  WARNING: This will connect to PRODUCTION database!"
echo ""

# Load production password from .env.production
if [ -f ".env.production" ]; then
    source .env.production
    PROD_PASS="$PROD_SUPABASE_DB_PASSWORD"
    echo "✅ Loaded password from .env.production"
else
    echo "❌ Error: .env.production file not found"
    echo "Create .env.production with PROD_SUPABASE_DB_PASSWORD=your_password"
    exit 1
fi

if [ -z "$PROD_PASS" ]; then
    echo "❌ Error: PROD_SUPABASE_DB_PASSWORD not set in .env.production"
    exit 1
fi

# Link to production project
npx supabase link --project-ref aajurxtbngbixsdptfzz --password "$PROD_PASS"

echo "✅ Successfully linked to PRODUCTION project"
echo "📊 Project: aajurxtbngbixsdptfzz"
echo ""
echo "🚨 WARNING: You are now connected to PRODUCTION!"
echo "Ready to run:"
echo "  npx supabase db push --password [PASSWORD]"
echo "  npx supabase migration new migration_name"