import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getMerchantByOwner } from '@/lib/db/queries';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  setMerchantOpen,
} from '@/lib/db/queries';

export const runtime = 'nodejs';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'merchant') {
    return NextResponse.json({ ok: false, error: 'Bukan merchant.' }, { status: 403 });
  }
  const merchant = getMerchantByOwner(user.id);
  if (!merchant) return NextResponse.json({ ok: false, error: 'Toko tidak ditemukan.' }, { status: 404 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
  const { action } = body;

  if (action === 'menu-create') {
    const name = String(body.name || '').trim();
    const price = parseInt(body.price, 10);
    if (!name || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ ok: false, error: 'Nama & harga wajib valid.' }, { status: 400 });
    }
    const item = createMenuItem(merchant.id, { name, price, description: body.description, popular: body.popular });
    return NextResponse.json({ ok: true, item });
  }

  if (action === 'menu-update') {
    const patch = {};
    if (body.name != null) patch.name = String(body.name).trim();
    if (body.price != null) patch.price = parseInt(body.price, 10);
    if (body.description != null) patch.description = body.description;
    if (body.popular != null) patch.popular = body.popular;
    if (body.is_available != null) patch.is_available = body.is_available;
    const result = updateMenuItem(merchant.id, body.itemId, patch);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === 'menu-delete') {
    const result = deleteMenuItem(merchant.id, body.itemId);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === 'store-toggle') {
    setMerchantOpen(merchant.id, !!body.is_open);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}
