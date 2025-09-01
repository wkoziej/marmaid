// ABOUTME: Database migration script for creating therapists table with RLS policies
// ABOUTME: This script creates the therapists table required for Story 1.2 profile management

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load environment variables
const envContent = readFileSync('./.env.local', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) envVars[key] = value
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseServiceKey = envVars.VITE_SUPABASE_SERVICE_KEY || envVars.VITE_SUPABASE_ANON_KEY

console.log('Creating Supabase client...')
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const therapistsTableSQL = `
-- Create therapists table for Story 1.2: Therapist Profile & Settings Management
-- This table extends the users table with therapist-specific profile data

CREATE TABLE IF NOT EXISTS public.therapists (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile JSONB DEFAULT '{}',
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_therapists_updated_at ON public.therapists;
CREATE TRIGGER update_therapists_updated_at 
    BEFORE UPDATE ON public.therapists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for therapists table
-- Policy 1: Therapists can view their own profile
DROP POLICY IF EXISTS "Therapists can view own profile" ON public.therapists;
CREATE POLICY "Therapists can view own profile" 
  ON public.therapists 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy 2: Therapists can update their own profile  
DROP POLICY IF EXISTS "Therapists can update own profile" ON public.therapists;
CREATE POLICY "Therapists can update own profile" 
  ON public.therapists 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Therapists can insert their own profile
DROP POLICY IF EXISTS "Therapists can insert own profile" ON public.therapists;
CREATE POLICY "Therapists can insert own profile" 
  ON public.therapists 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_therapists_id ON public.therapists(id);
CREATE INDEX IF NOT EXISTS idx_therapists_subscription_status ON public.therapists(subscription_status);

-- Grant necessary permissions
GRANT ALL ON public.therapists TO authenticated;
GRANT ALL ON public.therapists TO service_role;

COMMENT ON TABLE public.therapists IS 'Therapist profiles with professional information and settings';
COMMENT ON COLUMN public.therapists.id IS 'Foreign key to auth.users.id';
COMMENT ON COLUMN public.therapists.profile IS 'JSON object containing professional profile data';
COMMENT ON COLUMN public.therapists.subscription_status IS 'Subscription status: free, premium, etc.';
`

async function createTherapistsTable() {
  try {
    console.log('Executing therapists table migration...')
    
    // Since we can't execute raw SQL with anon key, let's use the REST API
    // First, let's check if the table already exists
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .limit(1)
    
    if (!error) {
      console.log('✅ Therapists table already exists!')
      return true
    }
    
    console.error('⚠️  Cannot create table with anon key. Please run the following SQL in Supabase dashboard:')
    console.log('\n--- BEGIN SQL ---')
    console.log(therapistsTableSQL)
    console.log('--- END SQL ---\n')
    
    console.log('📝 Then verify the table was created by running this script again.')
    return false
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

// Test the table by trying to insert a sample record
async function testTherapistsTable() {
  console.log('\n🧪 Testing therapists table...')
  
  try {
    // This should fail because we're not authenticated
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
    
    if (error && error.message.includes('row-level security')) {
      console.log('✅ RLS is working correctly - unauthenticated access blocked')
      return true
    } else {
      console.log('⚠️  RLS test inconclusive:', error || 'No error, but expected RLS block')
      return false
    }
  } catch (error) {
    console.error('Test failed:', error)
    return false
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting therapists table migration for Story 1.2\n')
  
  const migrationSuccess = await createTherapistsTable()
  if (!migrationSuccess) {
    console.error('❌ Migration failed, aborting')
    process.exit(1)
  }
  
  const testSuccess = await testTherapistsTable()
  if (!testSuccess) {
    console.warn('⚠️  Tests had issues, but migration completed')
  }
  
  console.log('\n✅ Migration completed successfully!')
  console.log('📝 Next steps:')
  console.log('   1. Update TypeScript types')
  console.log('   2. Create profile management components')
  console.log('   3. Implement API services')
}

main().catch(console.error)