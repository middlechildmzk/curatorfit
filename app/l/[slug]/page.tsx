import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Headphones, Music2, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { FanCaptureForm } from '@/components/fan-capture-form';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { humanize } from '@/lib/artistos';

type LinkPageData = {
  id: string;
  slug: string;
  mode: string;
  headline: string | null;
  description: string | null;
  capture_email: boolean;
  consent_copy_version: string;
  release: {
    title: string;
    primary_artist_name: string;
    release_date: string | null;
    status: string;
  };
  destinations: Array<{ id: string; service: string; url: string; position: number }>;
};

const demoData: LinkPageData = {
  id: '00000000-0000-4000-8000-000000000001',
  slug: 'middle-child-never-alone',
  mode: 'presave',
  headline: 'Middle Child — Never Alone',
  description: 'A wounded-but-hopeful electronic release about being carried through the hardest season.',
  capture_email: true,
  consent_copy_version: '2026-07-v1',
  release: {
    title: 'Never Alone',
    primary_artist_name: 'Middle Child',
    release_date: '2026-07-31',
    status: 'upcoming'
  },
  destinations: []
};

async function getLinkData(slug: string): Promise<LinkPageData | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return slug === demoData.slug ? demoData : null;

  const { data: smartLink } = await supabase
    .from('smart_links')
    .select('id,release_id,slug,mode,headline,description,capture_email,consent_copy_version')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (!smartLink) return null;

  const [{ data: release }, { data: destinations }] = await Promise.all([
    supabase
      .from('releases')
      .select('title,artist_id,release_date,status')
      .eq('id', smartLink.release_id)
      .maybeSingle(),
    supabase
      .from('smart_link_destinations')
      .select('id,service,url,position')
      .eq('smart_link_id', smartLink.id)
      .eq('is_active', true)
      .order('position', { ascending: true })
  ]);

  if (!release) return null;
  const { data: artist } = await supabase.from('artists').select('name').eq('id', release.artist_id).maybeSingle();

  return {
    id: smartLink.id,
    slug: smartLink.slug,
    mode: smartLink.mode,
    headline: smartLink.headline,
    description: smartLink.description,
    capture_email: smartLink.capture_email,
    consent_copy_version: smartLink.consent_copy_version,
    release: {
      title: release.title,
      primary_artist_name: artist?.name || 'Unknown artist',
      release_date: release.release_date,
      status: release.status
    },
    destinations: destinations || []
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLinkData(slug);
  if (!data) return { title: 'Release not found | ArtistOS' };
  return {
    title: `${data.release.primary_artist_name} — ${data.release.title}`,
    description: data.description || `Listen to ${data.release.title} by ${data.release.primary_artist_name}.`
  };
}

export default async function FanLinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getLinkData(slug);
  if (!data) notFound();

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#080808] px-5 py-10 text-white md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
          <span className="inline-flex items-center gap-2"><Music2 className="h-4 w-4 text-[#c8ff00]" /> ArtistOS Link</span>
          <span>{humanize(data.mode)}</span>
        </div>

        <section className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-[#111] shadow-2xl">
          <div className="grid gap-0 md:grid-cols-[0.85fr_1.15fr]">
            <div className="flex min-h-[340px] flex-col justify-between bg-gradient-to-br from-[#c8ff00] via-[#9dbf18] to-[#171b08] p-7 text-black">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-black/20 bg-black/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">{humanize(data.release.status)}</span>
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold opacity-60">{data.release.primary_artist_name}</p>
                <h1 className="mt-2 text-4xl font-black leading-[0.95] tracking-[-0.05em] md:text-5xl">{data.release.title}</h1>
                {data.release.release_date ? <p className="mt-5 text-sm font-bold opacity-70">Release date · {data.release.release_date}</p> : null}
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff00]">{data.mode === 'presave' ? 'Be there on release day' : 'Choose where to listen'}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">{data.headline || `${data.release.primary_artist_name} — ${data.release.title}`}</h2>
              <p className="mt-3 text-sm leading-7 text-white/55">{data.description || 'Follow the release and choose your preferred music service.'}</p>

              <div className="mt-6 grid gap-2">
                {data.destinations.length ? data.destinations.map((destination) => (
                  <Link className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-sm font-bold transition hover:border-[#c8ff00]/50 hover:bg-white/[0.07]" href={destination.url} key={destination.id} target="_blank" rel="noopener noreferrer">
                    <span>{humanize(destination.service)}</span>
                    <ArrowUpRight className="h-4 w-4 text-[#c8ff00]" />
                  </Link>
                )) : (
                  <div className="rounded-2xl border border-dashed border-white/15 p-4 text-sm leading-6 text-white/45">Streaming destinations will appear here as they are resolved. The fan signup remains available before release.</div>
                )}
              </div>

              {data.capture_email ? <div className="mt-5"><FanCaptureForm smartLinkId={data.id} policyVersion={data.consent_copy_version} /></div> : null}
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/35">
          <ShieldCheck className="h-4 w-4" /> Consent-backed fan capture. No stream or placement guarantees.
        </div>
      </div>
    </main>
  );
}
