# CuratorFit V2.2, Claude Batch 1 Research Dashboard Notes

Source: user-provided Claude report and attached `curatorfit-research-dashboard.tsx` / PDF.

## Core takeaway

Claude's Batch 1 research artifact should be merged into the CuratorFit V2.2 roadmap as both a product reference and a data/reference source. The strongest ideas are:

- Industrial Music OS / A&R Command Center visual direction.
- Dark terminal UI.
- Acid-green accent.
- Monospaced data rows.
- Playfair-style editorial header treatment.
- Filterable research database.
- CSV export.
- Risk report.
- AI-friendly filter.
- Matching logic docs.
- Strategy docs.

## Dataset summary

Claude's artifact reports a Batch 1 database with real, named targets across playlists, SoundCloud, YouTube, TikTok/Instagram categories, blogs, radio, labels, and sync libraries. The attached code describes the database as 77 targets in comments, while the visible footer says 61 targets, so treat the count as inconsistent and verify before import.

All targets should remain `trust_tier = candidate` until manually verified. Do not present any as verified, partner, affiliated, or actively accepting submissions without live review.

## Important product tabs from artifact

1. Target Database
   - Filter by type, AI policy, paid/free, risk level.
   - Search by name, genre, tag, platform, region, or subgenre.
   - Click row for detail panel.
   - Export CSV button.

2. Risk Report
   - High risk, avoid.
   - Medium risk, review carefully.
   - Low risk, standard practice.
   - Verification required, all targets.
   - Specific caution around NCS licensing and Epidemic Sound exclusive/AI policy.

3. AI-Friendly
   - Explicitly AI-OK targets.
   - Unclear but approachable targets.
   - Strategy for AI-assisted artists, especially Middle Child-style work.
   - AI disclosure tag should be part of matching logic.

4. Matching Logic
   - Genre/subgenre match, 25%.
   - Mood/energy match, 20%.
   - Channel/target type fit, 15%.
   - Trust/risk score, 15%.
   - Submission availability, 10%.
   - AI music policy fit, 5%.
   - Response likelihood, 5%.
   - Artist stage fit, 5%.
   - Additional scoring signals: region, language, historical outcomes, curator feedback, recency, free vs paid, explicit mismatch.

5. Strategy Docs
   - 12 directory categories.
   - 21 recommended filter fields.
   - Four-tier monetization model.
   - Additional revenue streams.
   - Top 10 targets to manually verify first.

## Top targets to manually verify first

- Lofi Girl.
- Chillhop Music.
- SubmitHub.
- Groover.
- Majestic Casual.
- Musicbed.
- Epidemic Sound.
- KEXP.
- Centricity Music.
- Liquicity.

## V2.2 implementation plan

### P0, data ingestion and review

- Add CSV import schema for research targets.
- Add review queue statuses: candidate, needs_review, manually_reviewed, verified_candidate, claimed, blocked.
- Add `verification_notes`, `source_url`, `last_verified_at`, `verified_by`, `policy_last_checked_at`.
- Add duplicate detection by normalized target name + platform + URL.
- Add import batch tracking.

### P1, dashboard productization

- Build `/research` or `/admin/research` using the Industrial Music OS aesthetic.
- Add database, risk, AI-friendly, matching, and strategy tabs.
- Keep public `/targets` cleaner and more artist-facing.
- Keep research/admin interface data-dense.

### P2, matching expansion

- Add scoring breakdown UI that mirrors Claude's eight-part weighting.
- Add AI conflict warning.
- Add explicit lyrics mismatch warning.
- Add exclusive-rights / sync-library warning.
- Add paid review vs pay-for-placement language guardrail.

## Data quality warnings

- Counts in the artifact conflict, 61 vs 77. Verify actual exported target count before import.
- Several submission URLs may be based on training data and must be live-verified.
- Audience sizes should be treated as approximate ranges only.
- AI policies are mostly unknown and changing fast.
- Some TikTok/Instagram entries are category placeholders rather than individual verified targets.

## Compliance language

Use:

- submit for review.
- submit for consideration.
- curator feedback.
- upload consideration.
- target discovery.
- campaign tracking.
- relationship management.

Never use:

- guaranteed placement.
- guaranteed streams.
- buy streams.
- paid playlist placement.
- guaranteed repost.
- guaranteed radio play.
