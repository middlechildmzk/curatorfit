import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/server-auth';

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: 'Supabase admin client is not configured.' }, { status: 500 });

  const [targetsResult, playlistsResult, claimsResult, applicationsResult, importsResult] = await Promise.all([
    supabase.from('promotion_targets').select('id,name,type,status,trust_score,risk_level,slug,created_at,source_url,last_reviewed_at,verification_notes,risk_notes,fit_notes,submission_rules').order('created_at', { ascending: false }).limit(100),
    supabase.from('playlists').select('id,name,status,trust_score,risk_level,slug,created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('target_claims').select('id,name,email,target_url,intent,status,created_at,admin_notes').order('created_at', { ascending: false }).limit(100),
    supabase.from('curator_applications').select('id,display_name,email,primary_url,channels,genres,status,created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('import_batches').select('id,file_name,row_count,status,created_at').order('created_at', { ascending: false }).limit(20)
  ]);

  return NextResponse.json({
    ok: true,
    targets: targetsResult.data || [],
    playlists: playlistsResult.data || [],
    claims: claimsResult.data || [],
    applications: applicationsResult.data || [],
    imports: importsResult.data || []
  });
}
