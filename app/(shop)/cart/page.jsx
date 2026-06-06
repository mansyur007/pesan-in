import { getCurrentUser } from '@/lib/auth/session';
import CartClient from '@/components/buyer/CartClient';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const user = await getCurrentUser();
  return <CartClient defaultAddress={user?.address || ''} />;
}
