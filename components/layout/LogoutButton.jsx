'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const IS_DEMO =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    if (IS_DEMO) {
      await fetch('/api/demo-auth', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } else {
      await createClient().auth.signOut();
    }
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
    >
      Keluar
    </button>
  );
}
