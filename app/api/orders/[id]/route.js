import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getOrder } from '@/lib/db/queries';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Belum login.' }, { status: 401 });
  const order = getOrder(params.id);
  if (!order) return NextResponse.json({ ok: false, error: 'Tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}
