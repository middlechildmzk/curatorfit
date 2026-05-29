import type { Metadata } from 'next';

export type ContentCategory = 'Playlist Pitching' | 'AI Music' | 'Scam Prevention' | 'Beginner Promotion' | 'Comparison' | 'Genre Guide' | 'Tools';

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: ContentCategory;
  priority: 'P0' | 'P1' | 'P2';
  audience: string;
  primaryKeyword: string;
  cta: string;
  sections: { heading: string; body: string[] }[];
  related: string[];
};

export type AlternativePage = {
  slug: string;
  title: string;
  description: string;
  competitor: string;
  angle: string;
  bullets: string[];
};

export type GenrePage = {
  slug: string;
  title: string;
  description: string;
  genre: string;
  fitSignals: string[];
  avoid: string[];
};

const defaultTrustSections = [
  {
    heading: 'CuratorFit trust rule',
    body: [
      'Never treat playlist pitching like buying streams. A safe campaign starts with fit, risk notes, and a real record of who you contacted.',
      'CuratorFit is built around campaign tracking, curator independence, and no paid placement language.'
    ]
  }
];

export const articles: Article[] = [
  {
    slug: 'spotify-playlist-pitching-guide',
    title: 'The Honest Guide to Spotify Playlist Pitching in 2026',
    description: 'A trust-first guide to pitching Spotify playlists without fake placement promises, bot risk, or wasted outreach.',
    category: 'Playlist Pitching',
    priority: 'P0',
    audience: 'Independent artists and first-time releasers',
    primaryKeyword: 'spotify playlist pitching',
    cta: 'Start a free campaign tracker',
    related: ['spotify-playlist-scams-fake-playlists', 'paid-playlist-placement-vs-paid-review', 'how-to-write-a-playlist-pitch'],
    sections: [
      {
        heading: 'The goal is fit, not forced placement',
        body: [
          'The healthiest playlist strategy is not blasting every curator. It is finding playlists where your song naturally belongs, then tracking what happened.',
          'A good pitch should make the curator’s job easier. It should explain the sound, the emotional lane, the best listener use case, and why the track fits their audience.'
        ]
      },
      {
        heading: 'A safer playlist pitching workflow',
        body: [
          'Start with a clean release page, correct metadata, a short pitch, and a target list sorted by genre, mood, trust level, and recent activity.',
          'Log every pitch date, status, response, feedback note, and follow-up. The data matters more than a one-time stream spike.'
        ]
      },
      ...defaultTrustSections
    ]
  },
  {
    slug: 'how-to-submit-music-to-spotify-playlists',
    title: 'How to Submit Music to Spotify Playlists: Step-by-Step for 2026',
    description: 'A practical workflow for finding independent playlist targets, writing a clean pitch, and tracking submissions.',
    category: 'Playlist Pitching',
    priority: 'P0',
    audience: 'New artists preparing a single release',
    primaryKeyword: 'how to submit music to Spotify playlists',
    cta: 'Build your submission list',
    related: ['free-spotify-playlist-submission', 'how-to-pitch-playlist-curators', 'spotify-playlist-pitching-guide'],
    sections: [
      { heading: 'Step 1: prepare the song page', body: ['Make sure the track link, artist profile, artwork, release notes, and short bio are ready before you pitch. Curators should not have to hunt for context.'] },
      { heading: 'Step 2: sort targets by fit', body: ['Separate editorial pitching, independent playlist submissions, blogs, SoundCloud channels, and creator outreach. Each target type needs a different pitch.'] },
      { heading: 'Step 3: track the outcome', body: ['Log saved, pitched, follow-up, passed, added, not a fit, and do not contact statuses. This turns messy outreach into a learning loop.'] }
    ]
  },
  {
    slug: 'free-spotify-playlist-submission',
    title: 'Free Spotify Playlist Submission: What Is Legit and What Is Not',
    description: 'How to use free playlist submission paths without giving away trust, data, or money to sketchy services.',
    category: 'Scam Prevention',
    priority: 'P0',
    audience: 'Budget-conscious artists',
    primaryKeyword: 'free Spotify playlist submission',
    cta: 'Track free submissions in CuratorFit',
    related: ['spotify-playlist-scams-fake-playlists', 'best-spotify-playlist-submission-sites', 'how-to-submit-music-to-spotify-playlists'],
    sections: [
      { heading: 'Free does not always mean safe', body: ['A free form can still be low quality, spammy, or a data collection trap. Look for clear curator identity, real rules, recent activity, and no guaranteed placement language.'] },
      { heading: 'What to log', body: ['Save the target URL, submission date, genre fit, response deadline, and any curator rule. If a target never responds, keep that record for next time.'] },
      ...defaultTrustSections
    ]
  },
  {
    slug: 'best-spotify-playlist-submission-sites',
    title: 'Best Spotify Playlist Submission Sites for Independent Artists',
    description: 'An honest comparison framework for playlist submission sites, with risk notes and no guaranteed-placement hype.',
    category: 'Comparison',
    priority: 'P0',
    audience: 'Artists comparing promotion tools',
    primaryKeyword: 'best Spotify playlist submission sites',
    cta: 'Compare options and track what works',
    related: ['playlist-push-alternatives', 'submithub-alternatives', 'groover-alternatives'],
    sections: [
      { heading: 'How to judge a submission site', body: ['Look for transparency, curator independence, refund or no-response rules, clear pricing, trust language, and whether you can track outcomes.'] },
      { heading: 'What CuratorFit adds', body: ['CuratorFit is designed to sit beside any submission path. Use it to compare targets, save notes, generate pitches, and build your own history instead of relying on vague campaign dashboards.'] },
      ...defaultTrustSections
    ]
  },
  {
    slug: 'spotify-playlist-scams-fake-playlists',
    title: 'Spotify Playlist Scams: How to Spot Fake Playlists Before You Pay',
    description: 'Red flags that can help artists avoid fake playlist networks, bot-driven traffic, and risky promotion claims.',
    category: 'Scam Prevention',
    priority: 'P0',
    audience: 'Artists worried about fake streams',
    primaryKeyword: 'Spotify playlist scams',
    cta: 'Run the scam checker',
    related: ['paid-playlist-placement-vs-paid-review', 'how-to-spot-fake-playlists', 'what-is-artificial-streaming'],
    sections: [
      { heading: 'Red flags to watch', body: ['Be cautious with guaranteed streams, guaranteed playlist adds, no curator identity, generic playlist branding, unrealistic follower claims, and pressure to pay fast.'] },
      { heading: 'Safer signals', body: ['Clear submission rules, curator identity, recent updates, genre consistency, no paid placement promises, and honest rejection policies are stronger signs.'] },
      ...defaultTrustSections
    ]
  },
  {
    slug: 'paid-playlist-placement-vs-paid-review',
    title: 'Paid Playlist Placement vs Paid Review: What Is the Difference?',
    description: 'A plain-English explanation of review compensation, curator independence, and why paid placement language is risky.',
    category: 'Scam Prevention',
    priority: 'P0',
    audience: 'Artists deciding whether to pay for promotion',
    primaryKeyword: 'paid playlist placement vs paid review',
    cta: 'Read CuratorFit no paid placement policy',
    related: ['spotify-playlist-scams-fake-playlists', 'best-spotify-playlist-submission-sites', 'no-paid-placement'],
    sections: [
      { heading: 'Paid review means time and feedback', body: ['In a paid review model, a curator may be compensated for listening and responding. The curator still decides independently whether the track belongs anywhere.'] },
      { heading: 'Paid placement is the risky lane', body: ['If a service says you are buying adds, streams, or guaranteed playlist placement, treat that as a major risk signal.'] },
      ...defaultTrustSections
    ]
  },
  {
    slug: 'how-to-write-a-playlist-pitch',
    title: 'How to Write a Playlist Pitch That Curators Actually Read',
    description: 'A simple structure for writing short, respectful curator pitches that explain fit without sounding spammy.',
    category: 'Playlist Pitching',
    priority: 'P0',
    audience: 'Artists preparing outreach copy',
    primaryKeyword: 'how to write a playlist pitch',
    cta: 'Use the pitch generator',
    related: ['how-to-pitch-playlist-curators', 'spotify-playlist-pitching-guide', 'playlist-pitch-generator'],
    sections: [
      { heading: 'Keep it short', body: ['A strong playlist pitch usually explains the song in two to five sentences. Lead with genre, mood, best use case, and one human detail.'] },
      { heading: 'Do not oversell', body: ['Avoid claims like guaranteed fan growth or perfect fit. Say why you believe it may fit, then let the curator decide.'] },
      ...defaultTrustSections
    ]
  },
  {
    slug: 'can-you-release-suno-music-on-spotify',
    title: 'Can You Release Suno Music on Spotify? What Creators Need to Know',
    description: 'A non-legal guide for Suno creators preparing to distribute, disclose, and promote AI-assisted songs responsibly.',
    category: 'AI Music',
    priority: 'P0',
    audience: 'Suno creators and AI-assisted artists',
    primaryKeyword: 'can you release Suno music on Spotify',
    cta: 'Use the AI music release checklist',
    related: ['how-to-release-a-suno-song-on-spotify', 'ai-music-release-checklist', 'ai-music-disclosure'],
    sections: [
      { heading: 'Start with the current terms', body: ['AI music policies can change. Check Suno, your distributor, and each platform’s current rules before uploading. This article is not legal advice.'] },
      { heading: 'Prepare the release like a real record', body: ['Clean up the arrangement, verify metadata, avoid impersonation, document your process, and prepare honest pitch language.'] },
      { heading: 'Promotion still depends on fit', body: ['Curators may care less about the tool and more about whether the song feels finished, emotionally clear, and relevant to their audience.'] }
    ]
  },
  {
    slug: 'how-to-release-a-suno-song-on-spotify',
    title: 'How to Release a Suno Song on Spotify: Step-by-Step Checklist',
    description: 'A release-readiness workflow for turning a Suno track into a cleaner, better-documented streaming release.',
    category: 'AI Music',
    priority: 'P0',
    audience: 'Suno users moving from generation to release',
    primaryKeyword: 'how to release a Suno song on Spotify',
    cta: 'Start the Suno release checklist',
    related: ['can-you-release-suno-music-on-spotify', 'suno-to-spotify-checklist', 'how-to-promote-ai-music'],
    sections: [
      { heading: 'Before you distribute', body: ['Confirm your plan permits commercial use, review distributor rules, check metadata, master the audio, and document what parts of the track are AI-assisted.'] },
      { heading: 'Before you pitch', body: ['Prepare a concise artist story and avoid pretending the record was made in a way it was not. Trust matters.'] }
    ]
  },
  {
    slug: 'ai-music-release-checklist',
    title: 'AI Music Release Checklist for Suno and Udio Artists',
    description: 'A practical release checklist for AI-assisted songs, covering rights checks, metadata, disclosure, and promotion planning.',
    category: 'AI Music',
    priority: 'P0',
    audience: 'AI-assisted creators',
    primaryKeyword: 'AI music release checklist',
    cta: 'Open the interactive AI checklist',
    related: ['can-you-release-suno-music-on-spotify', 'udio-to-spotify-checklist', 'best-distributors-for-ai-music'],
    sections: [
      { heading: 'Checklist mindset', body: ['The goal is not to find a loophole. The goal is to release carefully, document your process, respect platform rules, and avoid misleading listeners or curators.'] },
      { heading: 'Core checks', body: ['Review tool terms, distributor requirements, metadata, artwork, vocals, samples, disclosure language, and campaign targets before upload.'] }
    ]
  },
  {
    slug: 'how-to-promote-ai-music',
    title: 'How to Promote AI Music Without Breaking Trust',
    description: 'A practical promotion framework for AI-assisted music that avoids spam, fake hype, and misleading claims.',
    category: 'AI Music',
    priority: 'P0',
    audience: 'AI-assisted artists and prolific creators',
    primaryKeyword: 'how to promote AI music',
    cta: 'Build an AI music campaign',
    related: ['how-to-pitch-ai-music-to-playlists', 'why-curators-reject-ai-music', 'ai-music-disclosure'],
    sections: [
      { heading: 'Do not scale spam', body: ['AI tools make it easy to create more songs than you can responsibly promote. CuratorFit’s angle is fewer, better releases with honest targeting.'] },
      { heading: 'Lead with sound and story', body: ['Tell curators what the track feels like, where it fits, and what human choices shaped the final version.'] }
    ]
  },
  {
    slug: 'why-curators-reject-ai-music',
    title: 'Why Curators Reject AI Music and How to Improve Your Chances',
    description: 'Common reasons AI-assisted tracks get rejected, plus practical ways to improve fit, story, and release quality.',
    category: 'AI Music',
    priority: 'P1',
    audience: 'AI creators frustrated by low response rates',
    primaryKeyword: 'why curators reject AI music',
    cta: 'Improve your AI music pitch',
    related: ['how-to-pitch-ai-music-to-playlists', 'how-to-promote-ai-music', 'ai-music-disclosure'],
    sections: [
      { heading: 'Rejection is often about fit, not just AI', body: ['Curators reject songs for weak hooks, unfinished mixes, genre mismatch, poor metadata, long intros, or unclear artist context. AI can amplify those issues if creators move too fast.'] },
      { heading: 'Improve the record and the pitch', body: ['Edit the arrangement, check the vocal, tighten the intro, clarify genre, and be transparent where needed.'] }
    ]
  }
];

export const alternatives: AlternativePage[] = [
  {
    slug: 'playlist-push-alternatives',
    title: 'Playlist Push Alternatives for Independent Artists',
    description: 'A trust-first way to compare playlist promotion options without blindly chasing expensive campaign packages.',
    competitor: 'Playlist Push',
    angle: 'CuratorFit focuses on fit, risk notes, and tracking before any paid review model.',
    bullets: ['Full visibility into targets', 'Campaign tracker first', 'No guaranteed placement language', 'Built for smaller artists and AI-assisted creators']
  },
  {
    slug: 'submithub-alternatives',
    title: 'SubmitHub Alternatives: Where Else Can You Pitch Music?',
    description: 'Compare transactional credit systems with a workflow-first campaign tracker built around fit and learning.',
    competitor: 'SubmitHub',
    angle: 'SubmitHub is a submission marketplace. CuratorFit is being built as a campaign OS.',
    bullets: ['Track outreach across channels', 'Save curator notes', 'Avoid repeat bad fits', 'Support Spotify, blogs, YouTube, SoundCloud, and more']
  },
  {
    slug: 'groover-alternatives',
    title: 'Groover Alternatives for Playlist and Blog Pitching',
    description: 'A practical comparison for artists who want more control, cleaner tracking, and trust-first guidance.',
    competitor: 'Groover',
    angle: 'CuratorFit emphasizes workflow, fit scoring, and clear campaign history.',
    bullets: ['Less credit-burning mindset', 'More campaign memory', 'Clearer target notes', 'Built-in education and no paid placement policy']
  },
  {
    slug: 'dailyplaylists-alternatives',
    title: 'DailyPlaylists Alternatives for Targeted Music Discovery',
    description: 'How to move from high-volume free submissions toward organized targeting and follow-up.',
    competitor: 'DailyPlaylists',
    angle: 'CuratorFit adds relationship memory and target scoring to the free submission workflow.',
    bullets: ['Saved targets', 'Pitch status board', 'Trust labels', 'Genre and mood filtering']
  },
  {
    slug: 'best-playlist-submission-sites-for-ai-music',
    title: 'Best Playlist Submission Sites for AI Music',
    description: 'A cautious, trust-first comparison for Suno, Udio, and AI-assisted artists looking for real listeners.',
    competitor: 'AI music playlist submission sites',
    angle: 'The safest AI music promotion starts with transparent release practices and curator fit.',
    bullets: ['AI disclosure guidance', 'No fake-stream tactics', 'Curator fit over volume', 'Release checklist built in']
  }
];

export const genrePages: GenrePage[] = [
  {
    slug: 'future-bass-playlists',
    title: 'Submit Future Bass and Melodic Bass Music to Playlists',
    description: 'A genre-fit guide for emotional future bass, melodic bass, cinematic drops, guitar warmth, and female vocal hooks.',
    genre: 'Future Bass / Melodic Bass',
    fitSignals: ['emotional drop payoff', 'clear hook', 'cinematic atmosphere', 'sidechained electronic energy', 'guitar or vocal warmth'],
    avoid: ['generic EDM pitch copy', 'pitching heavy dubstep lists', 'long intros with no payoff', 'unverified guaranteed-placement services']
  },
  {
    slug: 'lofi-playlists',
    title: 'Submit Lo-Fi, Chill, and Study Music to Playlists',
    description: 'How lo-fi producers can find better-fit study, chill, sleep, and background music targets.',
    genre: 'Lo-fi / Chill',
    fitSignals: ['soft transients', 'loop-friendly structure', 'warm texture', 'non-distracting melodies', 'clear background use case'],
    avoid: ['overly aggressive drops', 'busy vocals for study lists', 'bot-looking mega study lists', 'unclear curator identity']
  },
  {
    slug: 'christian-playlists',
    title: 'Submit Christian, Worship, and Inspirational Music to Playlists',
    description: 'A trust-first guide for faith-friendly playlist pitching without exploitative promotion claims.',
    genre: 'Christian / Worship / Inspirational',
    fitSignals: ['clear spiritual or hopeful theme', 'gentle tone', 'authentic story', 'worship-adjacent fit', 'family-safe context where relevant'],
    avoid: ['pay-to-play promises', 'generic church marketing language', 'mismatched secular mood lists', 'unclear theology or audience fit']
  },
  {
    slug: 'indie-pop-playlists',
    title: 'Submit Indie Pop and Sad Pop Music to Playlists',
    description: 'How bedroom pop, sad pop, and emotional indie artists can pitch by mood, lyric, and production fit.',
    genre: 'Indie Pop / Sad Pop',
    fitSignals: ['memorable chorus', 'intimate vocal', 'clear emotional premise', 'late-night mood', 'human lyric detail'],
    avoid: ['over-polished generic pop claims', 'pitching upbeat party lists', 'too much backstory before the song link']
  },
  {
    slug: 'ambient-cinematic-playlists',
    title: 'Submit Ambient, Cinematic, and Instrumental Music to Playlists',
    description: 'A practical guide for ambient, cinematic, prayerful, sleep, and instrumental creators.',
    genre: 'Ambient / Cinematic / Instrumental',
    fitSignals: ['clear use case', 'soft dynamics', 'loop-friendly length', 'no sudden harsh transitions', 'visual or emotional context'],
    avoid: ['vocal-heavy lists', 'unclear licensing language', 'promising sync outcomes', 'pitching without mood/use-case notes']
  }
];

export const toolCards = [
  {
    slug: 'spotify-playlist-scam-checker',
    title: 'Spotify Playlist Scam Checker',
    description: 'Score a playlist for common risk signals before you pitch or pay anyone.',
    href: '/tools/spotify-playlist-scam-checker'
  },
  {
    slug: 'playlist-pitch-generator',
    title: 'Playlist Pitch Generator',
    description: 'Create a short, curator-safe pitch based on genre, mood, story, and target type.',
    href: '/tools/playlist-pitch-generator'
  },
  {
    slug: 'ai-music-release-checklist',
    title: 'AI Music Release Checklist',
    description: 'Review rights, metadata, disclosure, distributor policy, and release-readiness steps.',
    href: '/tools/ai-music-release-checklist'
  },
  {
    slug: 'playlist-submission-tracker',
    title: 'Playlist Submission Tracker',
    description: 'A lightweight tracker preview for pitches, follow-ups, responses, and outcomes.',
    href: '/tools/playlist-submission-tracker'
  }
];

export const contentCategories: ContentCategory[] = ['Playlist Pitching', 'AI Music', 'Scam Prevention', 'Beginner Promotion', 'Comparison', 'Genre Guide', 'Tools'];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getAlternative(slug: string) {
  return alternatives.find((page) => page.slug === slug);
}

export function getGenrePage(slug: string) {
  return genrePages.find((page) => page.slug === slug);
}

export function buildMetadata(title: string, description: string, path: string): Metadata {
  return {
    title: `${title} | CuratorFit`,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: 'CuratorFit', type: 'article' },
    twitter: { card: 'summary_large_image', title, description }
  };
}
