#!/bin/bash
# ABOUTME: Switch frontend to local development environment configuration
# ABOUTME: Creates .env.local with localhost Supabase configuration

set -e

echo "🔄 Switching to LOCAL development environment..."

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker first, then run 'npx supabase start'"
    exit 1
fi

# Check if local Supabase is running
if ! curl -s http://localhost:54321/health > /dev/null; then
    echo "⚠️  Local Supabase not running. Starting it now..."
    npx supabase start
fi

# Create local environment configuration
cat > frontend/.env.local << EOF
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF

echo "✅ Frontend now using LOCAL development environment"
echo "📊 Project: Local Supabase"
echo "🌐 URL: http://127.0.0.1:54321" 
echo "🎛️  Studio: http://127.0.0.1:54323"
echo ""
echo "Run 'npm run dev' in frontend/ to start development server"