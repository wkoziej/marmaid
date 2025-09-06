# Integration Tests Setup

Integration tests require a Supabase database with applied migrations to work correctly.

## Prerequisites

1. **Supabase Project**: You need access to a Supabase project (test environment)
2. **Database Migrations**: Migrations from `../supabase/migrations/` must be applied
3. **Environment Variables**: Required environment variables must be set

## Required Environment Variables

Create `.env.test.local` file in the frontend directory with:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The integration tests expect these tables to exist:

### 1. `therapists` table
- Created by: `20250901174855_create_therapists_table.sql`
- Required for: User authentication and profile management

### 2. `clients` table  
- Created by: `20250903000000_create_clients_table.sql`
- Required for: Client profile creation and RLS testing
- Includes RLS policies for therapist data isolation

### 3. `audit_logs` table
- Created by: `20250903000001_create_audit_logs_table.sql`
- Required for: Audit functionality testing

### 4. Helper Functions
- Created by: `20250904000000_add_rls_helper_function.sql`
- Required for: RLS policy validation in tests

## Applying Migrations

If you have Supabase CLI installed:

```bash
cd ../supabase
supabase db push
```

Or apply the SQL files manually in your Supabase dashboard.

## Running Integration Tests

Once the database is set up:

```bash
npm run test:integration
```

## Troubleshooting

### Common Errors:

1. **"Could not find the table 'public.clients'"**
   - Solution: Apply the clients table migration

2. **"Could not find the function public.check_table_rls_enabled"**
   - Solution: Apply the RLS helper function migration

3. **"Email address is invalid"**
   - Solution: Check Supabase Auth settings allow sign-ups

4. **Tests skipped in CI**
   - Solution: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are set

## CI/CD Setup

For GitHub Actions or other CI systems:

1. Set up a test Supabase project
2. Add environment variables as secrets
3. Apply migrations before running tests
4. Quality gates will automatically run integration tests when credentials are available