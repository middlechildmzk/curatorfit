# CuratorFit V1.1 AI Team Data Request

Goal: build a manually reviewed seed database for the first public directory. Do not mass email. Do not bypass platform limits. Do not scrape private data. Capture public information only.

## Priority niches
1. Melodic bass / future bass / emotional EDM
2. Lo-fi / chill / study / ambient
3. Christian / worship / inspirational / faith-adjacent
4. Indie pop / sad pop / bedroom pop
5. Cinematic / instrumental / visualizer-friendly music

## Collect 200 high-quality promotion targets
Use the generic target model, not only Spotify playlists.

Fields:
- target_type: spotify_playlist | soundcloud_channel | youtube_channel | tiktok_creator | blog | radio | label | sync_library
- name
- url
- owner/curator name if public
- public contact/submission link if listed
- genres
- moods
- audience size if visible
- description
- submission rules if public
- last visible activity/update signal if available
- why this target seems relevant
- risk notes: suspicious title, bot-like claims, too many tracks, guaranteed placement language, no clear owner, rights concerns
- recommended status: seed | reject | manual_review | high_quality_candidate

## Rules
- No private data.
- No automated cold email.
- No unauthorized scraping of restricted pages.
- No copying competitor databases.
- Do not label anyone as verified unless manually confirmed.
- Prefer direct public sources and curator-owned pages.

## Output format
CSV or Google Sheet with the fields above. Add one row per target.
