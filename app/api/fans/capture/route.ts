import { createHash } from 'node:crypto';
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

function hashEvidence(value: string) {
  const salt = process.env.CONSENT_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || 'artistos-local-development';
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Enter a valid email and approve the consent checkbox.' }, { status: 400 });

  const input = parsed.data;
  const { data: smartLink, error: linkError } = await supabase
    .from('smart_links')
    .select('id,release_id,is_active')
    .eq('id', input.smartLinkId)
    .eq('is_active', true)
    .maybeSingle();

  if (linkError || !smartLink) return NextResponse.json({ ok: false, error: 'This fan link is no longer active.' }, { status: 404 });

  const { data: release } = await supabase
    .from('releases')
    .select('artist_profile_id')
    .eq('id', smartLink.release_id)
    .maybeSingle();

  if (!release?.artist_profile_id) return NextResponse.json({ ok: false, error: 'Release owner could not be resolved.' }, { status: 409 });

  const { data: artistProfile } = await supabase
    .from('artist_profiles')
    .select('user_id')
    .eq('id', release.artist_profile_id)
    .maybeSingle();

  if (!artistProfile?.user_id) return NextResponse.json({ ok: false, error: 'Release owner could not be resolved.' }, { status: 409 });

  const normalizedEmail = input.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const { data: fan, error: fanError } = await supabase
    .from('fans')
    .upsert(
      {
        owner_user_id: artistProfile.user_id,
        source_smart_link_id: smartLink.id,
        email: normalizedEmail,
        normalized_email: normalizedEmail,
        first_name: cleanText(input.firstName, 100) || null,
        source_channel: cleanText(input.utmSource, 120) || 'smart_link',
        source_campaign: cleanText(input.utmCampaign, 160) || null,
        last_seen_at: now,
        updated_at: now
      },
      { onConflict: 'owner_user_id,normalized_email' }
    )
    .select('id')
    .single();

  if (fanError || !fan) return NextResponse.json({ ok: false, error: fanError?.message || 'Could not save fan signup.' }, { status: 500 });

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const { error: consentError } = await supabase.from('fan_consents').insert([
    {
      fan_id: fan.id,
      type: 'email_marketing',
      granted: true,
      policy_version: input.policyVersion,
      source_url: input.sourceUrl || null,
      ip_hash: hashEvidence(forwardedFor),
      user_agent_hash: hashEvidence(userAgent),
      evidence: { method: 'explicit_checkbox', captured_at: now }
    },
    {
      fan_id: fan.id,
      type: 'privacy_terms',
      granted: true,
      policy_version: input.policyVersion,
      source_url: input.sourceUrl || null,
      ip_hash: hashEvidence(forwardedFor),
      user_agent_hash: hashEvidence(userAgent),
      evidence: { method: 'form_submission', captured_at: now }
    }
  ]);

  if (consentError) return NextResponse.json({ ok: false, error: consentError.message }, { status: 500 });

  await supabase.from('link_events').insert({
    smart_link_id: smartLink.id,
    fan_id: fan.id,
    event_type: 'fan_signup',
    utm_source: cleanText(input.utmSource, 120) || null,
    utm_medium: cleanText(input.utmMedium, 120) || null,
    utm_campaign: cleanText(input.utmCampaign, 160) || null,
    referrer: cleanText(request.headers.get('referer'), 500) || null,
    metadata: { consent_policy_version: input.policyVersion }
  });

  return NextResponse.json({ ok: true });
}
