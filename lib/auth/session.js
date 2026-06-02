import { cookies } from 'next/headers';
import { DEMO_COOKIE, decodeSession, isDemoMode } from './demo';
import { createClient as createSupabaseServer } from '@/lib/supabase/server';

// Baca session user saat ini. Support demo mode + Supabase mode.
// Return: { id, email, role, full_name } atau null.
export async function getCurrentUser() {
  if (isDemoMode()) {
    const raw = cookies().get(DEMO_COOKIE)?.value;
    if (!raw) return null;
    return decodeSession(raw);
  }

  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();

  return {
    id: user.id,
    email: user.email,
    role: profile?.role ?? 'buyer',
    full_name: profile?.full_name ?? user.email,
  };
}
