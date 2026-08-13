// ---- Buyer flow part 2: cart/checkout, tracking, history, account ----

/* ===================== CART / CHECKOUT ===================== */
function CartScreen() {
  const { go } = useRouter();
  const { cart, cartLines, addItem, decItem, subtotal, placeOrder } = useCart();
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [note, setNote] = useState('');
  const [paying, setPaying] = useState(false);
  const m = DEMO_MERCHANTS.find((x) => x.id === cart.merchantId);
  const lines = cartLines();

  if (!m || lines.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <BackBar title="Keranjang" onBack={() => go('/buyer')} />
        <div className="grid place-items-center px-6 py-24 text-center">
          <div className="mb-3 text-5xl">🛒</div>
          <p className="font-bold">Keranjang masih kosong</p>
          <p className="mt-1 text-sm text-slate-500">Yuk pilih makanan favoritmu dulu.</p>
          <button onClick={() => go('/buyer')} className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Cari Makanan</button>
        </div>
      </div>
    );
  }

  const sub = subtotal();
  const total = sub + DELIVERY_FEE + GAS_FEE;

  function pay() {
    setPaying(true);
    setTimeout(() => { placeOrder(address); go('/order'); }, 1100);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <BackBar title="Keranjang" onBack={() => go(`/resto?id=${m.id}`)} />
      <main className="mx-auto max-w-2xl px-4 py-4 space-y-4">
        {/* Address */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            <span>📍</span> Alamat Pengantaran
          </div>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </section>

        {/* Items from merchant */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FoodThumb label={m.cat} accent={m.accent} className="h-9 w-9 rounded-lg" />
            <h2 className="font-bold">{m.name}</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{l.name}</div>
                  <div className="text-xs text-slate-500">{fmtRp(l.price)}</div>
                </div>
                <QtyStepper qty={l.qty} onAdd={() => addItem(m.id, l.id)} onDec={() => decItem(l.id)} />
                <div className="w-20 text-right text-sm font-bold tabular-nums">{fmtRp(l.lineTotal)}</div>
              </li>
            ))}
          </ul>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan untuk merchant (opsional)"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </section>

        {/* Payment breakdown */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Rincian Pembayaran</h3>
          <dl className="space-y-2 text-sm">
            <Row2 k="Subtotal makanan" v={fmtRp(sub)} />
            <Row2 k="Ongkir (ke driver)" v={fmtRp(DELIVERY_FEE)} />
            <Row2 k={<span className="inline-flex items-center gap-1">Biaya jaringan (gas) <span className="rounded bg-violet-50 px-1 text-[10px] font-bold text-violet-600">Polygon</span></span>} v={fmtRp(GAS_FEE)} />
            <div className="my-2 border-t border-dashed border-slate-200" />
            <Row2 k={<span className="font-bold text-slate-800">Total bayar</span>} v={<span className="text-base font-extrabold text-slate-900">{fmtRp(total)}</span>} />
          </dl>
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-500">
            <span>🔒</span> Dana ditahan di smart contract (escrow) dan baru dirilis ke merchant &amp; driver saat pesanan selesai. 0% komisi platform.
          </p>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white p-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="leading-tight">
            <div className="text-[11px] text-slate-400">Total</div>
            <div className="text-lg font-extrabold">{fmtRp(total)}</div>
          </div>
          <button onClick={pay} disabled={paying}
            className="flex-1 rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 disabled:opacity-60">
            {paying ? 'Memproses pembayaran…' : 'Pesan & Bayar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row2({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-600">{k}</dt>
      <dd className="font-semibold tabular-nums">{v}</dd>
    </div>
  );
}

function InfoRow({ icon, k, v }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 text-base leading-none">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{k}</dt>
        <dd className="text-sm text-slate-700">{v}</dd>
      </div>
    </div>
  );
}

/* ===================== ORDER TRACKING ===================== */
function OrderMap({ merchant }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  useEffect(() => {
    if (!elRef.current || mapRef.current || !window.L) return;
    const dest = [merchant.latitude - 0.004, merchant.longitude + 0.005];
    const src = [merchant.latitude, merchant.longitude];
    const map = L.map(elRef.current, { zoomControl: false, scrollWheelZoom: false, attributionControl: false })
      .setView([(src[0] + dest[0]) / 2, (src[1] + dest[1]) / 2], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const mk = (latlng, color, label) => L.marker(latlng, {
      icon: L.divIcon({ className: '', html: `<div style="background:${color};color:#fff;font-size:14px;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.3)"><span style="transform:rotate(45deg)">${label}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30] }),
    }).addTo(map);
    mk(src, '#f97316', '🏪');
    mk(dest, '#0d9488', '🏠');
    L.polyline([src, dest], { color: '#f97316', weight: 4, dashArray: '8 6', opacity: 0.8 }).addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
  }, [merchant]);
  return <div ref={elRef} className="h-56 w-full" />;
}

function OrderScreen() {
  const { go } = useRouter();
  const { activeOrder } = useCart();
  const o = activeOrder;
  if (!o) {
    return (
      <div className="min-h-screen bg-white">
        <BackBar title="Lacak Pesanan" onBack={() => go('/buyer')} />
        <div className="grid place-items-center px-6 py-24 text-center text-slate-500">
          <p className="font-bold text-slate-700">Belum ada pesanan aktif</p>
          <button onClick={() => go('/buyer')} className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white">Mulai Pesan</button>
        </div>
      </div>
    );
  }
  const idx = STATUS_FLOW.indexOf(o.status);
  const done = o.status === 'delivered';
  const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;
  const arrival = fmtTime(o.arrivalAt);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <BackBar title="Lacak Pesanan" onBack={() => go('/buyer')} right={<span className="font-mono text-[11px] font-semibold text-slate-400">{o.orderNo}</span>} />
      <div className="relative">
        <OrderMap merchant={o.merchant} />
        {!done && o.driverDistance && (
          <div className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur">
            🛵 Driver {o.driverDistance} dari lokasimu
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-px bg-gradient-to-t from-slate-50 to-transparent pt-8" />
      </div>

      <main className="mx-auto -mt-4 max-w-2xl space-y-4 px-4">
        {/* Status hero */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {!done && <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" /></span>}
                <span className={`text-xs font-bold uppercase tracking-wide ${done ? 'text-emerald-600' : 'text-brand-600'}`}>{done ? '✓ Selesai' : 'Sedang berjalan'}</span>
              </div>
              <h2 className="mt-1.5 text-xl font-extrabold">{STATUS_LABEL[o.status]}</h2>
              <p className="text-sm text-slate-500">{o.merchant.name}</p>
            </div>
            {!done && (
              <div className="shrink-0 rounded-xl bg-brand-50 px-3 py-2 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wide text-brand-500">Estimasi tiba</div>
                <div className="text-lg font-extrabold leading-tight text-brand-700">{arrival}</div>
                <div className="text-[11px] font-semibold text-brand-500">±{o.driverEta} menit lagi</div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <ol className="mt-5 space-y-0">
            {STATUS_FLOW.map((s, i) => {
              const reached = i <= idx;
              const current = i === idx && !done;
              const ts = fmtTime(o.times?.[s]);
              return (
                <li key={s} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold transition ${reached ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-400'} ${current ? 'ring-4 ring-brand-100' : ''}`}>{reached ? '✓' : i + 1}</span>
                    {i < STATUS_FLOW.length - 1 && <span className={`my-0.5 w-0.5 flex-1 ${i < idx ? 'bg-brand-500' : 'bg-slate-200'}`} style={{ minHeight: 18 }} />}
                  </div>
                  <div className="flex flex-1 items-center justify-between pb-3">
                    <span className={`text-sm ${reached ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>{STATUS_LABEL[s]}</span>
                    {ts && <span className="font-mono text-[11px] tabular-nums text-slate-400">{ts}</span>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Driver card */}
        {o.driver && !done && (
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <span>🛵</span> Driver kamu
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-2xl">🏍️</div>
              <div className="flex-1">
                <div className="text-sm font-bold">{o.driver.name}</div>
                <div className="text-xs text-slate-500">{o.driver.vehicle} · {o.driver.plate}</div>
                <div className="mt-0.5 flex items-center gap-2"><Stars rating={o.driver.rating} /><span className="text-[11px] text-slate-400">· {o.driver.trips?.toLocaleString('id-ID')} antar</span></div>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">📞</button>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600">💬</button>
            </div>
          </section>
        )}

        {/* Delivery info */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Info Pengantaran</h3>
          <dl className="space-y-2.5 text-sm">
            <InfoRow icon="📍" k="Alamat" v={o.delivery_address} />
            <InfoRow icon="👤" k="Penerima" v={o.recipient ? `${o.recipient.name} · ${o.recipient.phone}` : '—'} />
            <InfoRow icon="🏪" k="Diambil dari" v={`${o.merchant.name} · ${o.merchant.address}`} />
            <InfoRow icon="💳" k="Pembayaran" v={o.payment} />
            <InfoRow icon="🧾" k="No. pesanan" v={<span className="font-mono">{o.orderNo}</span>} />
          </dl>
        </section>

        {/* Order summary */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Ringkasan Pesanan</h3>
          <ul className="space-y-1.5 text-sm">
            {o.items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <span className="text-slate-700"><span className="font-semibold text-brand-600">{it.qty}×</span> {it.name}</span>
                <span className="tabular-nums text-slate-500">{fmtRp(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 border-t border-dashed border-slate-200" />
          <dl className="space-y-1.5 text-sm">
            <Row2 k="Subtotal" v={fmtRp(o.subtotal)} />
            <Row2 k="Ongkir" v={fmtRp(o.delivery_fee)} />
            <Row2 k="Biaya jaringan (gas)" v={fmtRp(o.gas_fee)} />
            <Row2 k={<span className="font-bold text-slate-800">Total</span>} v={<span className="font-extrabold">{fmtRp(o.total)}</span>} />
          </dl>
        </section>

        {/* On-chain receipt */}
        <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-700"><span>⛓️</span> Tercatat on-chain · Polygon</div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <code className="truncate font-mono text-[11px] text-violet-600">{o.txHash}</code>
            <span className="shrink-0 text-[11px] font-semibold text-violet-500">Lihat ↗</span>
          </div>
        </section>

        {done && (
          <button onClick={() => go('/buyer')} className="w-full rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white hover:bg-brand-600">Selesai · Kembali ke Beranda</button>
        )}
      </main>
    </div>
  );
}

/* ===================== ORDERS (riwayat) ===================== */
function OrdersScreen() {
  const { go } = useRouter();
  const { activeOrder, history } = useCart();
  const nameOf = (id) => DEMO_MERCHANTS.find((m) => m.id === id)?.name || 'Merchant';
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-3.5 backdrop-blur">
        <h1 className="mx-auto max-w-4xl text-lg font-extrabold">Pesanan</h1>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-4 space-y-5">
        {activeOrder && activeOrder.status !== 'delivered' && (
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Sedang berjalan</h2>
            <button onClick={() => go('/order')} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm ring-1 ring-brand-200">
              <FoodThumb label={activeOrder.merchant.cat} accent={activeOrder.merchant.accent} className="h-14 w-14 rounded-xl" />
              <div className="flex-1">
                <div className="font-bold">{activeOrder.merchant.name}</div>
                <div className="text-xs text-brand-600">{STATUS_LABEL[activeOrder.status]}</div>
              </div>
              <span className="text-xs font-bold text-brand-600">Lacak ›</span>
            </button>
          </section>
        )}
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Riwayat</h2>
          <ul className="space-y-3">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-100">
                <FoodThumb label="resto" accent={DEMO_MERCHANTS.find((m) => m.id === h.merchant_id)?.accent || '#f97316'} className="h-14 w-14 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold">{nameOf(h.merchant_id)}</span>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Selesai</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{h.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700">{fmtRp(h.total)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <BuyerTabBar />
    </div>
  );
}

/* ===================== ACCOUNT ===================== */
function AccountScreen() {
  const { go } = useRouter();
  const rows = [
    { icon: '📍', label: 'Alamat tersimpan', sub: DEFAULT_ADDRESS },
    { icon: '💳', label: 'Wallet & pembayaran', sub: 'Polygon · 0x7a…3f9' },
    { icon: '🧾', label: 'Riwayat transaksi', sub: 'Lihat semua pesanan', go: '/orders' },
    { icon: '❓', label: 'Bantuan', sub: 'Pusat bantuan & FAQ' },
  ];
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-brand-500 px-4 pb-6 pt-5 text-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 text-2xl">👩</div>
          <div>
            <div className="text-lg font-extrabold">{DEMO_BUYER.full_name}</div>
            <div className="text-sm text-white/80">{DEMO_BUYER.email}</div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 -mt-4">
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div>
            <div className="text-xs text-slate-400">Saldo Wallet</div>
            <div className="text-xl font-extrabold">Rp84.500 <span className="text-sm font-semibold text-slate-400">≈ 12.4 MATIC</span></div>
          </div>
          <button className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-bold text-brand-600">Top Up</button>
        </div>
        <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          {rows.map((r, i) => (
            <li key={i}>
              <button onClick={() => r.go && go(r.go)} className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left last:border-0 hover:bg-slate-50">
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
      </main>
      <BuyerTabBar />
    </div>
  );
}

Object.assign(window, { CartScreen, OrderScreen, OrdersScreen, AccountScreen });