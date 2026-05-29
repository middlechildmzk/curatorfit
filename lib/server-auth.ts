import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type AuthResult = {
  user: { id: string; email?: string | null };
  profile: { id: string; role: string; email?: string | null; display_name?: string | null } | null;
};

export function getBearerToken(request: Request) {
  const header = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  return header.slice(7).trim();
}

export async function getRequestUser(request: Request): Promise<AuthResult | null> {
  const supabase = getSupabaseAdmin();
  const token = getBearerToken(request);
  if (!supabase || !token) return null;
  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,email,display_name,role')
    .eq('id', userData.user.id)
    .maybeSingle();

  return { user: { id: userData.user.id, email: userData.user.email }, profile };
}

export async function requireAdmin(request: Request) {
  const auth = await getRequestUser(request);
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const email = auth?.user.email?.toLowerCase() || auth?.profile?.email?.toLowerCase() || '';
  const isAdmin = auth?.profile?.role === 'admin' || (email && adminEmails.includes(email));

  if (!auth || !isAdmin) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: 'Admin access required.' }, { status: 403 })
    };
  }

  return { ok: true as const, auth };
}

export function cleanText(value: unknown, maxLength = 2000) {
  return String(value || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}
