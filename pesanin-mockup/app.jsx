// ---- App shell: route switch + prototype navigator ----
function CurrentScreen() {
  const { route } = useRouter();
  switch (route.path) {
    case '/login':    return <LoginPage />;
    case '/register': return <RegisterPage />;
    case '/buyer':    return <BuyerHome />;
    case '/resto':    return <RestoDetail />;
    case '/cart':     return <CartScreen />;
    case '/order':    return <OrderScreen />;
    case '/orders':   return <OrdersScreen />;
    case '/account':  return <AccountScreen />;
    case '/merchant': return <MerchantDashboard />;
    case '/driver':   return <DriverDashboard />;
    default:          return <LandingPage />;
  }
}

const NAV_GROUPS = [
  { title: 'Umum', items: [
    { path: '/',         label: 'Landing' },
    { path: '/login',    label: 'Masuk' },
    { path: '/register', label: 'Daftar' },
  ]},
  { title: 'Pembeli (GoFood flow)', items: [
    { path: '/buyer',   label: 'Beranda' },
    { path: '/resto?id=m4', label: 'Detail Resto' },
    { path: '/cart',    label: 'Keranjang' },
    { path: '/order',   label: 'Lacak Pesanan' },
    { path: '/orders',  label: 'Riwayat' },
    { path: '/account', label: 'Akun' },
  ]},
  { title: 'Mitra', items: [
    { path: '/merchant', label: 'Merchant' },
    { path: '/driver',   label: 'Driver' },
  ]},
];

function ProtoNav() {
  const { route, go } = useRouter();
  const [open, setOpen] = useState(false);
  const here = route.path === '' ? '/' : route.path;
  return (
    <div className="fixed right-3 top-3 z-[2000] flex flex-col items-end print:hidden">
      {open && (
        <div className="order-2 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Demo Navigator</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {NAV_GROUPS.map((g) => (
              <div key={g.title} className="mb-2 last:mb-0">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{g.title}</div>
                <div className="grid grid-cols-2 gap-1">
                  {g.items.map((n) => {
                    const active = here === n.path.split('?')[0];
                    return (
                      <button key={n.path} onClick={() => { go(n.path); setOpen(false); }}
                        className={`rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition ${active ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                        {n.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xl hover:bg-slate-800">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[9px]">P</span>
        {open ? 'Tutup' : 'Demo'}
      </button>
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <CartProvider>
        <CurrentScreen />
        <ProtoNav />
      </CartProvider>
    </RouterProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
