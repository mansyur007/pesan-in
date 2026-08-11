import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getMerchant, getMerchantByOwner, getMenu } from '@/lib/db/queries';
import {
  createOrder,
  advanceOrderStatus,
  rejectOrder,
  driverAccept,
  driverComplete,
} from '@/lib/db/queries';
import { DELIVERY_FEE, GAS_FEE } from '@/lib/db/schema';

export const runtime = 'nodejs';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Belum login.' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
  const { action } = body;

  // ---- Buyer: buat pesanan ----
  if (action === 'create') {
    const { merchantId, items, address, note } = body;
    const merchant = getMerchant(merchantId);
    if (!merchant) return NextResponse.json({ ok: false, error: 'Merchant tidak ditemukan.' }, { status: 404 });
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'Keranjang kosong.' }, { status: 400 });
    }
    if (!address) return NextResponse.json({ ok: false, error: 'Alamat wajib diisi.' }, { status: 400 });

    // Validasi harga terhadap menu di DB (jangan percaya harga dari client).
    const menu = getMenu(merchantId);
    const lines = [];
    for (const it of items) {
      const found = menu.find((m) => m.id === it.id);
      if (!found || !found.is_available) {
        return NextResponse.json({ ok: false, error: `Menu tidak tersedia: ${it.name || it.id}` }, { status: 400 });
      }
      const qty = Math.max(1, parseInt(it.qty, 10) || 1);
      lines.push({ name: found.name, qty, price: found.price });
    }

    const order = createOrder({
      buyerId: user.id,
      merchantId,
      lines,
      deliveryFee: DELIVERY_FEE,
      gasFee: GAS_FEE,
      address,
      note,
    });
    return NextResponse.json({ ok: true, order });
  }

  // ---- Merchant: majukan status ----
  if (action === 'merchant-advance') {
    if (user.role !== 'merchant') return NextResponse.json({ ok: false, error: 'Bukan merchant.' }, { status: 403 });
    const merchant = getMerchantByOwner(user.id);
    if (!merchant) return NextResponse.json({ ok: false, error: 'Toko tidak ditemukan.' }, { status: 404 });
    const { orderId, status } = body;
    if (!['accepted_merchant', 'ready_for_pickup'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Status tidak valid.' }, { status: 400 });
    }
    const result = advanceOrderStatus(orderId, status, { merchantId: merchant.id });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  // ---- Merchant: tolak pesanan ----
  if (action === 'merchant-reject') {
    if (user.role !== 'merchant') return NextResponse.json({ ok: false, error: 'Bukan merchant.' }, { status: 403 });
    const merchant = getMerchantByOwner(user.id);
    if (!merchant) return NextResponse.json({ ok: false, error: 'Toko tidak ditemukan.' }, { status: 404 });
    const result = rejectOrder(body.orderId, merchant.id);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  // ---- Driver: ambil pesanan ----
  if (action === 'driver-accept') {
    if (user.role !== 'driver') return NextResponse.json({ ok: false, error: 'Bukan driver.' }, { status: 403 });
    const result = driverAccept(body.orderId, user.id);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  // ---- Driver: selesaikan pesanan (settle on-chain mock) ----
  if (action === 'driver-complete') {
    if (user.role !== 'driver') return NextResponse.json({ ok: false, error: 'Bukan driver.' }, { status: 403 });
    const result = driverComplete(body.orderId, user.id);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}
