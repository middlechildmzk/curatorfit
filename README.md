# ArtistOS Release Command Center

ArtistOS is the release operating system built from the existing CuratorFit foundation and the production `artistos-core` workspace graph.

```text
release -> smart link -> campaign -> target -> evidence -> fan
```

CuratorFit remains the verified promotion-network module inside ArtistOS rather than a separate, disconnected application.

## Implemented in this branch

- ArtistOS public homepage and unified navigation
- Release Command Center at `/dashboard`
- Workspace-native release creation using the existing `artists` and `releases` domains
- Automatic smart-link and campaign creation with every new release
- Public fan-link pages at `/l/[slug]`
- Data-minimized email consent capture with policy version, timestamp, source page and campaign attribution
- Artist-owned fan CRM and CSV export at `/fans`
- Append-oriented Proof ledger and manual evidence intake at `/proof`
- L1-L11 verification taxonomy with method, confidence, freshness and contradiction state
- Campaign Command Center using the existing workspace campaigns and campaign targets
- CuratorFit target discovery backed by the production `properties` and `organizations` network
- No guaranteed streams, playlist placement or algorithmic-outcome mechanics

## Production data reused

The application extends the existing workspace-based ArtistOS core. It does not recreate or replace these production domains:

- `workspaces` and `workspace_members`
- `artists`
- `releases` and `release_platform_links`
- `campaigns` and `campaign_targets`
- `evidence_records`
- `fans`
- `organizations`, `properties`, `people` and `submission_endpoints`

The compatibility migrations add only the missing fan-link, consent, event and deliverable structures, plus release-level verification fields on the existing evidence ledger.

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
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable.

## Database migrations

Run these migrations against a workspace-based ArtistOS core, in order:

```text
supabase/migrations/20260728223000_artistos_release_foundation.sql
supabase/migrations/20260728233000_artistos_release_foundation_advisor_hardening.sql
supabase/migrations/20260728234500_seed_existing_artistos_release_links.sql
```

They add or extend:

- `smart_links`
- `smart_link_destinations`
- `campaign_deliverables`
- `fan_consents`
- `link_events`
- release, campaign, target and deliverable references on `evidence_records`
- verification level, method, confidence, freshness and contradiction fields on `evidence_records`
- smart-link attribution and consent timestamps on `fans`

The migrations use workspace membership for authorization. Consent and link-event records are append-only to authenticated clients. Public link reads and public fan capture run through server-only routes.

## Existing release links

The seed migration creates or updates:

- `middle-child-never-alone` in presave mode, with the known HyperFollow destination
- `middle-child-mercy` in live mode

It also normalizes the delivered `Never Alone` metadata to `lowly sunday` and UPC `882877618355`.

## Validation

Run:

```bash
npm run typecheck
npm run build
```

Then verify:

1. Log in and open `/dashboard`.
2. Confirm existing releases and smart links load from the workspace.
3. Create a release and confirm its release, smart link and campaign records are created together.
4. Open `/l/<generated-slug>`.
5. Submit the explicit email-consent form.
6. Confirm the fan appears at `/fans` with consent records.
7. Open `/campaigns`, attach a `property-<uuid>` target and update its relationship status.
8. Open `/proof`, append a live evidence URL and confirm the release proof count increases.

## Compliance posture

ArtistOS must not promise or transact guaranteed Spotify placement, streams, saves, followers or algorithmic outcomes. Spotify-related compensation may cover listening, review and feedback only. Sponsored creator, publication and broadcast workflows require the applicable disclosures and legal review.

Manual evidence cannot label itself L1-L4. Only supported public checks or authorized-account integrations may create stronger verification records.

Do not use `escrow` in product language without qualified legal approval. Future payments should use milestone-protected or delayed-payout language and an approved marketplace payment architecture.

## Next build sequence

1. Add metadata resolution and destination discovery behind provider adapters.
2. Add public page-view and destination-click attribution through a controlled redirect route.
3. Add automated L1 checks for supported public URLs.
4. Add authorized L2-L4 platform connections.
5. Add campaign deliverables, disclosures and verification jobs.
6. Add campaign-attributed intelligence from owned data before licensing global market data.
