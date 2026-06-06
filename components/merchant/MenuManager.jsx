'use client';

import { useState } from 'react';
import { fmtRp } from '@/lib/format';

async function api(payload) {
  const res = await fetch('/api/merchant', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

function MenuRow({ item, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [description, setDescription] = useState(item.description || '');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const data = await api({ action: 'menu-update', itemId: item.id, name, price, description });
    setBusy(false);
    if (!data.ok) return alert(data.error || 'Gagal menyimpan.');
    setEditing(false);
    onChanged();
  }
  async function toggle(field) {
    const data = await api({ action: 'menu-update', itemId: item.id, [field]: !item[field] });
    if (!data.ok) return alert(data.error);
    onChanged();
  }
  async function remove() {
    if (!confirm(`Hapus "${item.name}"?`)) return;
    const data = await api({ action: 'menu-delete', itemId: item.id });
    if (!data.ok) return alert(data.error);
    onChanged();
  }

  if (editing) {
    return (
      <li className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-brand-200">
        <div className="space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama menu"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Harga"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi (opsional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <div className="flex gap-2">
            <button onClick={save} disabled={busy} className="flex-1 rounded-lg bg-brand-500 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
              {busy ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Batal</button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{item.name}</span>
            {!!item.popular && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Populer</span>}
          </div>
          <div className="text-xs text-slate-500">{fmtRp(item.price)}</div>
          {item.description && <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">{item.description}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {item.is_available ? 'Tersedia' : 'Habis'}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
        <button onClick={() => toggle('is_available')} className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50">
          {item.is_available ? 'Tandai Habis' : 'Tandai Tersedia'}
        </button>
        <button onClick={() => toggle('popular')} className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50">
          {item.popular ? 'Hapus Populer' : 'Jadikan Populer'}
        </button>
        <button onClick={() => setEditing(true)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50">Edit</button>
        <button onClick={remove} className="rounded-lg border border-red-100 px-2.5 py-1 text-red-500 hover:bg-red-50">Hapus</button>
      </div>
    </li>
  );
}

export default function MenuManager({ menu, isOpen }) {
  const [items, setItems] = useState(menu);
  const [open, setOpen] = useState(isOpen);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    // Ambil ulang dari server via refresh ringan: panggil endpoint? gunakan router refresh.
    // Sederhana: reload daftar dari /api tidak ada GET menu, jadi update optimistik via state.
    window.location.reload();
  }

  async function addItem(e) {
    e.preventDefault();
    setBusy(true);
    const data = await api({ action: 'menu-create', name, price, description });
    setBusy(false);
    if (!data.ok) return alert(data.error || 'Gagal menambah menu.');
    setItems((arr) => [...arr, { ...data.item }]);
    setName(''); setPrice(''); setDescription(''); setAdding(false);
  }

  async function toggleStore() {
    const next = !open;
    setOpen(next);
    const data = await api({ action: 'store-toggle', is_open: next });
    if (!data.ok) setOpen(!next);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div>
          <div className="text-sm font-bold">Status Toko</div>
          <div className="text-xs text-slate-500">{open ? 'Sedang menerima pesanan' : 'Tutup — pesanan dimatikan'}</div>
        </div>
        <button
          onClick={toggleStore}
          className={`relative h-7 w-12 rounded-full transition ${open ? 'bg-emerald-500' : 'bg-slate-300'}`}
          aria-label="Toggle buka tutup toko"
        >
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${open ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Menu ({items.length})</h3>
        <button onClick={() => setAdding((a) => !a)} className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600">
          {adding ? 'Tutup' : '+ Tambah Menu'}
        </button>
      </div>

      {adding && (
        <form onSubmit={addItem} className="mb-3 space-y-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-brand-200">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama menu" required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Harga (Rp)" required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi (opsional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <button type="submit" disabled={busy} className="w-full rounded-lg bg-brand-500 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
            {busy ? 'Menambahkan…' : 'Tambah ke Menu'}
          </button>
        </form>
      )}

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((m) => (
          <MenuRow key={m.id} item={m} onChanged={refresh} />
        ))}
      </ul>
      {items.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Belum ada menu. Tambah menu pertamamu.</p>}
    </div>
  );
}
