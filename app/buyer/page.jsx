import dynamic from 'next/dynamic';
import { getCurrentUser } from '@/lib/auth/session';
import { isDemoMode } from '@/lib/auth/demo';
import { DEMO_MERCHANTS } from '@/lib/data/demo-db';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/layout/TopBar';

const GunungpatiMap = dynamic(() => import('@/components/maps/GunungpatiMap'), { ssr: false });

export default async function BuyerHome() {
  const user = await getCurrentUser();

  let merchants = [];
  if (isDemoMode()) {
    merchants = DEMO_MERCHANTS;
  } else {
    const supabase = createClient();
    const { data } = await supabase
      .from('merchants').select('id, name, address, latitude, longitude, is_open').limit(50);
    merchants = data ?? [];
  }

  return (
    <>
      <TopBar user={user} title="Pembeli" />
      <main className="mx-auto max-w-4xl px-4 py-6">
        {isDemoMode() && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <b>Demo mode.</b> Daftar merchant di bawah adalah contoh.
          </div>
        )}

        <header className="mb-6">
          <h1 className="text-2xl font-extrabold">Pesan Makanan</h1>
          <p className="text-sm text-slate-600">Area Gunungpati, Semarang</p>
        </header>

        <div className="mb-6 overflow-hidden rounded-2xl ring-1 ring-slate-200">
          <GunungpatiMap merchants={merchants} />
        </div>

        <section>
          <h2 className="mb-3 text-lg font-bold">Merchant Tersedia ({merchants.length})</h2>
          {merchants.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada merchant terdaftar.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {merchants.map((m) => (
                <li key={m.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{m.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.is_open ? 'Buka' : 'Tutup'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{m.address}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
