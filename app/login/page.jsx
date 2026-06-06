'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthShell, Field } from '@/components/auth/AuthShell';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error || 'Login gagal.');
      setLoading(false);
      return;
    }
    router.push(params.get('next') || data.redirect);
    router.refresh();
  }

  function useDemo(role) {
    setEmail(`${role}@demo.test`);
    setPassword('demo123');
  }

  return (
    <AuthShell title="Masuk ke Pesan.in">
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">Akun demo (DB lokal)</p>
        <p className="mt-1">Klik untuk isi otomatis · password <code>demo123</code>:</p>
        <div className="mt-2 flex gap-2">
          {['merchant', 'buyer', 'driver'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => useDemo(r)}
              className="rounded-md bg-white px-2 py-1 font-medium text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Belum punya akun?{' '}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">Daftar</Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
