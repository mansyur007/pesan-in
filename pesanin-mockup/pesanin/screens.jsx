// ---- Pesanin screens ----
const DEMO_USER = { id: 'u_demo', full_name: 'Rina Pratiwi', email: 'rina@demo.test' };

const ROLES = [
  { id: 'buyer',    label: 'Pembeli',  emoji: '🛒' },
  { id: 'merchant', label: 'Merchant', emoji: '🍔' },
  { id: 'driver',   label: 'Driver',   emoji: '🏍️' },
];

function DemoBanner({ children }) {
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{children}</div>
  );
}

/* ================= LANDING ================= */
function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600">Masuk</Link>
            <Link href="/register" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">Daftar</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pt-10 pb-14 sm:pt-16 sm:pb-20">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            Khusus area Gunungpati, Semarang
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            Delivery makanan <span className="text-brand-500">0% komisi</span>, transparan di blockchain.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            Harga ke merchant, ongkir ke driver — langsung, tanpa potongan platform. Dicatat on-chain di Polygon.
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/register?role=buyer" className="rounded-xl bg-brand-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-brand-600">Pesan Sekarang</Link>
            <Link href="/register?role=merchant" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600">Jadi Merchant</Link>
          </div>
          <Link href="/register?role=driver" className="mt-3 text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-brand-600">Atau daftar sebagai Driver</Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-6 text-center text-xl font-bold sm:text-2xl">Tiga peran, satu ekosistem</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RoleCard emoji="🍔" title="Merchant" desc="Upload menu, kelola pesanan masuk, terima pembayaran langsung ke wallet." />
          <RoleCard emoji="🛒" title="Pembeli" desc="Browse menu sekitar Gunungpati, checkout, bayar sekali (makanan + ongkir + gas)." />
          <RoleCard emoji="🏍️" title="Driver" desc="Ambil pesanan yang tersedia, antar, ongkir masuk wallet otomatis." />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-8 text-center text-xl font-bold sm:text-2xl">Cara kerja</h2>
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Step n={1} title="Checkout" desc="Pembeli bayar total (makanan + ongkir + gas)." />
            <Step n={2} title="Escrow" desc="Dana masuk smart contract di Polygon." />
            <Step n={3} title="Antar" desc="Merchant siapkan, driver antar." />
            <Step n={4} title="Settle" desc="Dana terdistribusi otomatis saat selesai." />
          </ol>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-slate-500">
          © 2026 Pesanin. MVP — Gunungpati, Semarang.
        </div>
      </footer>
    </main>
  );
}

function RoleCard({ emoji, title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-2 text-base font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">{n}</div>
      <h3 className="mt-3 text-sm font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </li>
  );
}

/* ================= LOGIN ================= */
function LoginPage() {
  const { go, route } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const role = email.split('@')[0];
    setTimeout(() => {
      const home = role === 'merchant' ? '/merchant' : role === 'driver' ? '/driver' : '/buyer';
      go(home);
    }, 500);
  }
  const useDemo = (r) => { setEmail(`${r}@demo.test`); setPassword('demo123'); };

  return (
    <AuthShell title="Masuk ke Pesanin">
      <DemoBanner>
        <p className="font-semibold">Mode Demo (Supabase belum dikonfigurasi)</p>
        <p className="mt-1">Klik untuk isi otomatis:</p>
        <div className="mt-2 flex gap-2">
          {['merchant', 'buyer', 'driver'].map((r) => (
            <button key={r} type="button" onClick={() => useDemo(r)}
              className="rounded-md bg-white px-2 py-1 font-medium text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100">{r}</button>
          ))}
        </div>
      </DemoBanner>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Belum punya akun? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Daftar</Link>
      </p>
    </AuthShell>
  );
}

/* ================= REGISTER ================= */
function RegisterPage() {
  const { go, route } = useRouter();
  const [role, setRole] = useState(ROLES.find((r) => r.id === route.query.role)?.id || 'buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => go(role === 'merchant' ? '/merchant' : role === 'driver' ? '/driver' : '/buyer'), 500);
  }

  return (
    <AuthShell title="Daftar Pesanin">
      <div className="mb-5 grid grid-cols-3 gap-2">
        {ROLES.map((r) => (
          <button key={r.id} type="button" onClick={() => setRole(r.id)}
            className={`rounded-xl border p-3 text-center text-sm font-semibold transition ${
              role === r.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            <div className="text-xl">{r.emoji}</div>
            <div className="mt-1">{r.label}</div>
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nama lengkap" value={fullName} onChange={setFullName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Nomor HP" type="tel" value={phone} onChange={setPhone} placeholder="08xx" />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
          {loading ? 'Memproses…' : `Daftar sebagai ${ROLES.find((r) => r.id === role).label}`}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Sudah punya akun? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Masuk</Link>
      </p>
    </AuthShell>
  );
}

/* ================= MERCHANT ================= */
function MerchantDashboard() {
  const merchant = DEMO_MERCHANTS[0];
  const menu = DEMO_MENU[merchant.id] || [];
  const orders = DEMO_ORDERS.filter((o) => o.merchant_id === merchant.id);
  return (
    <>
      <TopBar user={{ full_name: 'Bu Sri', email: 'busri@demo.test' }} title="Merchant" />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <DemoBanner><b>Demo mode.</b> Data di halaman ini adalah contoh — isi <code>.env.local</code> dengan kredensial Supabase untuk pakai database beneran.</DemoBanner>
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-lg font-bold">{merchant.name}</h2>
          <p className="text-sm text-slate-600">{merchant.address}</p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {merchant.is_open ? 'Buka' : 'Tutup'}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Menu ({menu.length})</h3>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {menu.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-slate-500">{fmtRp(m.price)}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {m.is_available ? 'Tersedia' : 'Habis'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Pesanan Masuk</h3>
          <ul className="space-y-2">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div>
                  <div className="text-sm font-semibold">#{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString('id-ID')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{fmtRp(o.subtotal)}</div>
                  <div className="text-xs text-brand-600">{o.status}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

/* ================= DRIVER ================= */
function DriverOrdersList({ available, mine }) {
  const [state, setState] = useState({ available, mine, busy: null });

  function acceptOrder(id) {
    setState((s) => ({ ...s, busy: id }));
    const order = state.available.find((o) => o.id === id);
    setTimeout(() => setState((s) => ({
      available: s.available.filter((o) => o.id !== id),
      mine: [{ ...order, status: 'picked_up' }, ...s.mine],
      busy: null,
    })), 450);
  }
  function completeOrder(id) {
    setState((s) => ({ ...s, busy: id }));
    setTimeout(() => {
      const tx = '0x' + Math.random().toString(16).slice(2).padEnd(40, '0');
      alert(`Demo: dana didistribusi otomatis lewat smart contract.\nTx hash (mock): ${tx.slice(0, 22)}…`);
      setState((s) => ({ available: s.available, mine: s.mine.filter((o) => o.id !== id), busy: null }));
    }, 500);
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
                    <div className="text-sm font-bold text-emerald-700">+{fmtRp(o.delivery_fee)}</div>
                    <button disabled={state.busy === o.id} onClick={() => acceptOrder(o.id)}
                      className="mt-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
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
                  <button disabled={state.busy === o.id} onClick={() => completeOrder(o.id)}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
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

function DriverDashboard() {
  const available = DEMO_ORDERS.filter((o) => !o.driver_id);
  const mine = DEMO_ORDERS.filter((o) => o.driver_id === 'u_driver');
  return (
    <>
      <TopBar user={{ full_name: 'Andi Saputra', email: 'andi@demo.test' }} title="Driver" />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <DemoBanner><b>Demo mode.</b> Tombol "Ambil" / "Selesai" simulasi saja sampai Supabase dikonfigurasi.</DemoBanner>
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold">Dashboard Driver</h1>
          <p className="text-sm text-slate-600">Ambil pesanan di sekitar Gunungpati.</p>
        </header>
        <DriverOrdersList available={available} mine={mine} />
      </main>
    </>
  );
}

Object.assign(window, { LandingPage, LoginPage, RegisterPage, MerchantDashboard, DriverDashboard });
