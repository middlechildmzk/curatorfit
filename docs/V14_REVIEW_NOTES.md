# CuratorFit V1.4 Review Notes

V1.4 moves CuratorFit from a polished demo toward a real SaaS foundation.

## What changed

- Added `/profile` for logged-in artist/curator profile editing.
- Added `POST /api/profile/details` to save account, artist, and curator profile fields.
- Added a real campaign creator to `/campaigns`.
- Added `POST /api/campaigns` to save user-owned artist profiles, tracks, campaigns, and first campaign targets.
- Updated dashboard copy and navigation for profile/campaign workflows.
- Added schema indexes and a `campaign_review_queue` helper view.

## Review focus for AI/team

1. Confirm Supabase schema runs cleanly in a fresh project.
2. Confirm magic-link login works.
3. Confirm `/profile` saves artist and curator details.
4. Confirm `/campaigns` creates a campaign under the logged-in user.
5. Confirm dashboard shows recent campaign target activity.
6. Confirm no copy implies guaranteed placement, streams, or pay-for-adds.
7. Confirm public pages still work without Supabase configured.

## Current boundaries

- Stripe and paid-review credits are intentionally not included yet.
- Spotify API/OAuth is intentionally not included yet.
- Curator payouts are intentionally not included yet.
- No bulk scraping or mass email automation is included.

## Recommended next version

V1.5 should add a real admin review queue, target editing, curator claim assignment, and CSV import for manually reviewed seed data.
