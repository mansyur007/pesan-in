import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getOrder, canViewOrder } from '@/lib/db/queries';
import OrderTrackingClient from '@/components/buyer/OrderTrackingClient';

export const dynamic = 'force-dynamic';

export default async function OrderTrackingPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/orders/${params.id}`);

  const order = getOrder(params.id);
  // Pesanan orang lain diperlakukan seperti tidak ada, supaya id pesanan
  // tidak bisa dipakai untuk menebak-nebak keberadaan order.
  if (!order || !canViewOrder(order, user)) notFound();

  return <OrderTrackingClient initialOrder={order} />;
}
