'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FoodThumb from '@/components/ui/FoodThumb';
import { fmtRp } from '@/lib/format';

async function api(payload) {
  const res = await fetch('/api/merchant', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

function EditForm({ item, onCancel, onSaved }) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [description, setDescription] = useState(item.description || '');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const data = await api({ action: 'menu-update', itemId: item.id, name, price, description });
    setBusy(false);
    if (!data.ok) return alert(data.error || 'Gagal menyimpan.');
    onSaved();
  }

  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-200">
      <div className="space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama menu"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Harga"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi (opsional)"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
        <div className="flex gap-2">
          <button onClick={save} disabled={busy}
            className="flex-1 rounded-lg bg-brand-500 py-2 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50">
            {busy ? 'Menyimpan…' : 'Simpan'}
          </button>
          <button onClick={onCancel} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
            Batal
          </button>
        </div>
      </div>
    </li>
  );
}

function MenuRow({ item, accent, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const on = !!item.is_available;

  async function patch(field) {
    setBusy(true);
    const data = await api({ action: 'menu-update', itemId: item.id, [field]: !item[field] });
    setBusy(false);
    if (!data.ok) return alert(data.error);
    onChanged();
  }

  async function remove() {
    if (!confirm(`Hapus "${item.name}" dari menu?`)) return;
    setBusy(true);
    const data = await api({ action: 'menu-delete', itemId: item.id });
    setBusy(false);
    if (!data.ok) return alert(data.error);
    onChanged();
  }

  if (editing) {
    return <EditForm item={item} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); onChanged(); }} />;
  }

  return (
    <li className="border-b border-slate-100 p-3 last:border-0">
      <div className="flex items-center gap-3">
        <FoodThumb label="menu" accent={accent} className={`h-14 w-14 shrink-0 rounded-xl ${on ? '' : 'grayscale'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold">{item.name}</span>
            {!!item.popular && (
              <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Populer</span>
            )}
          </div>
          {item.description && <div className="truncate text-xs text-slate-500">{item.description}</div>}
          <div className="mt-0.5 text-sm font-bold text-slate-800">{fmtRp(item.price)}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button onClick={() => patch('is_available')} disabled={busy} aria-label={`Tandai ${item.name} ${on ? 'habis' : 'tersedia'}`}
            className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
          <span className={`text-[10px] font-bold ${on ? 'text-emerald-600' : 'text-slate-400'}`}>
            {on ? 'Tersedia' : 'Habis'}
          </span>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2 pl-[68px] text-[11px] font-semibold">
        <button onClick={() => patch('popular')} disabled={busy}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          {item.popular ? 'Hapus Populer' : 'Jadikan Populer'}
        </button>
        <button onClick={() => setEditing(true)}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50">
          Edit
        </button>
        <button onClick={remove} disabled={busy}
          className="rounded-lg border border-red-100 px-2.5 py-1 text-red-500 hover:bg-red-50 disabled:opacity-50">
          Hapus
        </button>
      </div>
    </li>
  );
}

export default function MenuManager({ menu, accent }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  // Server component halaman ini yang memegang data; refresh cukup minta render ulang.
  const refresh = () => router.refresh();

  async function addItem(e) {
    e.preventDefault();
    setBusy(true);
    const data = await api({ action: 'menu-create', name, price, description });
    setBusy(false);
    if (!data.ok) return alert(data.error || 'Gagal menambah menu.');
    setName(''); setPrice(''); setDescription(''); setAdding(false);
    refresh();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Daftar Menu</h2>
        <button onClick={() => setAdding((a) => !a)}
          className="rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-600">
          {adding ? 'Tutup' : '+ Tambah'}
        </button>
      </div>

      {adding && (
        <form onSubmit={addItem} className="mb-3 space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-200">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama menu" required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Harga (Rp)" required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi (opsional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <button type="submit" disabled={busy}
            className="w-full rounded-lg bg-brand-500 py-2 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50">
            {busy ? 'Menambahkan…' : 'Tambah ke Menu'}
          </button>
        </form>
      )}

      {menu.length === 0 ? (
        <div className="grid place-items-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-100">
          <div className="mb-2 text-4xl">🍽️</div>
          <p className="text-sm font-semibold text-slate-500">Belum ada menu</p>
          <p className="text-xs text-slate-400">Tambah menu pertamamu lewat tombol di atas.</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          {menu.map((m) => (
            <MenuRow key={m.id} item={m} accent={accent} onChanged={refresh} />
          ))}
        </ul>
      )}
    </div>
  );
}
