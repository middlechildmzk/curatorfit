import { NextResponse } from 'next/server';
import { z } from 'zod';
import { canManageWorkspace, getWorkspaceContext } from '@/lib/artistos-workspace';
import { cleanText, getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const sendSchema = z.object({
  action: z.literal('send'),
  campaignTargetId: z.string().uuid(),
  artistMessage: z.string().max(2400).optional().or(z.literal('')),
  responseDays: z.number().int().min(3).max(60).default(14)
});

const startReviewSchema = z.object({
  action: z.literal('start_review'),
  submissionId: z.string().uuid()
});

const feedbackSchema = z.object({
  action: z.literal('submit_feedback'),
  submissionId: z.string().uuid(),
  decision: z.enum(['not_a_fit','feedback_only','considering','accepted','promotion_offered']),
  rating: z.number().int().min(1).max(5).optional(),
  feedbackText: z.string().min(10).max(5000),
  promotionIntent: z.boolean().default(false),
  deliverableType: z.string().max(120).optional().or(z.literal('')),
  deliverableDetails: z.string().max(1200).optional().or(z.literal('')),
  disclosureRequired: z.boolean().default(false)
});

const messageSchema = z.object({
  action: z.literal('message'),
  submissionId: z.string().uuid(),
  body: z.string().min(1).max(4000)
});

const withdrawSchema = z.object({
  action: z.literal('withdraw'),
  submissionId: z.string().uuid()
});

const requestSchema = z.discriminatedUnion('action', [sendSchema, startReviewSchema, feedbackSchema, messageSchema, withdrawSchema]);

function parseGenres(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  return String(value || '').split(/[,;|]/).map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function buildMatch(artistGenres: string[], property: { genre_tags?: string[] | null; genres?: string | null; verification_status?: string | null; activity_status?: string | null; evidence_strength?: number | null }) {
  const targetGenres = [...parseGenres(property.genre_tags), ...parseGenres(property.genres)];
  const overlap = artistGenres.filter((genre) => targetGenres.some((target) => target.includes(genre) || genre.includes(target)));
  let score = 45;
  const reasons: string[] = [];
  if (overlap.length) {
    score += Math.min(30, 12 + overlap.length * 6);
    reasons.push(`Genre overlap: ${overlap.slice(0, 4).join(', ')}`);
  } else if (targetGenres.length) {
    reasons.push('Genre fit needs human confirmation');
  } else {
    reasons.push('Target has not published structured genre preferences');
  }
  if (String(property.verification_status || '').toLowerCase() === 'verified') {
    score += 10;
    reasons.push('Property identity is verified');
  }
  if (['active','current','recent'].includes(String(property.activity_status || '').toLowerCase())) {
    score += 10;
    reasons.push('Recent activity signal');
  }
  const strength = Math.max(0, Math.min(5, Number(property.evidence_strength || 0)));
  score += strength;
  reasons.push(`Evidence strength ${strength}/5`);
  return { score: Math.min(100, score), reasons };
}

async function participantAccess(supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>, userId: string, submissionId: string) {
  const { data: submission } = await supabase
    .from('campaign_submissions')
    .select('id,workspace_id,professional_profile_id,status')
    .eq('id', submissionId)
    .maybeSingle();
  if (!submission) return null;
  const [{ data: membership }, { data: professional }] = await Promise.all([
    supabase.from('workspace_members').select('role').eq('workspace_id', submission.workspace_id).eq('user_id', userId).maybeSingle(),
    submission.professional_profile_id
      ? supabase.from('professional_profiles').select('id,user_id').eq('id', submission.professional_profile_id).maybeSingle()
      : Promise.resolve({ data: null as { id: string; user_id: string } | null })
  ]);
  return {
    submission,
    isArtistParticipant: Boolean(membership),
    isProfessionalParticipant: professional?.user_id === userId
  };
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', submissions: [] });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to view submissions.' }, { status: 401 });
  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  const { data: professional } = await supabase.from('professional_profiles').select('id').eq('user_id', auth.user.id).maybeSingle();
  const url = new URL(request.url);
  const scope = url.searchParams.get('scope') || 'all';

  const queries = [];
  if (workspace && scope !== 'professional') {
    queries.push(supabase.from('campaign_submissions').select('*').eq('workspace_id', workspace.workspaceId).order('created_at', { ascending: false }).limit(200));
  }
  if (professional && scope !== 'artist') {
    queries.push(supabase.from('campaign_submissions').select('*').eq('professional_profile_id', professional.id).order('created_at', { ascending: false }).limit(200));
  }
  const results = await Promise.all(queries);
  const byId = new Map<string, Record<string, any>>();
  results.forEach((result) => (result.data || []).forEach((item) => byId.set(item.id, item)));
  const submissions = Array.from(byId.values());

  const releaseIds = Array.from(new Set(submissions.map((item) => item.release_id).filter(Boolean)));
  const propertyIds = Array.from(new Set(submissions.map((item) => item.property_id).filter(Boolean)));
  const campaignIds = Array.from(new Set(submissions.map((item) => item.campaign_id).filter(Boolean)));
  const submissionIds = submissions.map((item) => item.id);

  const [releaseResult, propertyResult, campaignResult, feedbackResult, messageResult] = await Promise.all([
    releaseIds.length ? supabase.from('releases').select('id,artist_id,title,release_date,status,spotify_url,isrc,upc').in('id', releaseIds) : Promise.resolve({ data: [] }),
    propertyIds.length ? supabase.from('properties').select('id,name,property_type,platform,url,platform_url,verification_status,evidence_strength,activity_status,owner_or_operator').in('id', propertyIds) : Promise.resolve({ data: [] }),
    campaignIds.length ? supabase.from('campaigns').select('id,name,status,goals').in('id', campaignIds) : Promise.resolve({ data: [] }),
    submissionIds.length ? supabase.from('submission_feedback').select('id,submission_id,decision,rating,feedback_text,promotion_intent,proposed_deliverable,disclosure_required,created_at,updated_at').in('submission_id', submissionIds) : Promise.resolve({ data: [] }),
    submissionIds.length ? supabase.from('submission_messages').select('id,submission_id,sender_user_id,body,created_at,read_at').in('submission_id', submissionIds).order('created_at') : Promise.resolve({ data: [] })
  ]);

  const releases = releaseResult.data || [];
  const artistIds = Array.from(new Set(releases.map((release: any) => release.artist_id).filter(Boolean)));
  const { data: artists } = artistIds.length ? await supabase.from('artists').select('id,name,genre_tags').in('id', artistIds) : { data: [] };
  const properties = propertyResult.data || [];
  const campaigns = campaignResult.data || [];
  const feedback = feedbackResult.data || [];
  const messages = messageResult.data || [];

  return NextResponse.json({
    ok: true,
    scope,
    submissions: submissions.map((submission) => {
      const release = releases.find((item: any) => item.id === submission.release_id) || null;
      const artist = release ? (artists || []).find((item: any) => item.id === release.artist_id) || null : null;
      return {
        ...submission,
        release: release ? { ...release, artistName: artist?.name || 'Unknown artist', artistGenres: artist?.genre_tags || [] } : null,
        property: properties.find((item: any) => item.id === submission.property_id) || null,
        campaign: campaigns.find((item: any) => item.id === submission.campaign_id) || null,
        feedback: feedback.find((item: any) => item.submission_id === submission.id) || null,
        messages: messages.filter((item: any) => item.submission_id === submission.id)
      };
    })
  });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });
  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before changing submissions.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid submission request.' }, { status: 400 });
  const input = parsed.data;

  if (input.action === 'send') {
    const workspace = await getWorkspaceContext(supabase, auth.user.id);
    if (!workspace || !canManageWorkspace(workspace.role)) return NextResponse.json({ ok: false, error: 'Editor access is required to send a campaign.' }, { status: 403 });

    const { data: target } = await supabase
      .from('campaign_targets')
      .select('id,campaign_id,target_kind,target_id,status,workspace_id')
      .eq('id', input.campaignTargetId)
      .eq('workspace_id', workspace.workspaceId)
      .maybeSingle();
    if (!target || target.target_kind !== 'property') return NextResponse.json({ ok: false, error: 'Choose a valid CuratorFit property target.' }, { status: 404 });

    const { data: campaign } = await supabase.from('campaigns').select('id,release_id,name,status').eq('id', target.campaign_id).eq('workspace_id', workspace.workspaceId).maybeSingle();
    if (!campaign) return NextResponse.json({ ok: false, error: 'Campaign not found.' }, { status: 404 });
    const [{ data: release }, { data: property }, { data: professionalProperty }] = await Promise.all([
      supabase.from('releases').select('id,artist_id,title,status').eq('id', campaign.release_id).eq('workspace_id', workspace.workspaceId).maybeSingle(),
      supabase.from('properties').select('id,name,genre_tags,genres,verification_status,evidence_strength,activity_status').eq('id', target.target_id).is('archived_at', null).maybeSingle(),
      supabase.from('professional_properties').select('professional_profile_id').eq('property_id', target.target_id).eq('status', 'active').limit(1).maybeSingle()
    ]);
    if (!release || !property) return NextResponse.json({ ok: false, error: 'Release or target property not found.' }, { status: 404 });
    const { data: artist } = await supabase.from('artists').select('id,name,genre_tags').eq('id', release.artist_id).maybeSingle();
    const match = buildMatch(parseGenres(artist?.genre_tags), property);
    const mode = professionalProperty?.professional_profile_id ? 'marketplace' : 'outreach';
    const status = mode === 'marketplace' ? 'pending_review' : 'invited';
    const responseDueAt = new Date(Date.now() + input.responseDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: submission, error } = await supabase.from('campaign_submissions').upsert({
      workspace_id: workspace.workspaceId,
      campaign_id: campaign.id,
      release_id: release.id,
      campaign_target_id: target.id,
      property_id: property.id,
      professional_profile_id: professionalProperty?.professional_profile_id || null,
      submission_mode: mode,
      status,
      match_score: match.score,
      match_reasons: match.reasons,
      artist_message: cleanText(input.artistMessage, 2400) || null,
      response_due_at: responseDueAt,
      submitted_at: new Date().toISOString(),
      terms: { paid_placement_prohibited: true, artist_approval_required: true }
    }, { onConflict: 'campaign_target_id' }).select('id,status,submission_mode,match_score,match_reasons,response_due_at').single();
    if (error || !submission) return NextResponse.json({ ok: false, error: error?.message || 'Could not send the submission.' }, { status: 500 });
    await supabase.from('campaign_targets').update({ status: 'pitched', updated_at: new Date().toISOString() }).eq('id', target.id);
    return NextResponse.json({ ok: true, submission });
  }

  const access = await participantAccess(supabase, auth.user.id, input.submissionId);
  if (!access) return NextResponse.json({ ok: false, error: 'Submission not found.' }, { status: 404 });

  if (input.action === 'start_review') {
    if (!access.isProfessionalParticipant) return NextResponse.json({ ok: false, error: 'Only the assigned professional can start this review.' }, { status: 403 });
    const { data, error } = await supabase.from('campaign_submissions').update({ status: 'in_review' }).eq('id', input.submissionId).select('id,status').single();
    if (error || !data) return NextResponse.json({ ok: false, error: error?.message || 'Could not start review.' }, { status: 500 });
    return NextResponse.json({ ok: true, submission: data });
  }

  if (input.action === 'submit_feedback') {
    if (!access.isProfessionalParticipant) return NextResponse.json({ ok: false, error: 'Only the assigned professional can submit feedback.' }, { status: 403 });
    const proposedDeliverable = input.deliverableType ? { type: cleanText(input.deliverableType, 120), details: cleanText(input.deliverableDetails, 1200) } : {};
    const { data: feedback, error } = await supabase.from('submission_feedback').upsert({
      submission_id: input.submissionId,
      created_by: auth.user.id,
      decision: input.decision,
      rating: input.rating || null,
      feedback_text: cleanText(input.feedbackText, 5000),
      promotion_intent: input.promotionIntent,
      proposed_deliverable: proposedDeliverable,
      disclosure_required: input.disclosureRequired
    }, { onConflict: 'submission_id' }).select('id,decision,rating,feedback_text,promotion_intent,proposed_deliverable,disclosure_required,updated_at').single();
    if (error || !feedback) return NextResponse.json({ ok: false, error: error?.message || 'Could not save feedback.' }, { status: 500 });
    const nextStatus = input.decision === 'not_a_fit' ? 'declined' : input.decision === 'accepted' ? 'accepted' : input.decision === 'promotion_offered' ? 'promotion_committed' : 'feedback_submitted';
    await supabase.from('campaign_submissions').update({ status: nextStatus }).eq('id', input.submissionId);
    return NextResponse.json({ ok: true, feedback, status: nextStatus });
  }

  if (input.action === 'message') {
    if (!access.isArtistParticipant && !access.isProfessionalParticipant) return NextResponse.json({ ok: false, error: 'You are not a participant in this submission.' }, { status: 403 });
    const { data, error } = await supabase.from('submission_messages').insert({ submission_id: input.submissionId, sender_user_id: auth.user.id, body: cleanText(input.body, 4000) }).select('id,body,created_at').single();
    if (error || !data) return NextResponse.json({ ok: false, error: error?.message || 'Could not send the message.' }, { status: 500 });
    return NextResponse.json({ ok: true, message: data });
  }

  if (!access.isArtistParticipant) return NextResponse.json({ ok: false, error: 'Only the artist team can withdraw a submission.' }, { status: 403 });
  const { data, error } = await supabase.from('campaign_submissions').update({ status: 'withdrawn' }).eq('id', input.submissionId).select('id,status').single();
  if (error || !data) return NextResponse.json({ ok: false, error: error?.message || 'Could not withdraw the submission.' }, { status: 500 });
  return NextResponse.json({ ok: true, submission: data });
}
