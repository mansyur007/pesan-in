// ---- Buyer flow: home, resto detail, cart, tracking, history, account ----
const DEMO_BUYER = { id: 'u_demo', full_name: 'Rina Pratiwi', email: 'rina@demo.test' };
const DEFAULT_ADDRESS = 'Kos Putri Melati, Jl. Cempaka Sari No.7';

function BackBar({ title, onBack, right }) {
  const { go } = useRouter();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
      <button onClick={onBack || (() => history.back())}
        className="grid h-9 w-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100" aria-label="Kembali">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <h1 className="flex-1 truncate text-base font-bold">{title}</h1>
      {right}
    </header>
  );
}

function QtyStepper({ qty, onAdd, onDec }) {
  if (!qty) {
    return (
      <button onClick={onAdd}
        className="rounded-lg border border-brand-500 px-4 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50">
        Tambah
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <button onClick={onDec} className="grid h-7 w-7 place-items-center rounded-md bg-brand-50 text-brand-600 ring-1 ring-brand-200 hover:bg-brand-100">−</button>
      <span className="w-4 text-center text-sm font-bold tabular-nums">{qty}</span>
      <button onClick={onAdd} className="grid h-7 w-7 place-items-center rounded-md bg-brand-500 text-white hover:bg-brand-600">+</button>
    </div>
  );
}

/* ===================== BUYER HOME ===================== */
function BuyerHome() {
  const { go } = useRouter();
  const { activeOrder, cartCount } = useCart();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null);
  const [view, setView] = useState('list');

  let merchants = DEMO_MERCHANTS;
  if (cat) merchants = merchants.filter((m) => m.cat === cat);
  if (q.trim()) {
    const s = q.toLowerCase();
    merchants = merchants.filter((m) => m.name.toLowerCase().includes(s) || m.tags.join(' ').toLowerCase().includes(s));
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white">
        <div className="mx-auto max-w-4xl px-4 pt-3">
          <button onClick={() => go('/account')} className="flex items-center gap-1.5 text-left">
            <span className="text-brand-500">📍</span>
            <span className="text-xs text-slate-500">Antar ke</span>
            <span className="max-w-[200px] truncate text-xs font-bold text-slate-800">{DEFAULT_ADDRESS}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari warung atau menu di Gunungpati"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          {/* Categories */}
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((c) => {
              const on = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(on ? null : c.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                  <span>{c.emoji}</span>{c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-4">
        {/* Active order banner */}
        {activeOrder && activeOrder.status !== 'delivered' && (
          <button onClick={() => go('/order')}
            className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-3 text-left">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
            </span>
            <div className="flex-1">
              <div className="text-xs font-bold text-brand-700">Pesanan sedang diproses</div>
              <div className="text-[11px] text-brand-600/80">{STATUS_LABEL[activeOrder.status]} · {activeOrder.merchant.name}</div>
            </div>
            <span className="text-xs font-bold text-brand-600">Lacak ›</span>
          </button>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">{cat || q ? `Hasil (${merchants.length})` : 'Warung di sekitarmu'}</h2>
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button onClick={() => setView('list')} className={`rounded-md px-2.5 py-1 ${view === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>List</button>
            <button onClick={() => setView('map')} className={`rounded-md px-2.5 py-1 ${view === 'map' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>Peta</button>
          </div>
        </div>

        {view === 'map' ? (
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <GunungpatiMap merchants={merchants} height={360} />
          </div>
        ) : (
          <ul className="space-y-3">
            {merchants.map((m) => (
              <li key={m.id}>
                <button onClick={() => m.is_open && go(`/resto?id=${m.id}`)} disabled={!m.is_open}
                  className={`flex w-full gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-100 transition ${m.is_open ? 'hover:ring-brand-200' : 'opacity-70'}`}>
                  <FoodThumb label={m.cat} accent={m.accent} className="h-20 w-20 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-bold">{m.name}</h3>
                      {!m.is_open && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Tutup</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Stars rating={m.rating} count={m.ratingCount} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      <span>🛵 {m.distance}</span><span>·</span><span>⏱ {m.eta} mnt</span><span>·</span>
                      <span className="truncate">{m.tags.join(' · ')}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {merchants.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Tidak ada warung yang cocok.</p>}
          </ul>
        )}
      </main>

      {cartCount() > 0 && <CartFab />}
      <BuyerTabBar />
    </div>
  );
}

function CartFab() {
  const { go } = useRouter();
  const { cartCount, subtotal } = useCart();
  return (
    <div className="fixed inset-x-0 bottom-[60px] z-30 px-4">
      <button onClick={() => go('/cart')}
        className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-2xl bg-brand-500 px-5 py-3.5 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600">
        <span className="flex items-center gap-2 text-sm font-bold">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-xs">{cartCount()}</span>
          Lihat Keranjang
        </span>
        <span className="text-sm font-bold">{fmtRp(subtotal())}</span>
      </button>
    </div>
  );
}

/* ===================== RESTO DETAIL ===================== */
function RestoDetail() {
  const { route, go } = useRouter();
  const { addItem, decItem, qtyOf, cartCount, subtotal, cart } = useCart();
  const m = DEMO_MERCHANTS.find((x) => x.id === route.query.id) || DEMO_MERCHANTS[0];
  const menu = DEMO_MENU[m.id] || [];
  const popular = menu.filter((x) => x.popular);
  const rest = menu.filter((x) => !x.popular);

  const Row = (item) => (
    <li key={item.id} className="flex gap-3 py-4">
      <FoodThumb label="menu" accent={m.accent} className={`h-16 w-16 shrink-0 rounded-xl ${!item.is_available ? 'grayscale' : ''}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{item.name}</h4>
          {item.popular && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Populer</span>}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.desc}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold">{fmtRp(item.price)}</span>
          {item.is_available
            ? <QtyStepper qty={qtyOf(item.id)} onAdd={() => addItem(m.id, item.id)} onDec={() => decItem(item.id)} />
            : <span className="text-xs font-semibold text-slate-400">Habis</span>}
        </div>
      </div>
    </li>
  );

  const showBar = cartCount() > 0;
  return (
    <div className="min-h-screen bg-white pb-28">
      <BackBar title={m.name} onBack={() => go('/buyer')} />
      <FoodThumb label={`banner · ${m.name}`} accent={m.accent} className="h-40 w-full" />
      <div className="mx-auto max-w-4xl px-4">
        <div className="border-b border-slate-100 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold">{m.name}</h1>
              <p className="mt-0.5 text-xs text-slate-500">{m.address}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${m.is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{m.is_open ? 'Buka' : 'Tutup'}</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
            <Stars rating={m.rating} count={m.ratingCount} />
            <span>🛵 {m.distance}</span>
            <span>⏱ {m.eta} mnt</span>
          </div>
        </div>

        {popular.length > 0 && (
          <section>
            <h3 className="pt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Paling laris</h3>
            <ul className="divide-y divide-slate-100">{popular.map(Row)}</ul>
          </section>
        )}
        <section>
          <h3 className="pt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Menu lainnya</h3>
          <ul className="divide-y divide-slate-100">{rest.map(Row)}</ul>
        </section>
      </div>

      {showBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white p-4">
          <button onClick={() => go('/cart')}
            className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-2xl bg-brand-500 px-5 py-3.5 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600">
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-xs">{cartCount()}</span>
              Lihat Keranjang
            </span>
            <span className="text-sm font-bold">{fmtRp(subtotal())}</span>
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { BuyerHome, RestoDetail, DEMO_BUYER, DEFAULT_ADDRESS, BackBar });
