import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { orderParticipant, listMessages, addMessage } from '@/lib/db/queries';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Belum login.' }, { status: 401 });
  const role = orderParticipant(params.id, user.id);
  if (!role) return NextResponse.json({ ok: false, error: 'Tidak punya akses.' }, { status: 403 });
  return NextResponse.json({ ok: true, role, messages: listMessages(params.id) });
}

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Belum login.' }, { status: 401 });
  const role = orderParticipant(params.id, user.id);
  if (!role) return NextResponse.json({ ok: false, error: 'Tidak punya akses.' }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
  const text = String(body.body || '').trim();
  if (!text) return NextResponse.json({ ok: false, error: 'Pesan kosong.' }, { status: 400 });

  const message = addMessage(params.id, user.id, role, text);
  return NextResponse.json({ ok: true, message });
}
