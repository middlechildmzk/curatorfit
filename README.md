# CuratorFit V1.6

CuratorFit is a Spotify-first, multi-channel Music Pitch OS foundation for independent artists. V1.6 builds on the pre-beta hardening sprint with a more usable target directory, saved target workspace, playlist filters, and admin target editing for seed-data cleanup.

## What this version includes

- Next.js App Router + TypeScript + Tailwind
- Public playlist and promotion target directory
- `/targets` multi-channel directory with search/channel/trust filters
- `/saved` logged-in saved target workspace
- Multi-channel promotion target model
- Claim profile flow with success page
- Curator application staging flow
- User-owned campaign creation
- Campaign target statuses
- Admin review queue protected by Supabase token + role/email check
- CSV import for manually reviewed seed targets
- Admin target editor for trust/risk/status/source/notes cleanup
- Expanded no-paid-placement trust policy
- Supabase schema for profiles, targets, claims, applications, imports, campaigns, saved targets, notifications, and pitch templates

## Run locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAILS=you@example.com
```

Do not commit real keys.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Optionally run `supabase/seed.sql`.
4. Add env vars locally and in Vercel.
5. Log in via `/login`.
6. Add your email to `ADMIN_EMAILS` or update your `profiles.role` to `admin`.
7. Visit `/admin`.

## Admin CSV import

Use `/admin` after logging in as admin. Upload a CSV with headers:

```csv
name,type,url,source_url,genre,genres,moods,audience_size_label,owner_name,submission_rules,risk_notes,trust_tier,status
```

Imported targets are candidate seed records only. They are not verified, affiliated, or claimed until manually reviewed.

## Validation

`npm run typecheck` should be run after install. This package was prepared as the V1.6 workspace-polish build.

`npm run build` compiled successfully and reached static page generation, but the container timed out during final static generation. Re-run locally or on Vercel before public deployment.

## Important compliance posture

CuratorFit should not promise streams, playlist placement, reposts, or guaranteed outcomes. It should position around discovery, fit, trust, review, feedback, and campaign tracking.
