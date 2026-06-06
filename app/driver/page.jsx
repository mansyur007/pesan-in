import { getCurrentUser } from '@/lib/auth/session';
import { getDriverFeed } from '@/lib/db/queries';
import TopBar from '@/components/layout/TopBar';
import DriverOrdersList from '@/components/driver/DriverOrdersList';

export const dynamic = 'force-dynamic';

export default async function DriverDashboard() {
  const user = await getCurrentUser();
  const { available, mine } = user ? getDriverFeed(user.id) : { available: [], mine: [] };

  return (
    <>
      <TopBar user={user} title="Driver" />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold">Dashboard Driver</h1>
          <p className="text-sm text-slate-600">Ambil pesanan di sekitar Gunungpati.</p>
        </header>
        <DriverOrdersList available={available} mine={mine} />
      </main>
    </>
  );
}
