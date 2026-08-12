import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getVapidKeys } from '@/lib/push/vapid';
import { saveSubscription, removeSubscription } from '@/lib/db/push';

export const runtime = 'nodejs';

// Kunci publik VAPID — aman diekspos ke client, dipakai pushManager.subscribe().
export async function GET() {
  const { publicKey } = getVapidKeys();
  return NextResponse.json({ ok: true, publicKey });
}

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

  if (action === 'subscribe') {
    const sub = body.subscription;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ ok: false, error: 'Subscription tidak valid.' }, { status: 400 });
    }
    saveSubscription(user.id, sub);
    return NextResponse.json({ ok: true });
  }

  if (action === 'unsubscribe') {
    if (body.endpoint) removeSubscription(body.endpoint, user.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}
