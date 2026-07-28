# ArtistOS Release Command Center

ArtistOS is the release operating system built from the existing CuratorFit foundation. The first integrated slice connects:

```text
release -> smart link -> campaign -> target -> evidence -> fan
```

CuratorFit remains the verified promotion-network module inside ArtistOS rather than becoming a separate disconnected application.

## Implemented in this branch

- ArtistOS public homepage and unified navigation
- Release Command Center at `/dashboard`
- Canonical `releases` domain linked to the existing artist, track and campaign records
- Automatic smart-link and campaign creation with every release
- Public fan-link pages at `/l/[slug]`
- Explicit email-consent capture with hashed request evidence
- Artist-owned fan CRM and CSV export at `/fans`
- Append-oriented Proof ledger and manual evidence intake at `/proof`
- L1-L11 verification taxonomy with confidence, freshness and contradiction state
- Migration-safe expansion of the existing CuratorFit target and campaign schema
- No guaranteed streams, playlist placement or algorithmic-outcome mechanics

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres and Row Level Security
- Zod request validation

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAILS=you@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CONSENT_HASH_SALT=replace_with_a_long_random_secret
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `CONSENT_HASH_SALT` through a `NEXT_PUBLIC_` variable.

## Database migration

Apply the existing CuratorFit schema first, then run:

```text
supabase/migrations/20260728223000_artistos_release_foundation.sql
```

The migration preserves current CuratorFit identifiers and adds:

- `releases`
- `smart_links`
- `smart_link_destinations`
- `campaign_deliverables`
- `evidence_records`
- `fans`
- `fan_consents`
- `link_events`
- `release_id` links on existing tracks and campaigns
- structured verification fields on existing promotion targets

All new public-schema tables have RLS enabled. Fan capture and public link reads run through server-only routes using the service role. Artist-facing records remain owner-scoped.

## Validation

Run:

```bash
npm run typecheck
npm run build
```

Then verify these flows:

1. Log in and open `/dashboard`.
2. Create a release.
3. Confirm a release, smart link and campaign are created together.
4. Open `/l/<generated-slug>`.
5. Submit the consent-backed email form.
6. Confirm the fan appears at `/fans` with consent records.
7. Open `/proof` and append a live evidence URL.
8. Confirm the release proof count increases after reload.

## Compliance posture

ArtistOS must not promise or transact guaranteed Spotify placement, streams, saves, followers or algorithmic outcomes. Spotify-related compensation may cover listening, review and feedback only. Sponsored creator, publication and broadcast workflows require the applicable disclosures and legal review.

Do not use `escrow` in product language without qualified legal approval. Future payments should use milestone-protected or delayed payout language and Stripe Connect architecture.

## Next build sequence

1. Apply and validate the production database migration.
2. Add metadata resolution and destination discovery behind provider adapters.
3. Attach campaign targets directly from CuratorFit to each release workspace.
4. Add automated L1 checks for supported public URLs.
5. Add authorized L2-L4 platform connections.
6. Add campaign-attributed intelligence from owned data before licensing global market data.
