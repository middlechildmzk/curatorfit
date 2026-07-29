import { NextResponse } from 'next/server';
import { z } from 'zod';
import { canManageWorkspace, getWorkspaceContext } from '@/lib/artistos-workspace';
import { cleanText, getRequestUser } from '@/lib/server-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const createSchema = z.object({
  action: z.literal('create'),
  releaseId: z.string().uuid(),
  name: z.string().min(2).max(200),
  goals: z.string().max(1000).optional().or(z.literal(''))
});

const attachTargetSchema = z.object({
  action: z.literal('attach_target'),
  campaignId: z.string().uuid(),
  targetSlug: z.string().regex(/^property-[0-9a-f-]{36}$/i),
  notes: z.string().max(1000).optional().or(z.literal(''))
});

const updateTargetSchema = z.object({
  action: z.literal('update_target'),
  campaignTargetId: z.string().uuid(),
  status: z.enum(['queued', 'pitched', 'replied', 'accepted', 'declined', 'placed']),
  notes: z.string().max(1000).optional().or(z.literal(''))
});

const requestSchema = z.discriminatedUnion('action', [createSchema, attachTargetSchema, updateTargetSchema]);

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', campaigns: [] });

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in to open campaigns.' }, { status: 401 });
  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace) return NextResponse.json({ ok: false, error: 'No ArtistOS workspace is assigned to this account.' }, { status: 403 });

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id,release_id,name,status,start_date,end_date,goals,created_at,updated_at')
    .eq('workspace_id', workspace.workspaceId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const campaignIds = (campaigns || []).map((campaign) => campaign.id);
  const releaseIds = [...new Set((campaigns || []).map((campaign) => campaign.release_id).filter(Boolean))] as string[];

  const [releaseResult, targetResult, deliverableResult, evidenceResult] = await Promise.all([
    releaseIds.length
      ? supabase.from('releases').select('id,artist_id,title,release_date,status').eq('workspace_id', workspace.workspaceId).in('id', releaseIds)
      : Promise.resolve({ data: [] as Array<{ id: string; artist_id: string; title: string; release_date: string | null; status: string }> }),
    campaignIds.length
      ? supabase.from('campaign_targets').select('id,campaign_id,target_kind,target_id,status,notes,added_at,updated_at').eq('workspace_id', workspace.workspaceId).in('campaign_id', campaignIds).order('added_at', { ascending: true })
      : Promise.resolve({ data: [] as Array<{ id: string; campaign_id: string; target_kind: string; target_id: string; status: string; notes: string | null; added_at: string; updated_at: string }> }),
    campaignIds.length
      ? supabase.from('campaign_deliverables').select('id,campaign_id,status').eq('workspace_id', workspace.workspaceId).in('campaign_id', campaignIds)
      : Promise.resolve({ data: [] as Array<{ id: string; campaign_id: string; status: string }> }),
    campaignIds.length
      ? supabase.from('evidence_records').select('id,campaign_id,verification_status').eq('workspace_id', workspace.workspaceId).in('campaign_id', campaignIds).is('revoked_at', null)
      : Promise.resolve({ data: [] as Array<{ id: string; campaign_id: string; verification_status: string }> })
  ]);

  const releases = releaseResult.data || [];
  const targets = targetResult.data || [];
  const propertyIds = [...new Set(targets.filter((target) => target.target_kind === 'property').map((target) => target.target_id))];
  const artistIds = [...new Set(releases.map((release) => release.artist_id))];

  const [propertyResult, artistResult] = await Promise.all([
    propertyIds.length
      ? supabase.from('properties').select('id,name,property_type,platform,verification_status,evidence_strength,activity_status').eq('workspace_id', workspace.workspaceId).in('id', propertyIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; property_type: string | null; platform: string | null; verification_status: string | null; evidence_strength: number | null; activity_status: string | null }> }),
    artistIds.length
      ? supabase.from('artists').select('id,name').eq('workspace_id', workspace.workspaceId).in('id', artistIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> })
  ]);

  const properties = propertyResult.data || [];
  const artists = artistResult.data || [];
  const deliverables = deliverableResult.data || [];
  const evidence = evidenceResult.data || [];

  return NextResponse.json({
    ok: true,
    campaigns: (campaigns || []).map((campaign) => {
      const release = releases.find((item) => item.id === campaign.release_id) || null;
      const artist = release ? artists.find((item) => item.id === release.artist_id) || null : null;
      const campaignTargets = targets.filter((target) => target.campaign_id === campaign.id).map((target) => {
        const property = target.target_kind === 'property' ? properties.find((item) => item.id === target.target_id) || null : null;
        return {
          id: target.id,
          targetKind: target.target_kind,
          targetId: target.target_id,
          name: property?.name || 'Unresolved target',
          channel: property?.property_type || property?.platform || target.target_kind,
          status: target.status,
          notes: target.notes,
          verificationStatus: property?.verification_status || 'unverified',
          evidenceStrength: property?.evidence_strength || 0,
          activityStatus: property?.activity_status || 'unknown'
        };
      });
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        goals: campaign.goals,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        release: release ? { id: release.id, title: release.title, status: release.status, releaseDate: release.release_date, artistName: artist?.name || 'Unknown artist' } : null,
        targets: campaignTargets,
        deliverableCount: deliverables.filter((item) => item.campaign_id === campaign.id).length,
        verifiedDeliverableCount: deliverables.filter((item) => item.campaign_id === campaign.id && item.status === 'verified').length,
        evidenceCount: evidence.filter((item) => item.campaign_id === campaign.id).length
      };
    })
  });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });

  const auth = await getRequestUser(request);
  if (!auth) return NextResponse.json({ ok: false, error: 'Log in before changing campaigns.' }, { status: 401 });
  const workspace = await getWorkspaceContext(supabase, auth.user.id);
  if (!workspace || !canManageWorkspace(workspace.role)) return NextResponse.json({ ok: false, error: 'Editor access is required.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid campaign request.' }, { status: 400 });
  const input = parsed.data;

  if (input.action === 'create') {
    const { data: release } = await supabase.from('releases').select('id').eq('id', input.releaseId).eq('workspace_id', workspace.workspaceId).maybeSingle();
    if (!release) return NextResponse.json({ ok: false, error: 'Release not found.' }, { status: 404 });
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ workspace_id: workspace.workspaceId, release_id: release.id, name: cleanText(input.name, 200), goals: cleanText(input.goals, 1000) || null, status: 'active', start_date: new Date().toISOString().slice(0, 10) })
      .select('id,name,status')
      .single();
    if (error || !data) return NextResponse.json({ ok: false, error: error?.message || 'Could not create campaign.' }, { status: 500 });
    return NextResponse.json({ ok: true, campaign: data });
  }

  if (input.action === 'attach_target') {
    const targetId = input.targetSlug.slice('property-'.length);
    const [{ data: campaign }, { data: property }] = await Promise.all([
      supabase.from('campaigns').select('id').eq('id', input.campaignId).eq('workspace_id', workspace.workspaceId).maybeSingle(),
      supabase.from('properties').select('id,name').eq('id', targetId).eq('workspace_id', workspace.workspaceId).is('archived_at', null).maybeSingle()
    ]);
    if (!campaign || !property) return NextResponse.json({ ok: false, error: 'Campaign or target not found.' }, { status: 404 });

    const { data, error } = await supabase
      .from('campaign_targets')
      .upsert({ workspace_id: workspace.workspaceId, campaign_id: campaign.id, target_kind: 'property', target_id: property.id, status: 'queued', notes: cleanText(input.notes, 1000) || null, updated_at: new Date().toISOString() }, { onConflict: 'campaign_id,target_kind,target_id' })
      .select('id,status')
      .single();
    if (error || !data) return NextResponse.json({ ok: false, error: error?.message || 'Could not attach target.' }, { status: 500 });
    return NextResponse.json({ ok: true, campaignTarget: data });
  }

  const { data: existing } = await supabase.from('campaign_targets').select('id').eq('id', input.campaignTargetId).eq('workspace_id', workspace.workspaceId).maybeSingle();
  if (!existing) return NextResponse.json({ ok: false, error: 'Campaign target not found.' }, { status: 404 });
  const update: Record<string, unknown> = { status: input.status, updated_at: new Date().toISOString() };
  if (input.notes !== undefined) update.notes = cleanText(input.notes, 1000) || null;
  const { data, error } = await supabase.from('campaign_targets').update(update).eq('id', existing.id).select('id,status,notes').single();
  if (error || !data) return NextResponse.json({ ok: false, error: error?.message || 'Could not update target.' }, { status: 500 });
  return NextResponse.json({ ok: true, campaignTarget: data });
}
