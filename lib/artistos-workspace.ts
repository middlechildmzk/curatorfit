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

export function canManageWorkspace(role: string) {
  return ['owner', 'admin', 'editor'].includes(role);
}

export async function findOrCreateArtist(
  supabase: SupabaseClient,
  workspaceId: string,
  artistName: string
): Promise<{ id: string; name: string } | null> {
  const { data: existing } = await supabase
    .from('artists')
    .select('id,name')
    .eq('workspace_id', workspaceId)
    .ilike('name', artistName)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing;

  const { data, error } = await supabase
    .from('artists')
    .insert({ workspace_id: workspaceId, name: artistName })
    .select('id,name')
    .single();

  if (error || !data) return null;
  return data;
}
