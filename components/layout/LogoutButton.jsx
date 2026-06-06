'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton({ className }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className={
        className ||
        'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50'
      }
    >
      Keluar
    </button>
  );
}
