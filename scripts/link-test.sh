#!/bin/bash
# ABOUTME: Link Supabase CLI to test project for migrations
# ABOUTME: Uses password from .env.test file

set -e

echo "🔗 Linking Supabase CLI to TEST project..."
echo "⚠️  WARNING: This will connect to TEST database!"
echo ""

# Load test password from .env.test
if [ -f ".env.test" ]; then
    source .env.test
    TEST_PASS="$TEST_SUPABASE_DB_PASSWORD"
    echo "✅ Loaded password from .env.test"
else
    echo "❌ Error: .env.test file not found"
    echo "Create .env.test with TEST_SUPABASE_DB_PASSWORD=your_password"
    exit 1
fi

if [ -z "$TEST_PASS" ]; then
    echo "❌ Error: TEST_SUPABASE_DB_PASSWORD not set in .env.test"
    exit 1
fi

# Link to test project
npx supabase link --project-ref myxicttnpflkwnofbhci --password "$TEST_PASS"

echo "✅ Successfully linked to TEST project"
echo "📊 Project: myxicttnpflkwnofbhci"
echo ""
echo "🧪 WARNING: You are now connected to TEST!"
echo "Ready to run:"
echo "  npx supabase db push --password [PASSWORD]"
echo "  npx supabase migration new migration_name"