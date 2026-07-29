import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getWorkspaceContext } from '@/lib/artistos-workspace';
import { cleanText, getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const claimSchema = z.object({
  propertySlug: z.string().regex(/^property-[0-9a-f-]{36}$/i),
  verificationMethod: z.enum(['oauth','domain_email','website_token','social_profile','manual']),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  evidenceNotes: z.string().max(1200).optional().or(z.literal(''))
});

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before claiming a property.' }, { status: 401 });
  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace) return NextResponse.json({ ok: false, error: 'Finish onboarding before claiming a property.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Add valid ownership evidence.' }, { status: 400 });
  const input = parsed.data;
  const propertyId = input.propertySlug.slice('property-'.length);

  const [{ data: profile }, { data: property }] = await Promise.all([
    supabase.from('professional_profiles').select('id').eq('user_id', auth.user.id).maybeSingle(),
    supabase.from('properties').select('id,name,property_type,platform,verification_status').eq('id', propertyId).is('archived_at', null).maybeSingle()
  ]);
  if (!profile) return NextResponse.json({ ok: false, error: 'Create a professional profile before claiming channels.' }, { status: 403 });
  if (!property) return NextResponse.json({ ok: false, error: 'The property could not be found.' }, { status: 404 });

  const { data: existing } = await supabase
    .from('property_claims')
    .select('id,status')
    .eq('property_id', property.id)
    .eq('claimant_user_id', auth.user.id)
    .in('status', ['pending','approved'])
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, claim: existing, message: existing.status === 'approved' ? 'This property is already connected.' : 'This claim is already under review.' });

  const { data: claim, error } = await supabase.from('property_claims').insert({
    property_id: property.id,
    claimant_user_id: auth.user.id,
    professional_profile_id: profile.id,
    claimant_workspace_id: workspace.workspaceId,
    verification_method: input.verificationMethod,
    evidence_url: input.evidenceUrl || null,
    evidence_notes: cleanText(input.evidenceNotes, 1200) || null,
    status: 'pending'
  }).select('id,status,verification_method,created_at').single();
  if (error || !claim) return NextResponse.json({ ok: false, error: error?.message || 'Could not submit the claim.' }, { status: 500 });

  await supabase.from('professional_properties').upsert({
    professional_profile_id: profile.id,
    property_id: property.id,
    role: 'owner',
    status: 'pending'
  }, { onConflict: 'professional_profile_id,property_id' });

  return NextResponse.json({ ok: true, claim, property, message: 'Ownership claim submitted for verification.' });
}
