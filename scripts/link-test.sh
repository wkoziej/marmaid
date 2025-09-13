#!/bin/bash
# ABOUTME: Link Supabase CLI to test project for migrations
# ABOUTME: Uses password from frontend/.env.test file

set -e

echo "🔗 Linking Supabase CLI to TEST project..."

# Check if .env.test exists and has TEST_SUPABASE_DB_PASSWORD
if [ ! -f ".env.test" ]; then
    echo "❌ Error: .env.test not found!"
    exit 1
fi

# Extract password from .env.test
DB_PASS=$(grep "^TEST_SUPABASE_DB_PASSWORD=" .env.test | cut -d'=' -f2)

if [ -z "$DB_PASS" ]; then
    echo "❌ Error: TEST_SUPABASE_DB_PASSWORD not found in .env.test"
    echo "Please add TEST_SUPABASE_DB_PASSWORD=your_password to the file"
    exit 1
fi

# Link to test project
npx supabase link --project-ref myxicttnpflkwnofbhci --password "$DB_PASS"

echo "✅ Successfully linked to TEST project"
echo "📊 Project: myxicttnpflkwnofbhci"
echo ""
echo "Ready to run:"
echo "  npx supabase db push --password $DB_PASS"
echo "  npx supabase migration new migration_name"