import type { SupabaseClient } from '@supabase/supabase-js';

export type WorkspaceContext = {
  workspaceId: string;
  role: string;
};

export async function getWorkspaceContext(supabase: SupabaseClient, userId: string): Promise<WorkspaceContext | null> {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace_id,role')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.workspace_id) return null;
  return { workspaceId: data.workspace_id, role: String(data.role || 'viewer') };
}

export async function ensureWorkspaceForUser(
  supabase: SupabaseClient,
  input: {
    userId: string;
    email?: string | null;
    displayName?: string | null;
    includeArtist?: boolean;
    artistName?: string | null;
  }
): Promise<WorkspaceContext | null> {
  const existing = await getWorkspaceContext(supabase, input.userId);
  if (existing) {
    await supabase.from('profiles').update({ current_workspace_id: existing.workspaceId }).eq('id', input.userId);
    if (input.includeArtist && input.artistName) await findOrCreateArtist(supabase, existing.workspaceId, input.artistName);
    return existing;
  }

  const identity = String(input.displayName || input.email?.split('@')[0] || 'ArtistOS member').trim();
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({ name: `${identity} / ArtistOS` })
    .select('id')
    .single();
  if (workspaceError || !workspace?.id) return null;

  const { error: membershipError } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: workspace.id, user_id: input.userId, role: 'owner' });
  if (membershipError) {
    await supabase.from('workspaces').delete().eq('id', workspace.id);
    return null;
  }

  await supabase.from('profiles').update({ current_workspace_id: workspace.id }).eq('id', input.userId);
  if (input.includeArtist) await findOrCreateArtist(supabase, workspace.id, input.artistName || identity);

  return { workspaceId: workspace.id, role: 'owner' };
}

export function canManageWorkspace(role: string) {
  return ['owner', 'admin', 'editor'].includes(role);
}

export async function findOrCreateArtist(
  supabase: SupabaseClient,
  workspaceId: string,
  artistName: string
): Promise<{ id: string; name: string } | null> {
  const normalizedName = artistName.trim();
  if (!normalizedName) return null;

  const { data: existing } = await supabase
    .from('artists')
    .select('id,name')
    .eq('workspace_id', workspaceId)
    .ilike('name', normalizedName)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing;

  const { data, error } = await supabase
    .from('artists')
    .insert({ workspace_id: workspaceId, name: normalizedName })
    .select('id,name')
    .single();

  if (error || !data) return null;
  return data;
}
