-- ABOUTME: Initial migration to create user profiles and authentication schema
-- ABOUTME: Sets up user roles, profiles, and Row Level Security (RLS) for authentication

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum for user roles
create type user_role as enum ('therapist', 'client', 'admin');

-- Create user_profiles table
create table public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  role user_role not null default 'therapist',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;

-- Create RLS policies
-- Users can view their own profile
create policy "Users can view own profile" 
  on public.user_profiles for select 
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" 
  on public.user_profiles for update 
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile" 
  on public.user_profiles for insert 
  with check (auth.uid() = id);

-- Create function to automatically create user profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, role)
  values (new.id, new.email, 'therapist');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.update_updated_at_column();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.user_profiles to authenticated;
grant usage on type user_role to authenticated;