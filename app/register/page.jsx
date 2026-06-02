'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, Field } from '@/components/auth/AuthShell';

const ROLES = [
  { id: 'buyer',    label: 'Pembeli',  emoji: '🛒' },
  { id: 'merchant', label: 'Merchant', emoji: '🍔' },
  { id: 'driver',   label: 'Driver',   emoji: '🏍️' },
];

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = ROLES.find((r) => r.id === params.get('role'))?.id || 'buyer';

  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const q = params.get('role');
    if (q && ROLES.some((r) => r.id === q)) setRole(q);
  }, [params]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();
    const { data, error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, full_name: fullName } },
    });
    if (signErr) {
      setError(signErr.message);
      setLoading(false);
      return;
    }

    if (data.user && phone) {
      await supabase.from('profiles').update({ phone }).eq('id', data.user.id);
    }

    if (!data.session) {
      setInfo('Cek email untuk verifikasi akun sebelum login.');
      setLoading(false);
      return;
    }

    router.push(role === 'merchant' ? '/merchant' : role === 'driver' ? '/driver' : '/buyer');
  }

  return (
    <AuthShell title="Daftar Pesanin">
      <div className="mb-5 grid grid-cols-3 gap-2">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={`rounded-xl border p-3 text-center text-sm font-semibold transition ${
              role === r.id
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="text-xl">{r.emoji}</div>
            <div className="mt-1">{r.label}</div>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nama lengkap" value={fullName} onChange={setFullName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Nomor HP" type="tel" value={phone} onChange={setPhone} placeholder="08xx" />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-emerald-700">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? 'Memproses…' : `Daftar sebagai ${ROLES.find((r) => r.id === role).label}`}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">Masuk</Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
