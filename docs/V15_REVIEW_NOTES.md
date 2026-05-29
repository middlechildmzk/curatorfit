# CuratorFit V1.5 Review Notes

V1.5 is the pre-beta hardening sprint based on Claude and ChatGPT review feedback.

## Fixed P0 issues

1. Admin page no longer fetches operations data server-side for anonymous visitors.
2. Admin actions no longer use a hidden admin secret field.
3. Admin APIs now require a Supabase access token and either `profiles.role = admin` or the email listed in `ADMIN_EMAILS`.
4. `/api/campaign-target` no longer creates orphan artist profiles. It requires a logged-in user and upserts by `user_id`.
5. `/dashboard` no longer renders a blank stub. It redirects to `/campaigns`.
6. Claim and curator application forms now redirect to a confirmation page.
7. The no-paid-placement page has been expanded into a real trust policy.

## Added V1.5 features

- Client-side admin review queue
- Admin tables API
- Admin target/claim/application actions with role checks
- CSV import endpoint for manually reviewed seed targets
- Import batch tracking schema
- Curator application staging table
- Campaign target status update endpoint
- Expanded campaign statuses
- Improved curator claim page copy: "Your playlist. Your rules. Your inbox."
- Safer seed URLs and seed listing language
- Additional trust/source review schema fields

## V1.5 admin access

Set at least one of these before using admin features:

- `ADMIN_EMAILS=you@example.com,teammate@example.com`
- or manually set the user's row in `profiles.role` to `admin`

The browser sends the current Supabase session access token to `/api/admin/*`. The server verifies the token and role before returning data or running actions.

## CSV import format

The import endpoint accepts a CSV with headers like:

```csv
name,type,url,source_url,genre,genres,moods,audience_size_label,owner_name,submission_rules,risk_notes,trust_tier,status
Melodic Bass Example,spotify_playlist,https://open.spotify.com/playlist/example,https://source.example,Melodic Bass,Melodic Bass|Future Bass,emotional|cinematic,8K followers,Public profile,Needs manual verification,Seed listing only,verified_candidate,seed
```

Imported rows should stay as `seed` or `unclaimed` until manually reviewed. Do not label imported targets as affiliated, claimed, verified, or partnered unless confirmed.

## Validation

- `npm run typecheck` passed.
- `npm run build` compiled successfully and started static page generation, but the container timed out during static generation. Test the production build locally or on Vercel.

## Deferred intentionally

- Stripe
- Stripe Connect payouts
- Spotify OAuth
- Paid review credits
- Bulk scraping
- Automated cold-email campaigns
