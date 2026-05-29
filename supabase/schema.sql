-- CuratorFit V1.1 Supabase schema
-- Safe playlist directory + multi-channel promotion target graph.
-- Run in Supabase SQL editor after creating a project.

create extension if not exists "uuid-ossp";

create type user_role as enum ('artist', 'curator', 'admin');
create type claim_intent as enum ('claim', 'update_preferences', 'opt_out', 'apply');
create type target_status as enum ('seed', 'unclaimed', 'claimed', 'verified', 'partner', 'approved', 'needs_info', 'paused', 'opted_out', 'rejected', 'removed');
create type target_type as enum ('spotify_playlist', 'soundcloud_channel', 'youtube_channel', 'tiktok_creator', 'blog', 'radio', 'label', 'sync_library');
create type risk_level as enum ('low', 'medium', 'review', 'blocked');
create type submission_status as enum ('saved', 'researching', 'pitch_drafted', 'pitched', 'pending_review', 'reviewed', 'follow_up', 'added', 'passed', 'not_a_fit', 'do_not_contact', 'expired');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role user_role default 'artist',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table artist_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  artist_name text not null,
  spotify_artist_url text,
  soundcloud_url text,
  youtube_url text,
  tiktok_url text,
  website_url text,
  primary_genres text[] default '{}',
  created_at timestamptz default now()
);

create table curator_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  display_name text not null,
  bio text,
  website_url text,
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  contact_email text,
  accepted_genres text[] default '{}',
  accepted_channels target_type[] default '{}',
  hard_nos text[] default '{}',
  status target_status default 'unclaimed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table promotion_targets (
  id uuid primary key default uuid_generate_v4(),
  curator_id uuid references curator_profiles(id) on delete set null,
  type target_type not null default 'spotify_playlist',
  external_id text,
  url text not null,
  slug text unique not null,
  name text not null,
  description text,
  genre text,
  genres text[] default '{}',
  moods text[] default '{}',
  fit_tags text[] default '{}',
  audience_size_label text,
  audience_count integer,
  contact_method text,
  submission_rules text,
  fit_notes text,
  risk_notes text,
  source_url text,
  import_batch_id uuid,
  verification_notes text,
  reviewed_by uuid references profiles(id) on delete set null,
  last_reviewed_at timestamptz,
  status target_status default 'seed',
  risk_level risk_level default 'review',
  trust_score integer default 50 check (trust_score >= 0 and trust_score <= 100),
  update_signal text,
  last_checked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Spotify-specific compatibility table for V1 pages. Long term, read from promotion_targets.
create table playlists (
  id uuid primary key default uuid_generate_v4(),
  promotion_target_id uuid references promotion_targets(id) on delete set null,
  curator_id uuid references curator_profiles(id) on delete set null,
  spotify_playlist_id text,
  spotify_url text not null,
  slug text unique not null,
  name text not null,
  description text,
  genre text,
  moods text[] default '{}',
  fit_tags text[] default '{}',
  followers integer default 0,
  status target_status default 'seed',
  risk_level risk_level default 'review',
  trust_score integer default 50 check (trust_score >= 0 and trust_score <= 100),
  update_signal text,
  last_checked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table import_batches (
  id uuid primary key default uuid_generate_v4(),
  file_name text,
  row_count integer default 0,
  status text default 'uploaded',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table target_claims (
  id uuid primary key default uuid_generate_v4(),
  promotion_target_id uuid references promotion_targets(id) on delete set null,
  playlist_id uuid references playlists(id) on delete set null,
  name text not null,
  email text not null,
  target_url text not null,
  intent claim_intent default 'claim',
  notes text,
  status text default 'new',
  admin_notes text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- Backwards-compatible alias name for old claim form code/docs.
create view playlist_claims as select * from target_claims;

create table curator_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  display_name text not null,
  email text not null,
  primary_url text not null,
  channels text[] default '{}',
  genres text[] default '{}',
  hard_nos text[] default '{}',
  notes text,
  status text default 'new',
  admin_notes text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  email text,
  type text not null,
  title text not null,
  body text,
  status text default 'queued',
  created_at timestamptz default now()
);

create table pitch_templates (
  id uuid primary key default uuid_generate_v4(),
  campaign_target_id uuid references campaign_targets(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  template_type text default 'curator_safe',
  pitch_text text not null,
  created_at timestamptz default now()
);

create table tracks (
  id uuid primary key default uuid_generate_v4(),
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  title text,
  track_url text,
  release_date date,
  hook_timestamp_seconds integer,
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  track_id uuid references tracks(id) on delete set null,
  name text not null,
  goal text default 'pitch_tracking',
  status text default 'planning',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table campaign_targets (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  promotion_target_id uuid references promotion_targets(id) on delete cascade,
  playlist_id uuid references playlists(id) on delete set null,
  channel target_type,
  fit_score integer default 0,
  pitch_status submission_status default 'saved',
  pitch_text text,
  response_notes text,
  follow_up_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  unique(campaign_id, promotion_target_id)
);

create table submissions (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  promotion_target_id uuid references promotion_targets(id) on delete set null,
  playlist_id uuid references playlists(id) on delete set null,
  status submission_status default 'saved',
  pitch_text text,
  curator_feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table saved_targets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  promotion_target_id uuid references promotion_targets(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, promotion_target_id)
);

create table saved_playlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  playlist_id uuid references playlists(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, playlist_id)
);

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table artist_profiles enable row level security;
alter table curator_profiles enable row level security;
alter table promotion_targets enable row level security;
alter table playlists enable row level security;
alter table import_batches enable row level security;
alter table target_claims enable row level security;
alter table curator_applications enable row level security;
alter table notifications enable row level security;
alter table pitch_templates enable row level security;
alter table tracks enable row level security;
alter table campaigns enable row level security;
alter table campaign_targets enable row level security;
alter table submissions enable row level security;
alter table saved_targets enable row level security;
alter table saved_playlists enable row level security;
alter table audit_logs enable row level security;

create policy "public can read published targets" on promotion_targets for select using (status in ('seed','unclaimed','claimed','verified','partner'));
create policy "public can read published playlists" on playlists for select using (status in ('seed','unclaimed','claimed','verified','partner'));
create policy "public can read curator profiles" on curator_profiles for select using (status in ('seed','unclaimed','claimed','verified','partner'));
create policy "anyone can create target claims" on target_claims for insert with check (true);
create policy "anyone can create curator applications" on curator_applications for insert with check (true);
create policy "users read own saved targets" on saved_targets for select using (auth.uid() = user_id);
create policy "users manage own saved targets" on saved_targets for all using (auth.uid() = user_id);
create policy "users read own saved playlists" on saved_playlists for select using (auth.uid() = user_id);
create policy "users manage own saved playlists" on saved_playlists for all using (auth.uid() = user_id);
create policy "users read own artist profile" on artist_profiles for select using (auth.uid() = user_id);
create policy "users manage own tracks" on tracks for all using (artist_profile_id in (select id from artist_profiles where user_id = auth.uid()));
create policy "users manage own campaigns" on campaigns for all using (artist_profile_id in (select id from artist_profiles where user_id = auth.uid()));
create policy "users manage own campaign targets" on campaign_targets for all using (campaign_id in (select c.id from campaigns c join artist_profiles a on a.id = c.artist_profile_id where a.user_id = auth.uid()));
create policy "users manage own submissions" on submissions for all using (campaign_id in (select c.id from campaigns c join artist_profiles a on a.id = c.artist_profile_id where a.user_id = auth.uid()));

-- V1.3 auth/dashboard policies and helper indexes
-- These use DO blocks because Postgres does not support CREATE POLICY IF NOT EXISTS.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'users can read own profile') then
    create policy "users can read own profile" on profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'users can insert own profile') then
    create policy "users can insert own profile" on profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'users can update own profile') then
    create policy "users can update own profile" on profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'artist_profiles' and policyname = 'users can insert artist profile') then
    create policy "users can insert artist profile" on artist_profiles for insert with check (auth.uid() = user_id or user_id is null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'artist_profiles' and policyname = 'users update own artist profile') then
    create policy "users update own artist profile" on artist_profiles for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'curator_profiles' and policyname = 'users insert curator profile') then
    create policy "users insert curator profile" on curator_profiles for insert with check (auth.uid() = user_id or user_id is null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'curator_profiles' and policyname = 'users update own curator profile') then
    create policy "users update own curator profile" on curator_profiles for update using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_promotion_targets_slug on promotion_targets(slug);
create index if not exists idx_playlists_slug on playlists(slug);
create index if not exists idx_target_claims_status on target_claims(status);
create index if not exists idx_campaign_targets_status on campaign_targets(pitch_status);
create index if not exists idx_promotion_targets_status on promotion_targets(status);
create index if not exists idx_promotion_targets_import_batch on promotion_targets(import_batch_id);
create index if not exists idx_import_batches_created_at on import_batches(created_at);
create index if not exists idx_curator_applications_status on curator_applications(status);

-- V1.4 user-owned campaign/profile refinements
create index if not exists idx_artist_profiles_user_id on artist_profiles(user_id);
create index if not exists idx_curator_profiles_user_id on curator_profiles(user_id);
create index if not exists idx_campaigns_artist_profile on campaigns(artist_profile_id);
create index if not exists idx_campaign_targets_campaign on campaign_targets(campaign_id);

-- Optional convenience view for admin/review dashboards.
create or replace view campaign_review_queue as
select
  c.id as campaign_id,
  c.name as campaign_name,
  c.status as campaign_status,
  ap.artist_name,
  t.title as track_title,
  pt.name as target_name,
  pt.type as target_type,
  ct.pitch_status,
  ct.notes,
  ct.created_at
from campaigns c
left join artist_profiles ap on ap.id = c.artist_profile_id
left join tracks t on t.id = c.track_id
left join campaign_targets ct on ct.campaign_id = c.id
left join promotion_targets pt on pt.id = ct.promotion_target_id;
