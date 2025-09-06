#!/bin/bash
# ABOUTME: Start complete development environment
# ABOUTME: Starts Supabase local + frontend dev server with health checks

set -e

echo "🚀 Starting Marmaid development environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

# Check if Supabase is already running
if curl -s http://127.0.0.1:54321/health > /dev/null 2>&1; then
    print_success "Supabase local is already running"
else
    print_status "Starting Supabase local..."
    supabase start
    
    # Wait for Supabase to be ready
    echo "Waiting for Supabase to be ready..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if curl -s http://127.0.0.1:54321/health > /dev/null 2>&1; then
            break
        fi
        sleep 1
        timeout=$((timeout-1))
    done
    
    if [ $timeout -eq 0 ]; then
        echo "❌ Supabase failed to start within 30 seconds"
        exit 1
    fi
    
    print_success "Supabase local is ready"
fi

# Show Supabase URLs
echo ""
echo -e "${BLUE}🔗 Supabase Local URLs:${NC}"
echo "  • API: http://127.0.0.1:54321"
echo "  • Admin: http://127.0.0.1:54323" 
echo "  • Inbucket (emails): http://127.0.0.1:54324"
echo ""

# Start frontend development server
print_status "Starting frontend development server..."
cd frontend

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Please run setup first:"
    echo "   npm run setup"
    exit 1
fi

echo -e "${BLUE}🌐 Frontend will be available at:${NC}"
echo "  • Local: http://localhost:5173"
echo "  • Network: http://[your-ip]:5173"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"
echo ""

# Start Vite dev server
npm run dev