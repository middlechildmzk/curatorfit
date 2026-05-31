# CuratorFit V2.3 Expanded Research Batches

Source: user-provided multi-model research from Meta, Gemini, Perplexity, Grok, Copilot, and Claude CuratorFit follow-up notes.

## Executive synthesis

The expanded research confirms CuratorFit should evolve from a Spotify playlist directory into a full multi-channel Music Promotion OS.

Core product thesis:

> CuratorFit helps independent and AI-assisted artists find the right places to pitch their songs across playlists, blogs, YouTube, TikTok, Instagram, SoundCloud, radio, labels, sync libraries, and communities.

The product should not sell placements or streams. It should sell:

- better target discovery.
- song-to-target fit scoring.
- trust and risk screening.
- campaign tracking.
- pitch CRM.
- verified/claimable curator profiles.
- release promotion workflows.

## New research claims to preserve

### Meta research

Meta reports a master database of 473 targets and a 100-target Christian vertical expansion.

Treat this as a research claim until CSV files are directly imported and verified.

Reported coverage:

- Spotify playlists.
- SoundCloud channels and collectives.
- YouTube channels.
- TikTok and Instagram creators.
- Blogs and newsletters.
- Radio.
- Labels.
- Sync/library opportunities.

Christian vertical reportedly includes:

- Christian Family Radio.
- WLJI 98.3.
- Z88.3 FM Orlando.
- Cfaith Radio.
- Holy Culture Radio.
- Solid Rock Radio, noted as no AI-generated tracks.
- Indie Gospel.
- Rapzilla.
- Jesus Freak Hideout.
- CCM Magazine.
- New Release Today.
- PlaylistPartner Christian/Gospel playlists.
- Soundplate Christian submissions.
- TikTok and Instagram Christian creators, including Josiah Queen, Grace Graber, itsgodsvoic3, and other creator accounts where handles were missing or malformed in the pasted data.

Important caution: the Meta report includes live-stat claims and file links, but the CSV files are not currently in the repo and have not been directly parsed by CuratorFit. Do not mark these as verified until we import the actual files and run the review queue.

### Gemini Batch 2 and Batch 3

Gemini proposes new target ranges:

- Targets 76 to 150: Christian music expansion, TikTok/Instagram creators, YouTube audiovisual channels.
- Targets 151 to 225: high-authority blogs/webzines and premium Spotify playlist networks/collectives.

High-priority Christian entities mentioned:

- NewReleaseToday.
- Rapzilla.
- CCM Magazine.
- Indie Vision Music.
- The Christian Beat.
- Air1.
- Worship Leader Magazine.
- Relevant Magazine.
- JesusFreakHideout.
- JUCE TV / Trinity.
- Sovereign Grace Radio.
- God's Beats.
- Louder Than The Music.
- NRT Radio Next.
- BREATHEcast.
- Premier Gospel Radio.
- Step FWD UK.
- Wade-O Radio.
- CEDM Network.
- Cross Rhythms.
- Salt+Light Media.
- Capital Kings curations.
- Salt Of The Sound.
- Trackstarz.
- God's Nation Music.
- Holy Culture Radio.
- CEDM Radio.
- The Good Christian Music Co.
- Sovereign Grace Music.

High-authority blog/editorial entities mentioned:

- EARMILK.
- ThisSongIsSick.
- Stereofox.
- A&R Factory.
- Atwood Magazine.
- Indie Shuffle.
- Your EDM.
- Dancing Astronaut.
- Acid Stag.
- Complex music desk.
- Magnetic Magazine.
- The Line of Best Fit.
- Run The Trap.
- Popjustice.
- Clash Magazine.
- Stereogum.
- Gorilla vs. Bear.
- PopMatters.
- Consequence.
- Lyrical Lemonade.
- The FADER.
- Pigeons & Planes.
- Dummy Mag.
- Resident Advisor.
- XLR8R.

Premium network/entities mentioned:

- La Belle Musique.
- BIRP!.
- Soave Curation Network.
- Selected. Playlists.
- ChillYourMind.
- Majestic Casual Curates.
- CloudKid Playlists.
- Trap Nation Playlists.
- Chillhop Music Collect.
- Koala Kontrol.
- MrSuicideSheep.
- Wave Music Labs.
- SoundisStyle.
- Fluidified.
- Dreamwave Collective.

Important caution: many TikTok/Instagram handles and some URLs in Gemini's list look like research leads, not verified accounts. Store them as `seed` or `candidate`, never `verified_candidate`.

### Perplexity research

Perplexity reinforces that CuratorFit should not copy a submission marketplace exactly. It should combine:

- directory.
- fit engine.
- trust engine.
- claimable profile system.
- CRM / campaign tracking.

Benchmark notes:

- Playlist Push is a useful reference for network-size proof, vetting language, AI matching, bot detection, live reporting, verified playlists, and TikTok creator network positioning.
- SubmitHub is a useful reference for transparency, response expectations, direct artist-to-curator submissions, and clear paid-review framing.
- Soundplate and playlist directories prove free genre-indexed discovery pages can drive organic traffic.

Research priority order:

1. Spotify playlist curators and submission pages.
2. SoundCloud repost channels, labels, and collectives.
3. YouTube music-discovery channels.
4. TikTok/Instagram creator accounts.
5. Blogs and newsletters.
6. Radio and college radio.
7. Labels and demo pages.
8. Sync and licensing opportunities.

For first 250 production-ready targets, Perplexity recommends:

- 100 Spotify playlists.
- 50 blogs/newsletters.
- 50 YouTube channels.
- 25 radio targets.
- 25 labels/sync targets.

### Grok research

Grok expands the running foundation toward 800 to 1,100+ potential targets through repeatable source patterns.

Important Grok target examples:

- Melodic EDM 2026.
- MELODIC BASS DUBSTEP GAMING 2026 by RITIX.
- Future Bass 2026 by Arctic Empire.
- Christian Indie Folk 2026.
- Chill Worship Vibes.
- Christian Indie Pop.
- The Lofi Christian.
- Widen Island.
- Jesusfreakhideout.
- SOZO.
- Salt Of The Sound.
- LBM Records.
- Jesse Dean Christian playlists.
- Widen Island forms.

Grok matching formula:

- Genre/subgenre similarity, 25%.
- Mood/energy fit, 20%.
- Vocal/theme/lyrical fit, 15%.
- Channel/stage fit, 15%.
- Trust/submission availability, 10%.
- AI policy fit, 5%.
- Response likelihood plus regional bonus, 5%.
- Historical/user feedback, 5%.

Score thresholds:

- 80+ Excellent, auto-highlight.
- 65 to 79 Strong.
- Below 65 filtered or secondary.

## Product direction to build next

### V2.2 Import + Review Queue

Build the ingestion layer first:

- CSV upload.
- Schema validation.
- Import batches.
- Duplicate detection.
- Manual review queue.
- Trust tier transitions.
- Risk flags.
- AI policy fields.
- Source/evidence fields.
- Admin-only import history.

### V2.3 Research Command Center

Use the Industrial Music OS / A&R Command Center interface:

- dark terminal UI.
- acid-green accents.
- monospaced data rows.
- dense filters.
- right-side detail panel.
- tabs for Database, Risk, AI-Friendly, Matching Logic, Strategy.

### V2.4 Public Directory SEO Layer

Public pages should be indexable and artist-friendly:

- `/targets`.
- `/targets/spotify-playlists`.
- `/targets/youtube-channels`.
- `/targets/blogs`.
- `/targets/christian-music`.
- `/targets/lofi`.
- `/targets/future-bass`.
- `/targets/ai-music-friendly`.
- comparison pages for SubmitHub, Groover, Playlist Push, DailyPlaylists, PlaylistPartner.

### V2.5 Matching + CRM

Core artist workflow:

1. Artist enters track metadata.
2. CuratorFit scores targets.
3. Artist shortlists best-fit targets.
4. Artist drafts pitch.
5. Artist tracks outreach status.
6. Artist records outcome.
7. Matching engine improves using feedback.

## Required database expansion fields

Minimum fields to support all research:

- id.
- target_name.
- target_type.
- platform.
- primary_url.
- submission_url.
- public_contact_url.
- public_contact_email.
- owner_or_brand_name.
- country_or_region.
- language.
- audience_size.
- audience_size_type.
- last_activity_signal.
- primary_genre.
- secondary_genres.
- subgenres.
- moods.
- energy_level.
- vocal_preference.
- explicit_allowed.
- accepted_formats.
- best_fit_artist_stage.
- submission_method.
- submission_rules_summary.
- free_or_paid.
- response_expectation.
- allows_ai_assisted_music.
- ai_music_notes.
- trust_tier.
- risk_level.
- risk_notes.
- verification_notes.
- reason_for_inclusion.
- do_not_contact.
- opt_out_required.
- fit_tags.
- hard_no_tags.
- recommended_pitch_angle.
- sample_pitch_note.
- source_url.
- source_type.
- source_retrieved_at.
- last_verified_at.
- verified_by.
- policy_last_checked_at.
- import_batch_id.
- review_status.
- duplicate_key.
- is_placeholder.

## Trust tier rules

- `seed`: discovered lead, not manually reviewed.
- `candidate`: public page or public submission route found, still needs human review.
- `manually_reviewed`: reviewed by CuratorFit admin or trusted researcher.
- `verified_candidate`: live submission path verified, safe language checked, no obvious payola/bot red flags.
- `claimed`: curator/owner claimed and controls profile.
- `blocked`: guaranteed placement, stream-selling, suspicious, opt-out, or legal/compliance risk.

Never upgrade to `verified_candidate` without source evidence and live verification.

## Risk flags

CuratorFit should support the following risk flags:

- guaranteed_placement_language.
- guaranteed_streams_language.
- pay_for_slot_language.
- bot_or_fake_stream_claims.
- broken_submission_url.
- stale_activity.
- unclear_rights_terms.
- exclusive_sync_terms.
- ai_policy_rejects_ai.
- ai_policy_unclear.
- direct_dm_only.
- weak_identity.
- follower_engagement_mismatch.
- missing_owner_info.
- unverifiable_audience_size.
- category_placeholder.

## Immediate next work order

1. Create import schema and validation for promotion targets.
2. Create `import_batches` table or equivalent data model.
3. Create admin review queue.
4. Create target status transitions.
5. Create duplicate detection.
6. Create research command center view.
7. Import a small 25-row test batch first.
8. Then import the larger 473/500 CSV once directly uploaded to the repo/chat.

## Compliance language lock

Use:

- submit for review.
- submit for consideration.
- curator feedback.
- upload consideration.
- campaign tracking.
- target discovery.
- relationship management.

Never use:

- guaranteed placement.
- guaranteed streams.
- buy streams.
- pay for playlist placement.
- guaranteed repost.
- guaranteed radio play.
