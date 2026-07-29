import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getWorkspaceContext } from '@/lib/artistos-workspace';
import { cleanText, getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const updateSchema = z.object({
  displayName: z.string().min(1).max(120),
  professionalTypes: z.array(z.string().max(60)).max(12),
  bio: z.string().max(1200).optional().or(z.literal('')),
  location: z.string().max(160).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  reviewMode: z.enum(['editorial_only','free_feedback','paid_review','sponsored_services']),
  reviewFeeDollars: z.number().min(0).max(5000),
  turnaroundDays: z.number().int().min(1).max(90),
  capacityStatus: z.enum(['open','limited','paused']),
  isPublic: z.boolean()
});

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', profile: null, claims: [], submissions: [] });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to open the professional workspace.' }, { status: 401 });

  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id,user_id,workspace_id,public_slug,display_name,professional_types,bio,location,website,review_mode,review_fee_cents,currency,turnaround_days,capacity_status,verification_status,is_public,created_at,updated_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ ok: true, needsOnboarding: true, profile: null, claims: [], submissions: [] });

  const { data: claims } = await supabase
    .from('property_claims')
    .select('id,property_id,verification_method,evidence_url,evidence_notes,status,reviewer_notes,reviewed_at,created_at,updated_at')
    .eq('professional_profile_id', profile.id)
    .order('created_at', { ascending: false });
  const propertyIds = Array.from(new Set((claims || []).map((claim) => claim.property_id)));
  const { data: properties } = propertyIds.length
    ? await supabase.from('properties').select('id,name,property_type,platform,url,platform_url,verification_status,evidence_strength,activity_status').in('id', propertyIds)
    : { data: [] as Array<{ id: string; name: string; property_type: string | null; platform: string | null; url: string | null; platform_url: string | null; verification_status: string | null; evidence_strength: number | null; activity_status: string | null }> };

  const { count: submissionCount } = await supabase
    .from('campaign_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('professional_profile_id', profile.id);
  const { count: pendingCount } = await supabase
    .from('campaign_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('professional_profile_id', profile.id)
    .in('status', ['invited','pending_review','in_review']);

  return NextResponse.json({
    ok: true,
    profile,
    metrics: { submissions: submissionCount || 0, pending: pendingCount || 0, properties: claims?.filter((claim) => claim.status === 'approved').length || 0 },
    claims: (claims || []).map((claim) => ({
      ...claim,
      property: properties?.find((property) => property.id === claim.property_id) || null
    }))
  });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before updating your professional profile.' }, { status: 401 });
  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace) return NextResponse.json({ ok: false, error: 'Finish onboarding before creating a professional profile.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Check the professional profile details.' }, { status: 400 });
  const input = parsed.data;
  const { data: existing } = await supabase.from('professional_profiles').select('id,public_slug').eq('user_id', auth.user.id).maybeSingle();
  if (!existing) return NextResponse.json({ ok: false, error: 'Create your professional account through onboarding first.' }, { status: 404 });

  const { data, error } = await supabase.from('professional_profiles').update({
    display_name: cleanText(input.displayName, 120),
    professional_types: input.professionalTypes,
    bio: cleanText(input.bio, 1200) || null,
    location: cleanText(input.location, 160) || null,
    website: input.website || null,
    review_mode: input.reviewMode,
    review_fee_cents: Math.round(input.reviewFeeDollars * 100),
    turnaround_days: input.turnaroundDays,
    capacity_status: input.capacityStatus,
    is_public: input.isPublic
  }).eq('id', existing.id).select('id,public_slug,display_name,professional_types,bio,location,website,review_mode,review_fee_cents,currency,turnaround_days,capacity_status,verification_status,is_public').single();
  if (error || !data) return NextResponse.json({ ok: false, error: error?.message || 'Could not update the professional profile.' }, { status: 500 });

  return NextResponse.json({ ok: true, profile: data });
}
