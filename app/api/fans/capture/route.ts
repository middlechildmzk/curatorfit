import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cleanText } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const schema = z.object({
  smartLinkId: z.string().uuid(),
  email: z.string().email().max(320),
  firstName: z.string().max(100).optional().or(z.literal('')),
  emailConsent: z.literal(true),
  policyVersion: z.string().min(1).max(80),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  utmSource: z.string().max(120).optional().or(z.literal('')),
  utmMedium: z.string().max(120).optional().or(z.literal('')),
  utmCampaign: z.string().max(160).optional().or(z.literal(''))
});

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Enter a valid email and approve the consent checkbox.' }, { status: 400 });

  const input = parsed.data;
  const { data: smartLink, error: linkError } = await supabase
    .from('smart_links')
    .select('id,workspace_id,owner_id,is_active')
    .eq('id', input.smartLinkId)
    .eq('is_active', true)
    .maybeSingle();

  if (linkError || !smartLink) return NextResponse.json({ ok: false, error: 'This fan link is no longer active.' }, { status: 404 });

  const normalizedEmail = input.email.trim().toLowerCase();
  const firstName = cleanText(input.firstName, 100) || null;
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);

  const { data: existingFan } = await supabase
    .from('fans')
    .select('id')
    .eq('workspace_id', smartLink.workspace_id)
    .is('archived_at', null)
    .ilike('email', normalizedEmail)
    .limit(1)
    .maybeSingle();

  let fanId = existingFan?.id || null;
  if (fanId) {
    const { error } = await supabase
      .from('fans')
      .update({
        email: normalizedEmail,
        first_name: firstName,
        name: firstName,
        consent_status: 'opted_in',
        consent_source: 'artistos_smart_link',
        source_smart_link_id: smartLink.id,
        last_seen_at: nowIso,
        consent_last_recorded_at: nowIso
      })
      .eq('id', fanId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else {
    const { data: fan, error } = await supabase
      .from('fans')
      .insert({
        workspace_id: smartLink.workspace_id,
        created_by: smartLink.owner_id,
        email: normalizedEmail,
        first_name: firstName,
        name: firstName,
        consent_status: 'opted_in',
        consent_source: 'artistos_smart_link',
        first_seen: today,
        verification_status: 'unverified',
        source_smart_link_id: smartLink.id,
        last_seen_at: nowIso,
        consent_last_recorded_at: nowIso
      })
      .select('id')
      .single();

    if (error || !fan) return NextResponse.json({ ok: false, error: error?.message || 'Could not save fan signup.' }, { status: 500 });
    fanId = fan.id;
  }

  const attribution = {
    method: 'explicit_checkbox',
    captured_at: nowIso,
    utm_source: cleanText(input.utmSource, 120) || null,
    utm_medium: cleanText(input.utmMedium, 120) || null,
    utm_campaign: cleanText(input.utmCampaign, 160) || null
  };

  const { error: consentError } = await supabase.from('fan_consents').insert([
    {
      workspace_id: smartLink.workspace_id,
      fan_id: fanId,
      smart_link_id: smartLink.id,
      consent_type: 'email_marketing',
      granted: true,
      policy_version: input.policyVersion,
      source_url: input.sourceUrl || null,
      evidence: attribution
    },
    {
      workspace_id: smartLink.workspace_id,
      fan_id: fanId,
      smart_link_id: smartLink.id,
      consent_type: 'privacy_terms',
      granted: true,
      policy_version: input.policyVersion,
      source_url: input.sourceUrl || null,
      evidence: { ...attribution, method: 'form_submission' }
    }
  ]);

  if (consentError) return NextResponse.json({ ok: false, error: consentError.message }, { status: 500 });

  await supabase.from('link_events').insert({
    workspace_id: smartLink.workspace_id,
    smart_link_id: smartLink.id,
    fan_id: fanId,
    event_type: 'fan_signup',
    utm_source: cleanText(input.utmSource, 120) || null,
    utm_medium: cleanText(input.utmMedium, 120) || null,
    utm_campaign: cleanText(input.utmCampaign, 160) || null,
    referrer: cleanText(request.headers.get('referer'), 500) || null,
    metadata: { consent_policy_version: input.policyVersion }
  });

  return NextResponse.json({ ok: true });
}
