# Environment Management Guide

## 📋 Overview

Marmaid uses three isolated environments for development, testing, and production:

- **Development** - Local Supabase (Docker) - `localhost`
- **Test** - Remote Supabase - `myxicttnpflkwnofbhci.supabase.co`
- **Production** - Remote Supabase - `aajurxtbngbixsdptfzz.supabase.co`

## 🔧 Environment Configuration

### Environment Files
- `.env.local` - Development (copied from .env.production or .env.test)
- `.env.test` - Test environment variables
- `.env.production` - Production environment variables

### Environment Management CLI

Use the unified CLI for all environment operations:

```bash
# Switch environments
./scripts/env use test       # Switch to test environment
./scripts/env use prod       # Switch to production environment  
./scripts/env use local      # Switch to local development

# Check current status
./scripts/env status         # Show current environment

# Database operations
./scripts/env link test      # Link CLI to test project
./scripts/env link prod      # Link CLI to production project
./scripts/env migrate name   # Create new migration
./scripts/env push test      # Push migrations to test
./scripts/env push prod      # Push migrations to production

# Testing
./scripts/env test           # Test environment isolation
```

## 🚀 Deployment Workflow

### 1. Development
```bash
# Start local Supabase
npx supabase start

# Run frontend in dev mode
cd frontend && npm run dev
```

### 2. Testing
```bash
# Switch to test environment
./scripts/use-test.sh

# Run tests against test database
npm run test:integration
```

### 3. Production Deployment
```bash
# Link to production project
npx supabase link --project-ref aajurxtbngbixsdptfzz --password [PROD_PASSWORD]

# Push migrations to production
npx supabase db push --password [PROD_PASSWORD]

# Switch to production environment
./scripts/use-production.sh

# Build and deploy
npm run build
```

## 📊 Database Migrations

### Creating Migrations
```bash
npx supabase migration new migration_name
# Edit: supabase/migrations/TIMESTAMP_migration_name.sql
```

### Testing Migrations
```bash
# Link to test project
npx supabase link --project-ref myxicttnpflkwnofbhci --password HcBvx3GVYiRKNs5a

# Push to test
npx supabase db push --password HcBvx3GVYiRKNs5a
```

### Production Migrations
```bash
# Link to production
npx supabase link --project-ref aajurxtbngbixsdptfzz --password [PROD_PASSWORD]

# Push to production
npx supabase db push --password [PROD_PASSWORD]
```

## 🔍 Environment Verification

### API Test Commands
```bash
# Test environment API
curl -H "apikey: [TEST_ANON_KEY]" "https://myxicttnpflkwnofbhci.supabase.co/rest/v1/therapists"

# Production environment API
curl -H "apikey: [PROD_ANON_KEY]" "https://aajurxtbngbixsdptfzz.supabase.co/rest/v1/therapists"
```

## 🚨 Troubleshooting

### Network Connection Issues
If CLI connection fails:
```bash
# Add to /etc/hosts (requires sudo)
echo "3.131.201.192 aws-1-us-east-2.pooler.supabase.com" | sudo tee -a /etc/hosts
```

### Authentication Issues
- Verify database password in Supabase Dashboard → Settings → Database
- Use explicit --password flag with CLI commands

## 🔐 Security Notes

- Never commit database passwords to git
- Store passwords in .env.* files (gitignored)
- Use different passwords for each environment
- Regularly rotate database passwords