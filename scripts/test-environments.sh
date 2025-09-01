#!/bin/bash
# ABOUTME: Test connectivity and isolation of all environments
# ABOUTME: Verifies API endpoints and database table access using env variables

set -e

echo "🧪 Testing environment connectivity and isolation..."
echo ""

# Load environment variables
if [ ! -f "frontend/.env.test" ] || [ ! -f "frontend/.env.production" ]; then
    echo "❌ Error: Environment files not found!"
    echo "Please ensure frontend/.env.test and frontend/.env.production exist"
    exit 1
fi

# Extract variables from test environment
TEST_URL=$(grep "^VITE_SUPABASE_URL=" frontend/.env.test | cut -d'=' -f2)
TEST_KEY=$(grep "^VITE_SUPABASE_ANON_KEY=" frontend/.env.test | cut -d'=' -f2)

# Extract variables from production environment
PROD_URL=$(grep "^VITE_SUPABASE_URL=" frontend/.env.production | cut -d'=' -f2)
PROD_KEY=$(grep "^VITE_SUPABASE_ANON_KEY=" frontend/.env.production | cut -d'=' -f2)

# Validate variables
if [ -z "$TEST_URL" ] || [ -z "$TEST_KEY" ] || [ -z "$PROD_URL" ] || [ -z "$PROD_KEY" ]; then
    echo "❌ Error: Missing environment variables in .env files"
    exit 1
fi

# Test API endpoints
echo "📡 Testing API endpoints..."

echo "  • TEST environment API..."
TEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $TEST_KEY" "$TEST_URL/rest/v1/")

if [ "$TEST_RESPONSE" = "401" ]; then
    echo "    ✅ Test API responding correctly"
else
    echo "    ❌ Test API error (HTTP $TEST_RESPONSE)"
fi

echo "  • PRODUCTION environment API..."
PROD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $PROD_KEY" "$PROD_URL/rest/v1/")

if [ "$PROD_RESPONSE" = "401" ]; then
    echo "    ✅ Production API responding correctly"
else
    echo "    ❌ Production API error (HTTP $PROD_RESPONSE)"
fi

echo ""
echo "🔍 Testing database isolation..."

echo "  • Testing therapists table access..."
echo "    TEST environment:"
curl -s -H "apikey: $TEST_KEY" "$TEST_URL/rest/v1/therapists" | jq -r 'if type == "array" then "      ✅ Table exists (returns array)" else "      ❌ " + .message end'

echo "    PRODUCTION environment:"
curl -s -H "apikey: $PROD_KEY" "$PROD_URL/rest/v1/therapists" | jq -r 'if .message and (.message | contains("Could not find")) then "      ✅ Table isolated (not found)" else "      ❌ Isolation failed" end'

echo ""
echo "🎯 Environment isolation test completed!"
echo ""
echo "Expected results:"
echo "  • TEST environment should have therapists table"
echo "  • PRODUCTION environment should NOT have therapists table"
echo "  • This confirms proper isolation between environments"