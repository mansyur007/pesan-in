// ---- Merchant app: Pesanan / Menu / Toko (GoBiz-style, separate pages) ----
const MERCHANT = DEMO_MERCHANTS[0]; // Warung Bu Sri

// Merchant order statuses + buyer-facing flow reused
const M_STATUS = {
  paid:              { label: 'Baru',       chip: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500' },
  accepted_merchant: { label: 'Dimasak',    chip: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
  ready_for_pickup:  { label: 'Siap',       chip: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-500' },
  picked_up:         { label: 'Diantar',    chip: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  delivered:         { label: 'Selesai',    chip: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400' },
};

function mMins(m) { return new Date(Date.now() - m * 60000).toISOString(); }

function seedMerchantOrders() {
  return [
    { id: 'o1', code: 'PSN-0607-A1B2', customer: 'Dewi A.',   items: [{ name: 'Nasi Rames Komplit', qty: 2, price: 13000 }, { name: 'Es Teh Manis', qty: 2, price: 4000 }], note: 'Sambal dipisah ya', address: 'Kos Putri Melati, Jl. Cempaka Sari', status: 'paid', created_at: mMins(2) },
    { id: 'o2', code: 'PSN-0607-C3D4', customer: 'Bagus P.',  items: [{ name: 'Soto Ayam Semarang', qty: 3, price: 14000 }], note: '', address: 'Gedung H FMIPA Unnes', status: 'paid', created_at: mMins(5) },
    { id: 'o3', code: 'PSN-0607-E5F6', customer: 'Sari M.',   items: [{ name: 'Nasi Rames Komplit', qty: 1, price: 13000 }, { name: 'Tempe & Tahu Bacem', qty: 2, price: 5000 }], note: 'Pedas level 2', address: 'Asrama Mahasiswa, Jl. Kalimasada', status: 'accepted_merchant', created_at: mMins(9) },
    { id: 'o4', code: 'PSN-0607-G7H8', customer: 'Andi R.',   items: [{ name: 'Soto Ayam Semarang', qty: 1, price: 14000 }, { name: 'Pecel Sayur', qty: 1, price: 10000 }], note: '', address: 'Kontrakan Biru, Jl. Patemon Raya', status: 'ready_for_pickup', created_at: mMins(14) },
    { id: 'o5', code: 'PSN-0607-J9K0', customer: 'Lina S.',   items: [{ name: 'Nasi Rames Komplit', qty: 2, price: 13000 }], note: '', address: 'Masjid Ulul Albab Unnes', status: 'picked_up', created_at: mMins(22) },
    { id: 'o6', code: 'PSN-0606-Z1X2', customer: 'Putri H.',  items: [{ name: 'Soto Ayam Semarang', qty: 2, price: 14000 }, { name: 'Es Teh Manis', qty: 2, price: 4000 }], note: '', address: 'Jl. Taman Siswa, Sekaran', status: 'delivered', created_at: mMins(180) },
    { id: 'o7', code: 'PSN-0606-Z3X4', customer: 'Rizal F.',  items: [{ name: 'Pecel Sayur', qty: 1, price: 10000 }], note: '', address: 'Jl. Kalisegoro', status: 'delivered', created_at: mMins(220) },
  ];
}

const MerchantCtx = React.createContext(null);
const useMerchant = () => React.useContext(MerchantCtx);

function MerchantProvider({ children }) {
  const [orders, setOrders] = useState(seedMerchantOrders);
  const [isOpen, setIsOpen] = useState(true);
  const [stock, setStock] = useState(() => {
    const s = {};
    (DEMO_MENU[MERCHANT.id] || []).forEach((m) => { s[m.id] = m.is_available; });
    return s;
  });
  const setStatus = (id, status) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
  const removeOrder = (id) => setOrders((os) => os.filter((o) => o.id !== id));
  const toggleStock = (id) => setStock((s) => ({ ...s, [id]: !s[id] }));
  const orderTotal = (o) => o.items.reduce((a, i) => a + i.price * i.qty, 0);
  return (
    <MerchantCtx.Provider value={{ orders, setStatus, removeOrder, isOpen, setIsOpen, stock, toggleStock, orderTotal }}>
      {children}
    </MerchantCtx.Provider>
  );
}

/* ---------- shared chrome ---------- */
function MerchantShell({ active, title, subtitle, children, headerRight }) {
  const { go } = useRouter();
  const { orders } = useMerchant();
  const newCount = orders.filter((o) => o.status === 'paid').length;
  const tabs = [
    { key: 'orders', path: '/merchant',       label: 'Pesanan', icon: '🧾', badge: newCount },
    { key: 'menu',   path: '/merchant/menu',  label: 'Menu',    icon: '🍽️' },
    { key: 'store',  path: '/merchant/store', label: 'Toko',    icon: '🏪' },
  ];
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-3.5 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl">
          {tabs.map((t) => {
            const on = active === t.key;
            return (
              <button key={t.key} onClick={() => go(t.path)}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${on ? 'text-brand-600' : 'text-slate-400'}`}>
                <span className={`text-lg leading-none ${on ? '' : 'grayscale opacity-70'}`}>{t.icon}</span>
                {t.label}
                {t.badge > 0 && <span className="absolute right-1/2 top-1.5 translate-x-3.5 rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white">{t.badge}</span>}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ============ PAGE 1: PESANAN ============ */
function MerchantOrders() {
  const { orders, setStatus, removeOrder, orderTotal } = useMerchant();
  const [tab, setTab] = useState('paid');
  const TABS = [
    { key: 'paid',              label: 'Baru' },
    { key: 'accepted_merchant', label: 'Diproses' },
    { key: 'ready_for_pickup',  label: 'Siap' },
    { key: 'done',              label: 'Selesai' },
  ];
  const count = (k) => k === 'done'
    ? orders.filter((o) => o.status === 'picked_up' || o.status === 'delivered').length
    : orders.filter((o) => o.status === k).length;
  const list = tab === 'done'
    ? orders.filter((o) => o.status === 'picked_up' || o.status === 'delivered')
    : orders.filter((o) => o.status === tab);
  const ago = (iso) => {
    const m = Math.round((Date.now() - new Date(iso)) / 60000);
    return m < 1 ? 'baru saja' : m < 60 ? `${m} mnt lalu` : `${Math.round(m / 60)} jam lalu`;
  };

  return (
    <MerchantShell active="orders" title="Pesanan" subtitle={MERCHANT.name}>
      {/* status tabs */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${on ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>
              {t.label}
              <span className={`rounded-full px-1.5 text-[10px] ${on ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>{count(t.key)}</span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="grid place-items-center py-20 text-center text-slate-400">
          <div className="mb-2 text-4xl">📭</div>
          <p className="text-sm font-semibold text-slate-500">Tidak ada pesanan di tab ini</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((o) => (
            <li key={o.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${M_STATUS[o.status].dot}`} />
                  <span className="font-mono text-xs font-semibold text-slate-700">{o.code}</span>
                </div>
                <span className="text-[11px] text-slate-400">{ago(o.created_at)}</span>
              </div>
              <div className="px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{o.customer}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${M_STATUS[o.status].chip}`}>{M_STATUS[o.status].label}</span>
                </div>
                <ul className="space-y-1 text-sm">
                  {o.items.map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="text-slate-700"><span className="font-semibold text-brand-600">{it.qty}×</span> {it.name}</span>
                      <span className="tabular-nums text-slate-500">{fmtRp(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>
                {o.note && <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">📝 {o.note}</p>}
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><span>📍</span><span className="truncate">{o.address}</span></div>
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                  <span className="text-xs text-slate-400">Total</span>
                  <span className="text-sm font-extrabold">{fmtRp(orderTotal(o))}</span>
                </div>

                {/* actions */}
                {o.status === 'paid' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => removeOrder(o.id)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50">Tolak</button>
                    <button onClick={() => setStatus(o.id, 'accepted_merchant')} className="flex-1 rounded-xl bg-brand-500 py-2.5 text-xs font-bold text-white hover:bg-brand-600">Terima Pesanan</button>
                  </div>
                )}
                {o.status === 'accepted_merchant' && (
                  <button onClick={() => setStatus(o.id, 'ready_for_pickup')} className="mt-3 w-full rounded-xl bg-violet-500 py-2.5 text-xs font-bold text-white hover:bg-violet-600">Tandai Siap Diambil</button>
                )}
                {o.status === 'ready_for_pickup' && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-semibold text-slate-500">
                    <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" /></span>
                    Menunggu driver menjemput
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </MerchantShell>
  );
}

/* ============ PAGE 2: MENU ============ */
function MerchantMenu() {
  const { stock, toggleStock } = useMerchant();
  const menu = DEMO_MENU[MERCHANT.id] || [];
  const groups = [
    { title: 'Makanan', items: menu.filter((m) => m.price >= 8000) },
    { title: 'Minuman & Lainnya', items: menu.filter((m) => m.price < 8000) },
  ];
  const activeCount = menu.filter((m) => stock[m.id]).length;
  return (
    <MerchantShell active="menu" title="Menu" subtitle={`${activeCount} dari ${menu.length} item tersedia`}
      headerRight={<button className="rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-600">+ Tambah</button>}>
      <div className="space-y-5">
        {groups.map((g) => (
          <section key={g.title}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{g.title}</h2>
              <span className="text-xs text-slate-400">{g.items.length} item</span>
            </div>
            <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
              {g.items.map((m) => {
                const on = stock[m.id];
                return (
                  <li key={m.id} className="flex items-center gap-3 border-b border-slate-100 p-3 last:border-0">
                    <FoodThumb label="menu" accent={MERCHANT.accent} className={`h-14 w-14 shrink-0 rounded-xl ${on ? '' : 'grayscale'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{m.name}</div>
                      <div className="truncate text-xs text-slate-500">{m.desc}</div>
                      <div className="mt-0.5 text-sm font-bold text-slate-800">{fmtRp(m.price)}</div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <button onClick={() => toggleStock(m.id)} aria-label="toggle stok"
                        className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                      <span className={`text-[10px] font-bold ${on ? 'text-emerald-600' : 'text-slate-400'}`}>{on ? 'Tersedia' : 'Habis'}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </MerchantShell>
  );
}

/* ============ PAGE 3: TOKO ============ */
function MerchantStore() {
  const { go } = useRouter();
  const { isOpen, setIsOpen, orders, orderTotal } = useMerchant();
  const today = orders.filter((o) => (Date.now() - new Date(o.created_at)) < 12 * 3600000);
  const revenue = today.reduce((a, o) => a + orderTotal(o), 0);
  const stats = [
    { label: 'Pesanan hari ini', value: today.length },
    { label: 'Pendapatan', value: fmtRp(revenue) },
    { label: 'Rating', value: `★ ${MERCHANT.rating}` },
  ];
  return (
    <MerchantShell active="store" title="Toko" subtitle="Profil & pengaturan">
      <section className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <FoodThumb label={`banner · ${MERCHANT.name}`} accent={MERCHANT.accent} className="h-24 w-full" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">{MERCHANT.name}</h2>
              <p className="text-xs text-slate-500">{MERCHANT.address}</p>
              <div className="mt-1"><Stars rating={MERCHANT.rating} count={MERCHANT.ratingCount} /></div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{isOpen ? 'Buka' : 'Tutup'}</span>
          </div>
        </div>
      </section>

      {/* open/close toggle */}
      <section className="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div>
          <div className="text-sm font-bold">{isOpen ? 'Toko sedang buka' : 'Toko sedang tutup'}</div>
          <div className="text-xs text-slate-500">{isOpen ? 'Menerima pesanan masuk' : 'Pelanggan tidak bisa memesan'}</div>
        </div>
        <button onClick={() => setIsOpen((v) => !v)} aria-label="buka tutup toko"
          className={`relative h-7 w-12 rounded-full transition ${isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}>
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${isOpen ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </section>

      {/* stats */}
      <section className="mb-4 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-3.5 text-center shadow-sm ring-1 ring-slate-100">
            <div className="text-lg font-extrabold leading-tight">{s.value}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </section>

      {/* settings list */}
      <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {[
          { icon: '🏬', label: 'Edit profil toko', sub: 'Nama, alamat, foto' },
          { icon: '💳', label: 'Wallet & pencairan', sub: 'Polygon · 0x7a…3f9' },
          { icon: '🕑', label: 'Jam operasional', sub: '08.00 – 21.00' },
          { icon: '❓', label: 'Bantuan mitra', sub: 'Pusat bantuan' },
        ].map((r, i) => (
          <li key={i}>
            <button className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left last:border-0 hover:bg-slate-50">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-base">{r.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="text-xs text-slate-500">{r.sub}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => go('/login')} className="mt-4 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-red-500 hover:bg-red-50">Keluar</button>
    </MerchantShell>
  );
}

Object.assign(window, { MerchantProvider, MerchantOrders, MerchantMenu, MerchantStore });
