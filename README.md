# ArtistOS Marketplace Foundation

ArtistOS is the release and promotion operating system built from the existing CuratorFit product and the production `artistos-core` workspace graph.

```text
release -> link -> campaign -> target -> submission -> feedback -> evidence -> fan
```

CuratorFit is the professional discovery and opportunity network inside ArtistOS. It is not a disconnected playlist database.

## Implemented in this branch

### Artist workspace

- Release Command Center at `/dashboard`
- Canonical release creation using existing `artists` and `releases`
- Automatic smart-link and campaign creation
- Public fan-link pages at `/l/[slug]`
- Campaign target discovery from the production CuratorFit network
- Artist-approved submission routing from `/campaigns`
- Explainable match score and match reasons
- Artist-owned fan CRM at `/fans`
- Proof ledger at `/proof`
- Music and social Connections Center at `/connections`

### Professional workspace

- Artist, professional and hybrid onboarding at `/onboarding`
- Professional profile and capacity settings at `/professional`
- Multiple professional types, including playlist, YouTube, blog, creator, DJ, radio, podcast, label and sync
- Review model, turnaround and fee settings
- Property ownership claims with evidence and verification method
- Professional submission inbox at `/inbox`
- Structured review decisions and meaningful feedback
- Proposed promotional deliverables and disclosure requirements
- Participant messaging attached to each submission

### Marketplace routing

A campaign target follows one of two routes:

1. `marketplace`: the property is connected to an approved professional profile, so the submission enters the professional's ArtistOS inbox.
2. `outreach`: the property is not yet connected, so ArtistOS preserves an artist-approved outreach record without pretending the target is an active marketplace member.

The first matching model is deterministic and explainable. It scores genre overlap, property verification, recent activity and evidence strength. It does not claim an opaque AI confidence score.

## Production data reused

The application extends the existing workspace-based ArtistOS core. It does not replace:

- `workspaces` and `workspace_members`
- `artists`
- `releases` and `release_platform_links`
- `campaigns` and `campaign_targets`
- `evidence_records`
- `fans`
- `organizations`, `properties`, `people` and `submission_endpoints`
- `music_platforms`, `artist_platform_profiles` and `oauth_connections`

The live network already contains thousands of properties and people. Imported records remain evidence-scored candidate records until claimed or independently verified.

## Marketplace data model

The marketplace migrations add:

- `profiles`
- `professional_profiles`
- `property_claims`
- `professional_properties`
- `campaign_submissions`
- `submission_feedback`
- `submission_messages`

These records connect to the existing release, campaign, target, evidence and workspace domains.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres and Row Level Security
- Zod request validation
- GitHub Actions typecheck and production-build gate

## Local setup

```bash
npm install --legacy-peer-deps
npm run dev
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAILS=you@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable.

Optional provider credentials are detected by the Connections Center:

```bash
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
META_APP_ID=
META_APP_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
SOUNDCLOUD_CLIENT_ID=
SOUNDCLOUD_CLIENT_SECRET=
APPLE_MUSIC_KEY_ID=
APPLE_MUSIC_TEAM_ID=
```

The current branch does not fake provider authorization. Without provider credentials and platform approval, ArtistOS stores official profile links as user-supplied, unverified evidence.

## Database migrations

Run in order:

```text
supabase/migrations/20260728223000_artistos_release_foundation.sql
supabase/migrations/20260728233000_artistos_release_foundation_advisor_hardening.sql
supabase/migrations/20260728234500_seed_existing_artistos_release_links.sql
supabase/migrations/20260728235500_minimize_fan_consent_evidence.sql
supabase/migrations/20260729001500_artistos_marketplace_identity.sql
supabase/migrations/20260729003000_marketplace_function_grants.sql
supabase/migrations/20260729004500_marketplace_rls_performance.sql
```

The marketplace migrations were applied additively to `artistos-core`. They preserve the existing catalog, campaigns, evidence records, fans and network records.

## Security and privacy posture

- Workspace access is fail-closed and role-scoped.
- Auth trigger and workspace provisioning functions are not callable by anonymous or signed-in RPC clients.
- Public CuratorFit reads do not select stored contact emails.
- Property ownership is pending until verified.
- Consent records exclude IP-address and user-agent fingerprinting.
- Existing imported contacts do not become opted-in marketing contacts.
- Manual evidence cannot claim L1-L4 verification.
- Automated fan messaging remains disabled until double opt-in is implemented.

The remaining Supabase security advisory is the project-wide leaked-password setting. ArtistOS currently uses passwordless email magic links, but the setting should still be enabled before adding password authentication.

## Promotion policy boundary

ArtistOS must not promise or transact guaranteed Spotify placement, streams, saves, followers or algorithmic outcomes.

A Spotify curator may be compensated only for legitimate listening, review, feedback and a timely decision. Payment cannot depend on adding the track or generating streams.

Sponsored creator, publication, YouTube, DJ and broadcast workflows require accurate deliverable terms, applicable disclosures and legal review.

Do not use `escrow` in product language without qualified legal approval. Future payments should use milestone-protected or delayed-payout language and an approved marketplace payment architecture.

## Validation

The branch is validated by `.github/workflows/artistos-validation.yml`:

```bash
npm run typecheck
npm run build
```

Manual flow:

1. Log in through `/login` and complete `/onboarding`.
2. Create an artist, professional or hybrid workspace.
3. Create or open a release at `/dashboard`.
4. Add CuratorFit targets at `/campaigns`.
5. Route a target into marketplace or outreach mode.
6. For a professional account, claim a property at `/professional`.
7. Open `/inbox`, start review and submit feedback.
8. Confirm feedback appears in the artist campaign.
9. Link official platform profiles at `/connections`.
10. Add evidence at `/proof` and confirm release proof counts update.

## Next build sequence

1. Add provider-specific OAuth authorization and refresh routes.
2. Add metadata resolution and cross-platform destination discovery.
3. Add campaign budgets, Stripe Connect test mode and milestone-protected payments.
4. Add double-opt-in email verification.
5. Add automated L1 verification jobs for supported public URLs.
6. Add authorized L2-L4 analytics synchronization.
7. Add campaign deliverables and Proof verification jobs.
8. Add owned-data release progress and campaign attribution.
9. Add network ingestion, deduplication, freshness and admin claim review at scale.
