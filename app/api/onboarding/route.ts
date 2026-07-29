import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureWorkspaceForUser, findOrCreateArtist, getWorkspaceContext } from '@/lib/artistos-workspace';
import { cleanText, getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const professionalTypes = ['playlist_curator','youtube_channel','blogger_journalist','creator_influencer','dj','radio','podcast_newsletter','label_manager','sync_professional'] as const;

const onboardingSchema = z.object({
  primaryRole: z.enum(['artist','professional','hybrid']),
  displayName: z.string().min(1).max(120),
  artistName: z.string().max(160).optional().or(z.literal('')),
  professionalTypes: z.array(z.enum(professionalTypes)).max(9).default([]),
  bio: z.string().max(1200).optional().or(z.literal('')),
  location: z.string().max(160).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  reviewMode: z.enum(['editorial_only','free_feedback','paid_review','sponsored_services']).default('editorial_only'),
  reviewFeeDollars: z.number().min(0).max(5000).default(0),
  turnaroundDays: z.number().int().min(1).max(90).default(14),
  isPublic: z.boolean().default(false)
});

function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'music-professional';
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', profile: null, professionalProfile: null, artists: [] });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to continue onboarding.' }, { status: 401 });

  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  const [profileResult, professionalResult, artistResult] = await Promise.all([
    supabase.from('profiles').select('id,email,display_name,primary_role,onboarding_completed,bio,location,current_workspace_id').eq('id', auth.user.id).maybeSingle(),
    supabase.from('professional_profiles').select('id,public_slug,display_name,professional_types,bio,location,website,review_mode,review_fee_cents,currency,turnaround_days,capacity_status,verification_status,is_public').eq('user_id', auth.user.id).maybeSingle(),
    workspace
      ? supabase.from('artists').select('id,name,genre_tags,spotify_url').eq('workspace_id', workspace.workspaceId).order('created_at')
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; genre_tags: string[] | null; spotify_url: string | null }> })
  ]);

  return NextResponse.json({
    ok: true,
    profile: profileResult.data || null,
    professionalProfile: professionalResult.data || null,
    artists: artistResult.data || [],
    workspace
  });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to create an ArtistOS account.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Check the onboarding details and try again.' }, { status: 400 });
  const input = parsed.data;
  const displayName = cleanText(input.displayName, 120);
  const includeArtist = input.primaryRole !== 'professional';
  const artistName = cleanText(input.artistName || displayName, 160);

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: auth.user.id,
    email: auth.user.email || null,
    display_name: displayName,
    role: input.primaryRole === 'professional' ? 'professional' : 'artist',
    primary_role: input.primaryRole,
    onboarding_completed: true,
    bio: cleanText(input.bio, 1200) || null,
    location: cleanText(input.location, 160) || null
  }, { onConflict: 'id' });
  if (profileError) return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });

  const workspace = await ensureWorkspaceForUser(supabase, {
    userId: auth.user.id,
    email: auth.user.email,
    displayName,
    includeArtist,
    artistName
  });
  if (!workspace) return NextResponse.json({ ok: false, error: 'Could not create your ArtistOS workspace.' }, { status: 500 });

  if (includeArtist) await findOrCreateArtist(supabase, workspace.workspaceId, artistName);

  let professionalProfile = null;
  if (input.primaryRole !== 'artist') {
    const publicSlug = `${slugify(displayName)}-${auth.user.id.slice(0, 8)}`;
    const { data, error } = await supabase.from('professional_profiles').upsert({
      user_id: auth.user.id,
      workspace_id: workspace.workspaceId,
      public_slug: publicSlug,
      display_name: displayName,
      professional_types: input.professionalTypes,
      bio: cleanText(input.bio, 1200) || null,
      location: cleanText(input.location, 160) || null,
      website: input.website || null,
      review_mode: input.reviewMode,
      review_fee_cents: Math.round(input.reviewFeeDollars * 100),
      currency: 'USD',
      turnaround_days: input.turnaroundDays,
      capacity_status: 'open',
      is_public: input.isPublic
    }, { onConflict: 'user_id' }).select('id,public_slug,display_name,professional_types,review_mode,review_fee_cents,turnaround_days,verification_status,is_public').single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    professionalProfile = data;
  }

  await supabase.from('profiles').update({ current_workspace_id: workspace.workspaceId }).eq('id', auth.user.id);
  return NextResponse.json({ ok: true, workspace, professionalProfile, redirect: input.primaryRole === 'professional' ? '/professional' : '/dashboard' });
}
