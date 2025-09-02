#!/bin/bash
# ABOUTME: Local health check script for all environments
# ABOUTME: Monitors application health and reports status of dev/test/prod

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo "🏥 Marmaid Health Check Tool"
    echo ""
    echo "Usage: ./scripts/health-check.sh [environment]"
    echo ""
    echo "Environments:"
    echo "  local       Check local development environment"
    echo "  test        Check test environment"
    echo "  prod        Check production environment"  
    echo "  all         Check all environments (default)"
    echo ""
    echo "Options:"
    echo "  --verbose   Show detailed output"
    echo "  --json      Output results in JSON format"
    echo ""
}

check_url() {
    local url=$1
    local name=$2
    local timeout=${3:-10}
    
    echo -n "Checking $name ($url)... "
    
    if curl -f -s --connect-timeout $timeout --max-time 30 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}❌ UNHEALTHY${NC}"
        return 1
    fi
}

check_local() {
    echo -e "${BLUE}🏠 LOCAL ENVIRONMENT${NC}"
    echo "=================================="
    
    local local_url="http://127.0.0.1:3000"
    local supabase_url="http://127.0.0.1:54321"
    
    # Check if local dev server is running
    if check_url "$local_url" "Frontend Dev Server" 5; then
        # Check response time
        response_time=$(curl -o /dev/null -s -w "%{time_total}" "$local_url" 2>/dev/null || echo "timeout")
        echo "  Response time: ${response_time}s"
    fi
    
    # Check local Supabase
    if check_url "$supabase_url/health" "Local Supabase" 5; then
        echo "  Local database connection: Available"
    fi
    
    echo ""
}

check_test() {
    echo -e "${YELLOW}🧪 TEST ENVIRONMENT${NC}"
    echo "=================================="
    
    # Get test URL from environment config
    local test_url
    if [ -f "frontend/.env.test" ]; then
        test_supabase=$(grep "VITE_SUPABASE_URL" frontend/.env.test | cut -d'=' -f2)
        echo "Test Supabase: $test_supabase"
        
        if check_url "$test_supabase/rest/v1/" "Test Supabase API" 10; then
            echo "  Database connectivity: OK"
        fi
    else
        echo -e "${YELLOW}⚠️  Test environment not configured${NC}"
    fi
    
    # Note: Test frontend URL will be available after GitHub Pages setup
    echo "Frontend: Test deployment planned"
    echo ""
}

check_prod() {
    echo -e "${GREEN}🚀 PRODUCTION ENVIRONMENT${NC}"
    echo "=================================="
    
    local prod_frontend="https://wkoziej.github.io/marmaid/"
    local prod_supabase="https://aajurxtbngbixsdptfzz.supabase.co"
    
    # Check production frontend
    if check_url "$prod_frontend" "Production Frontend" 15; then
        response_time=$(curl -o /dev/null -s -w "%{time_total}" "$prod_frontend" 2>/dev/null || echo "timeout")
        echo "  Response time: ${response_time}s"
        
        # Check if it's actually the right content
        if curl -s "$prod_frontend" | grep -q "Marmaid\|auth\|login" 2>/dev/null; then
            echo -e "  Content check: ${GREEN}✅ Valid${NC}"
        else
            echo -e "  Content check: ${YELLOW}⚠️  Unexpected content${NC}"
        fi
    fi
    
    # Check production Supabase
    if check_url "$prod_supabase/rest/v1/" "Production Supabase API" 15; then
        echo "  Database API: Available"
    fi
    
    echo ""
}

generate_summary() {
    echo "=================================="
    echo -e "${BLUE}📊 HEALTH CHECK SUMMARY${NC}"
    echo "=================================="
    echo "Timestamp: $(date)"
    echo "All critical services checked"
    echo ""
    echo "Next steps if issues found:"
    echo "1. Check application logs"
    echo "2. Verify environment configuration"
    echo "3. Test deployment pipeline"
    echo ""
}

# Parse command line arguments
ENVIRONMENT="all"
VERBOSE=false
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        local|test|prod|all)
            ENVIRONMENT="$1"
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
echo "🏥 Marmaid Health Check - $(date)"
echo ""

case $ENVIRONMENT in
    "local")
        check_local
        ;;
    "test")
        check_test
        ;;
    "prod")
        check_prod
        ;;
    "all")
        check_local
        check_test
        check_prod
        ;;
esac

generate_summary