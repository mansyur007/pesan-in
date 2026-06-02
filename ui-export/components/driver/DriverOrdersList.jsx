'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { settleOrder } from '@/lib/web3/escrow';

export default function DriverOrdersList({ available, mine, demo = false }) {
  const [state, setState] = useState({ available, mine, busy: null });

  async function acceptOrder(id) {
    setState((s) => ({ ...s, busy: id }));
    const order = state.available.find((o) => o.id === id);

    if (demo) {
      await new Promise((r) => setTimeout(r, 400));
      setState({
        available: state.available.filter((o) => o.id !== id),
        mine: [{ ...order, status: 'picked_up' }, ...state.mine],
        busy: null,
      });
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('orders').update({ driver_id: user.id, status: 'picked_up' })
      .eq('id', id);
    if (!error) {
      setState({
        available: state.available.filter((o) => o.id !== id),
        mine: [{ ...order, status: 'picked_up' }, ...state.mine],
        busy: null,
      });
    } else {
      setState((s) => ({ ...s, busy: null }));
      alert(error.message);
    }
  }

  async function completeOrder(id) {
    setState((s) => ({ ...s, busy: id }));
    try {
      const txHash = await settleOrder(id);

      if (demo) {
        await new Promise((r) => setTimeout(r, 400));
        alert(`Demo: dana didistribusi.\nTx hash (mock): ${txHash.slice(0, 22)}…`);
        setState({
          available: state.available,
          mine: state.mine.filter((o) => o.id !== id),
          busy: null,
        });
        return;
      }

      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status: 'delivered', tx_hash_settlement: txHash })
        .eq('id', id);
      if (error) throw error;
      setState({
        available: state.available,
        mine: state.mine.filter((o) => o.id !== id),
        busy: null,
      });
    } catch (e) {
      setState((s) => ({ ...s, busy: null }));
      alert(e.message);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-bold">Pesanan Tersedia ({state.available.length})</h2>
        {state.available.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada pesanan tersedia.</p>
        ) : (
          <ul className="space-y-2">
            {state.available.map((o) => (
              <li key={o.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">#{o.id.slice(0, 8)}</div>
                    <div className="mt-1 text-xs text-slate-600">{o.delivery_address}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-700">
                      +Rp{Number(o.delivery_fee).toLocaleString('id-ID')}
                    </div>
                    <button
                      disabled={state.busy === o.id}
                      onClick={() => acceptOrder(o.id)}
                      className="mt-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {state.busy === o.id ? '…' : 'Ambil'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Pesanan Saya ({state.mine.length})</h2>
        {state.mine.length === 0 ? (
          <p className="text-sm text-slate-500">Tidak ada pesanan aktif.</p>
        ) : (
          <ul className="space-y-2">
            {state.mine.map((o) => (
              <li key={o.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">#{o.id.slice(0, 8)}</div>
                    <div className="mt-1 text-xs text-slate-600">{o.delivery_address}</div>
                    <div className="mt-1 text-xs text-brand-600">{o.status}</div>
                  </div>
                  <button
                    disabled={state.busy === o.id}
                    onClick={() => completeOrder(o.id)}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {state.busy === o.id ? 'Menyelesaikan…' : 'Tandai Selesai'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
