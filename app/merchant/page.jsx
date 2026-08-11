import { getCurrentUser } from '@/lib/auth/session';
import { getMerchantByOwner, getMerchantOrders } from '@/lib/db/queries';
import MerchantShell from '@/components/merchant/MerchantShell';
import MerchantOrders from '@/components/merchant/MerchantOrders';
import NoStore from '@/components/merchant/NoStore';

export const dynamic = 'force-dynamic';

export default async function MerchantOrdersPage() {
  const user = await getCurrentUser();
  const merchant = getMerchantByOwner(user?.id);

  if (!merchant) {
    return (
      <MerchantShell title="Pesanan">
        <NoStore />
      </MerchantShell>
    );
  }

  const orders = getMerchantOrders(merchant.id);
  const newCount = orders.filter((o) => o.status === 'paid').length;

  return (
    <MerchantShell title="Pesanan" subtitle={merchant.name} newCount={newCount}>
      <MerchantOrders orders={orders} />
    </MerchantShell>
  );
}
