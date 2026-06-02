import { getCurrentUser } from '@/lib/auth/session';
import { isDemoMode } from '@/lib/auth/demo';
import { DEMO_ORDERS } from '@/lib/data/demo-db';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/layout/TopBar';
import DriverOrdersList from '@/components/driver/DriverOrdersList';

export default async function DriverDashboard() {
  const user = await getCurrentUser();

  let available = [];
  let mine = [];

  if (isDemoMode()) {
    available = DEMO_ORDERS.filter((o) => !o.driver_id);
    mine = DEMO_ORDERS.filter((o) => o.driver_id === user.id);
  } else {
    const supabase = createClient();
    const { data: av } = await supabase
      .from('orders').select('id, subtotal, delivery_fee, total, delivery_address, status, created_at')
      .is('driver_id', null)
      .in('status', ['paid', 'accepted_merchant', 'ready_for_pickup'])
      .order('created_at', { ascending: true });
    available = av ?? [];
    const { data: m } = await supabase
      .from('orders').select('id, delivery_fee, total, status, delivery_address, created_at')
      .eq('driver_id', user.id)
      .in('status', ['picked_up', 'ready_for_pickup', 'accepted_merchant', 'paid'])
      .order('created_at', { ascending: false });
    mine = m ?? [];
  }

  return (
    <>
      <TopBar user={user} title="Driver" />
      <main className="mx-auto max-w-4xl px-4 py-6">
        {isDemoMode() && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <b>Demo mode.</b> Tombol "Ambil" / "Selesai" simulasi saja sampai Supabase dikonfigurasi.
          </div>
        )}

        <header className="mb-6">
          <h1 className="text-2xl font-extrabold">Dashboard Driver</h1>
          <p className="text-sm text-slate-600">Ambil pesanan di sekitar Gunungpati.</p>
        </header>

        <DriverOrdersList available={available} mine={mine} demo={isDemoMode()} />
      </main>
    </>
  );
}
