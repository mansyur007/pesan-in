import { getCurrentUser } from '@/lib/auth/session';
import { getMerchantByOwner, getMenu, countNewOrders } from '@/lib/db/queries';
import MerchantShell from '@/components/merchant/MerchantShell';
import MenuManager from '@/components/merchant/MenuManager';
import NoStore from '@/components/merchant/NoStore';

export const dynamic = 'force-dynamic';

export default async function MerchantMenuPage() {
  const user = await getCurrentUser();
  const merchant = getMerchantByOwner(user?.id);

  if (!merchant) {
    return (
      <MerchantShell title="Menu">
        <NoStore />
      </MerchantShell>
    );
  }

  const menu = getMenu(merchant.id);
  const available = menu.filter((m) => m.is_available).length;

  return (
    <MerchantShell
      title="Menu"
      subtitle={menu.length ? `${available} dari ${menu.length} item tersedia` : 'Belum ada item'}
      newCount={countNewOrders(merchant.id)}
    >
      <MenuManager menu={menu} accent={merchant.accent} />
    </MerchantShell>
  );
}
