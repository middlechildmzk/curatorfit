import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const schema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional().nullable(),
  role: z.enum(['artist', 'curator', 'admin']).default('artist'),
  displayName: z.string().optional().nullable()
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo', message: 'Profile validated. Add Supabase service key to save.' });

  const payload = {
    id: parsed.data.id,
    email: parsed.data.email,
    role: parsed.data.role,
    display_name: parsed.data.displayName || parsed.data.email?.split('@')[0] || 'CuratorFit user',
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, profile: data });
}
