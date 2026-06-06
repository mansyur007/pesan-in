import { notFound } from 'next/navigation';
import { getOrder } from '@/lib/db/queries';
import OrderTrackingClient from '@/components/buyer/OrderTrackingClient';

export const dynamic = 'force-dynamic';

export default function OrderTrackingPage({ params }) {
  const order = getOrder(params.id);
  if (!order) notFound();
  return <OrderTrackingClient initialOrder={order} />;
}
