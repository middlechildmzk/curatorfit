-- CuratorFit V2 SaaS Mode migration notes
-- Run after supabase/schema.sql. This file adds SaaS-mode helper tables.

create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text default 'artist',
  source text default 'site',
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists pitch_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  campaign_id uuid,
  campaign_target_id uuid,
  target_type text,
  song_title text,
  artist_name text,
  pitch_body text not null,
  ai_generated boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists campaign_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  campaign_id uuid,
  title text not null,
  due_date date,
  status text default 'open',
  source text default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table waitlist_signups enable row level security;
alter table pitch_drafts enable row level security;
alter table campaign_tasks enable row level security;

create policy if not exists "Users can read their own pitch drafts" on pitch_drafts for select using (auth.uid() = user_id);
create policy if not exists "Users can insert their own pitch drafts" on pitch_drafts for insert with check (auth.uid() = user_id);
create policy if not exists "Users can update their own pitch drafts" on pitch_drafts for update using (auth.uid() = user_id);

create policy if not exists "Users can read their own campaign tasks" on campaign_tasks for select using (auth.uid() = user_id);
create policy if not exists "Users can insert their own campaign tasks" on campaign_tasks for insert with check (auth.uid() = user_id);
create policy if not exists "Users can update their own campaign tasks" on campaign_tasks for update using (auth.uid() = user_id);
