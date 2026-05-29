# CuratorFit V1.6 Review Notes

## Theme

V1.6 moves CuratorFit from pre-beta hardening into a more usable artist/admin workspace.

## Added in V1.6

- `/targets` public multi-channel promotion target directory.
- Client-side target filters by search, channel, and trust band.
- `/saved` logged-in saved target workspace.
- `POST /api/saved-targets` to save a promotion target by slug.
- `GET /api/saved-targets` to load a user's saved targets.
- `DELETE /api/saved-targets` to remove saved targets.
- `SaveTargetButton` on target detail pages.
- Browse playlist filters by search, genre, risk, and sort.
- Admin target editor panel for trust score, risk level, status, source URL, fit notes, risk notes, submission rules, and verification notes.
- `POST /api/admin/target-update` with server-side admin role validation.
- Admin table now loads richer target review fields.
- Header/footer now expose Targets and Saved Targets.
- Dashboard copy updated around the V1.6 workspace.

## Still intentionally deferred

- Stripe, paid reviews, curator payouts.
- Spotify OAuth import.
- Automated scraping.
- Bulk cold email.
- AI pitch generator with real LLM call.

## Review focus

Please review:

1. Does `/targets` make the multi-channel strategy clearer without distracting from Spotify-first?
2. Does `/saved` feel like the beginning of the artist CRM/workspace?
3. Is the admin target editor enough to clean the 200-row seed dataset after CSV import?
4. Are the trust/risk labels and copy still compliant?
5. What should V1.7 prioritize: AI pitch drafts, SEO genre pages, better artist campaign board, or curator review inbox?
