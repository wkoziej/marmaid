-- ABOUTME: Test data seeding for local development and CI/CD testing environments
-- ABOUTME: This file is executed only in local/test environments, never in production

-- TODO: Add test users and sample data for E2E testing
-- Example structure:
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES ...
-- INSERT INTO public.user_profiles (id, email, role) VALUES ...

-- Note: This seed file runs automatically when:
-- 1. Running `supabase start` locally 
-- 2. During CI/CD E2E tests with local Supabase instance
-- 3. When running `supabase db reset`
-- 
-- It is NEVER executed on production or test.marmaid.pl databases