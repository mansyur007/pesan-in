import { notFound } from 'next/navigation';
import { getMerchant, getMenu } from '@/lib/db/queries';
import RestoDetailClient from '@/components/buyer/RestoDetailClient';

export const dynamic = 'force-dynamic';

export default function RestoDetail({ params }) {
  const merchant = getMerchant(params.id);
  if (!merchant) notFound();
  const menu = getMenu(params.id);
  return <RestoDetailClient merchant={merchant} menu={menu} />;
}
