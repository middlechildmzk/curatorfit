-- ArtistOS Release Command Center foundation
-- Shared graph: release -> smart link -> campaign -> target -> evidence -> fan.
-- This migration extends CuratorFit in place and preserves existing identifiers.

create extension if not exists "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE release_status AS ENUM ('draft', 'scheduled', 'live', 'catalog', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smart_link_mode AS ENUM ('presave', 'live', 'private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_method AS ENUM ('public_api', 'account_oauth', 'artist_oauth', 'professional_oauth', 'live_url', 'screenshot', 'third_party', 'self_reported', 'inference');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contradiction_state AS ENUM ('clear', 'possible', 'conflicting', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE consent_type AS ENUM ('email_marketing', 'privacy_terms', 'analytics', 'sms_marketing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

create table if not exists releases (
  id uuid primary key default uuid_generate_v4(),
  artist_profile_id uuid not null references artist_profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  primary_artist_name text not null,
  release_type text not null default 'single' check (release_type in ('single', 'ep', 'album', 'remix', 'other')),
  status release_status not null default 'draft',
  isrc text,
  upc text,
  release_date date,
  artwork_url text,
  source_url text,
  private_audio_url text,
  metadata_source text not null default 'manual',
  metadata_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists smart_links (
  id uuid primary key default uuid_generate_v4(),
  release_id uuid not null references releases(id) on delete cascade,
  slug text unique not null,
  mode smart_link_mode not null default 'live',
  headline text,
  description text,
  capture_email boolean not null default true,
  consent_copy_version text not null default '2026-07-v1',
  meta_pixel_id text,
  tiktok_pixel_id text,
  google_analytics_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists smart_link_destinations (
  id uuid primary key default uuid_generate_v4(),
  smart_link_id uuid not null references smart_links(id) on delete cascade,
  service text not null,
  url text not null,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (smart_link_id, service)
);

alter table tracks add column if not exists release_id uuid references releases(id) on delete set null;
alter table campaigns add column if not exists release_id uuid references releases(id) on delete set null;

alter table promotion_targets add column if not exists verification_level text not null default 'L6' check (verification_level in ('L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11'));
alter table promotion_targets add column if not exists verification_confidence numeric(4,3) not null default 0.650 check (verification_confidence >= 0 and verification_confidence <= 1);
alter table promotion_targets add column if not exists verification_method text;
alter table promotion_targets add column if not exists last_verified_at timestamptz;
alter table promotion_targets add column if not exists verification_expires_at timestamptz;

create table if not exists campaign_deliverables (
  id uuid primary key default uuid_generate_v4(),
  campaign_target_id uuid not null references campaign_targets(id) on delete cascade,
  deliverable_type text not null,
  description text,
  required_disclosure text,
  due_at timestamptz,
  status text not null default 'planned' check (status in ('planned', 'accepted', 'scheduled', 'delivered', 'verified', 'disputed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evidence_records (
  id uuid primary key default uuid_generate_v4(),
  release_id uuid references releases(id) on delete cascade,
  campaign_target_id uuid references campaign_targets(id) on delete cascade,
  deliverable_id uuid references campaign_deliverables(id) on delete cascade,
  verification_level text not null check (verification_level in ('L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11')),
  method evidence_method not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'failed', 'expired', 'superseded')),
  evidence_url text,
  screenshot_path text,
  content_hash text,
  raw_payload jsonb not null default '{}'::jsonb,
  confidence_score numeric(4,3) not null check (confidence_score >= 0 and confidence_score <= 1),
  contradiction contradiction_state not null default 'clear',
  observed_at timestamptz not null default now(),
  verified_at timestamptz,
  expires_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (release_id is not null or campaign_target_id is not null or deliverable_id is not null)
);

create table if not exists fans (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references profiles(id) on delete cascade,
  source_smart_link_id uuid references smart_links(id) on delete set null,
  email text not null,
  normalized_email text not null,
  first_name text,
  country_code text,
  source_channel text,
  source_campaign text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, normalized_email)
);

create table if not exists fan_consents (
  id uuid primary key default uuid_generate_v4(),
  fan_id uuid not null references fans(id) on delete cascade,
  type consent_type not null,
  granted boolean not null,
  policy_version text not null,
  source_url text,
  ip_hash text,
  user_agent_hash text,
  evidence jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

create table if not exists link_events (
  id uuid primary key default uuid_generate_v4(),
  smart_link_id uuid not null references smart_links(id) on delete cascade,
  fan_id uuid references fans(id) on delete set null,
  event_type text not null check (event_type in ('page_view', 'destination_click', 'fan_signup', 'presave_intent')),
  destination_service text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  country_code text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

alter table releases enable row level security;
alter table smart_links enable row level security;
alter table smart_link_destinations enable row level security;
alter table campaign_deliverables enable row level security;
alter table evidence_records enable row level security;
alter table fans enable row level security;
alter table fan_consents enable row level security;
alter table link_events enable row level security;

DO $$ BEGIN
  CREATE POLICY "artists select own releases" ON releases FOR SELECT TO authenticated
  USING (artist_profile_id in (select id from artist_profiles where user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists insert own releases" ON releases FOR INSERT TO authenticated
  WITH CHECK (artist_profile_id in (select id from artist_profiles where user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists update own releases" ON releases FOR UPDATE TO authenticated
  USING (artist_profile_id in (select id from artist_profiles where user_id = (select auth.uid())))
  WITH CHECK (artist_profile_id in (select id from artist_profiles where user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists delete own releases" ON releases FOR DELETE TO authenticated
  USING (artist_profile_id in (select id from artist_profiles where user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "artists manage own smart links" ON smart_links FOR ALL TO authenticated
  USING (release_id in (select r.id from releases r join artist_profiles a on a.id = r.artist_profile_id where a.user_id = (select auth.uid())))
  WITH CHECK (release_id in (select r.id from releases r join artist_profiles a on a.id = r.artist_profile_id where a.user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists manage own link destinations" ON smart_link_destinations FOR ALL TO authenticated
  USING (smart_link_id in (select sl.id from smart_links sl join releases r on r.id = sl.release_id join artist_profiles a on a.id = r.artist_profile_id where a.user_id = (select auth.uid())))
  WITH CHECK (smart_link_id in (select sl.id from smart_links sl join releases r on r.id = sl.release_id join artist_profiles a on a.id = r.artist_profile_id where a.user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "artists read own deliverables" ON campaign_deliverables FOR SELECT TO authenticated
  USING (campaign_target_id in (select ct.id from campaign_targets ct join campaigns c on c.id = ct.campaign_id join artist_profiles a on a.id = c.artist_profile_id where a.user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists manage own deliverables" ON campaign_deliverables FOR ALL TO authenticated
  USING (campaign_target_id in (select ct.id from campaign_targets ct join campaigns c on c.id = ct.campaign_id join artist_profiles a on a.id = c.artist_profile_id where a.user_id = (select auth.uid())))
  WITH CHECK (campaign_target_id in (select ct.id from campaign_targets ct join campaigns c on c.id = ct.campaign_id join artist_profiles a on a.id = c.artist_profile_id where a.user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "artists read own evidence" ON evidence_records FOR SELECT TO authenticated
  USING (
    release_id in (select r.id from releases r join artist_profiles a on a.id = r.artist_profile_id where a.user_id = (select auth.uid()))
    OR campaign_target_id in (select ct.id from campaign_targets ct join campaigns c on c.id = ct.campaign_id join artist_profiles a on a.id = c.artist_profile_id where a.user_id = (select auth.uid()))
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists append own evidence" ON evidence_records FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (select auth.uid())
    AND (
      release_id in (select r.id from releases r join artist_profiles a on a.id = r.artist_profile_id where a.user_id = (select auth.uid()))
      OR campaign_target_id in (select ct.id from campaign_targets ct join campaigns c on c.id = ct.campaign_id join artist_profiles a on a.id = c.artist_profile_id where a.user_id = (select auth.uid()))
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "artists read own fans" ON fans FOR SELECT TO authenticated
  USING (owner_user_id = (select auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists update own fans" ON fans FOR UPDATE TO authenticated
  USING (owner_user_id = (select auth.uid()))
  WITH CHECK (owner_user_id = (select auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists delete own fans" ON fans FOR DELETE TO authenticated
  USING (owner_user_id = (select auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists read own fan consents" ON fan_consents FOR SELECT TO authenticated
  USING (fan_id in (select id from fans where owner_user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "artists read own link events" ON link_events FOR SELECT TO authenticated
  USING (smart_link_id in (select sl.id from smart_links sl join releases r on r.id = sl.release_id join artist_profiles a on a.id = r.artist_profile_id where a.user_id = (select auth.uid())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

create index if not exists idx_releases_artist_created on releases(artist_profile_id, created_at desc);
create index if not exists idx_releases_isrc on releases(isrc) where isrc is not null;
create index if not exists idx_releases_upc on releases(upc) where upc is not null;
create index if not exists idx_smart_links_release on smart_links(release_id);
create index if not exists idx_smart_links_active_slug on smart_links(slug) where is_active = true;
create index if not exists idx_smart_link_destinations_link_position on smart_link_destinations(smart_link_id, position);
create index if not exists idx_tracks_release on tracks(release_id);
create index if not exists idx_campaigns_release on campaigns(release_id);
create index if not exists idx_campaign_deliverables_target on campaign_deliverables(campaign_target_id);
create index if not exists idx_evidence_release_created on evidence_records(release_id, created_at desc);
create index if not exists idx_evidence_campaign_target on evidence_records(campaign_target_id, created_at desc);
create index if not exists idx_evidence_expiry on evidence_records(expires_at) where expires_at is not null;
create index if not exists idx_fans_owner_created on fans(owner_user_id, created_at desc);
create index if not exists idx_fan_consents_fan_recorded on fan_consents(fan_id, recorded_at desc);
create index if not exists idx_link_events_link_occurred on link_events(smart_link_id, occurred_at desc);

comment on table evidence_records is 'Append-oriented ArtistOS Proof ledger. New verification observations should create new rows instead of overwriting prior evidence.';
comment on column promotion_targets.verification_level is 'L1 public verification through L11 stale evidence. Existing CuratorFit records begin at L6 until re-verified.';
