import { getCurrentUser } from '@/lib/auth/session';
import { listMerchants, getCategories, getActiveOrderForBuyer } from '@/lib/db/queries';
import BuyerHomeClient from '@/components/buyer/BuyerHomeClient';

export const dynamic = 'force-dynamic';

export default async function BuyerHome() {
  const user = await getCurrentUser();
  const merchants = listMerchants();
  const categories = getCategories();
  const activeOrder = user ? getActiveOrderForBuyer(user.id) : null;

  return (
    <BuyerHomeClient
      merchants={merchants}
      categories={categories}
      activeOrder={activeOrder}
      address={user?.address || 'Atur alamat pengantaran'}
    />
  );
}
