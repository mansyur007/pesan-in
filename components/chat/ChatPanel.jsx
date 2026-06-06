'use client';

import { useEffect, useRef, useState } from 'react';

// Chat in-app berbasis polling untuk satu pesanan.
// myRole: 'buyer' | 'driver' — menentukan sisi gelembung pesan.
export default function ChatPanel({ orderId, myRole, peerName = 'Lawan bicara', peerAvatar = '💬', onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  async function load() {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, { cache: 'no-store' });
      const data = await res.json();
      if (data.ok) setMessages(data.messages);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [orderId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText('');
    const res = await fetch(`/api/orders/${orderId}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    if (data.ok) setMessages((m) => [...m, data.message]);
    else setText(body);
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[70vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-xl">{peerAvatar}</div>
          <div className="flex-1">
            <div className="text-sm font-bold">{peerName}</div>
            <div className="text-[11px] text-emerald-600">● Online</div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100">✕</button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-4 py-4">
          {messages.length === 0 && (
            <p className="py-10 text-center text-xs text-slate-400">Belum ada pesan. Sapa duluan 👋</p>
          )}
          {messages.map((m) => {
            const mine = m.sender_role === myRole;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'rounded-br-sm bg-brand-500 text-white' : 'rounded-bl-sm bg-white text-slate-800 ring-1 ring-slate-200'}`}>
                  {m.body}
                  <div className={`mt-0.5 text-[10px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                    {new Date(m.created_at.replace(' ', 'T')).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pesan…"
            className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40"
            aria-label="Kirim"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
