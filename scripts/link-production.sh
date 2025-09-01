#!/bin/bash
# ABOUTME: Link Supabase CLI to production project for migrations
# ABOUTME: Prompts for production database password for security

set -e

echo "🔗 Linking Supabase CLI to PRODUCTION project..."
echo "⚠️  WARNING: This will connect to PRODUCTION database!"
echo ""

# Prompt for production password
read -s -p "Enter PRODUCTION database password: " PROD_PASS
echo ""

if [ -z "$PROD_PASS" ]; then
    echo "❌ Error: No password provided"
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