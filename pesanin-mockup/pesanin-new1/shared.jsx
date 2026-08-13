// ---- Router + shared chrome for the Pesanin prototype ----
const { useState, useEffect, useRef, createContext, useContext } = React;

const RouterCtx = createContext(null);
const useRouter = () => useContext(RouterCtx);

function parse(path) {
  const [p, qs] = path.split('?');
  const query = {};
  if (qs) qs.split('&').forEach((kv) => { const [k, v] = kv.split('='); query[k] = decodeURIComponent(v || ''); });
  return { path: p, query };
}

function RouterProvider({ children }) {
  const [route, setRoute] = useState(parse(location.hash.slice(1) || '/'));
  const go = (path) => { location.hash = path; };
  useEffect(() => {
    const onHash = () => setRoute(parse(location.hash.slice(1) || '/'));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return <RouterCtx.Provider value={{ route, go }}>{children}</RouterCtx.Provider>;
}

// Drop-in for next/link
function Link({ href, className, children, ...rest }) {
  const { go } = useRouter();
  return (
    <a href={'#' + href} className={className} onClick={(e) => { e.preventDefault(); go(href); }} {...rest}>
      {children}
    </a>
  );
}

function Logo({ sub }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white font-bold">P</span>
      {sub ? (
        <div>
          <div className="text-sm font-bold leading-tight">Pesanin</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">{sub}</div>
        </div>
      ) : (
        <span className="text-lg font-bold tracking-tight">Pesanin</span>
      )}
    </Link>
  );
}

function LogoutButton() {
  const { go } = useRouter();
  return (
    <button
      onClick={() => go('/login')}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
    >
      Keluar
    </button>
  );
}

function TopBar({ user, title }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Logo sub={title} />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-xs font-semibold">{user?.full_name}</div>
            <div className="text-[10px] text-slate-500">{user?.email}</div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

function AuthShell({ title, children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 inline-flex"><Logo /></div>
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight">{title}</h1>
        {children}
      </div>
    </main>
  );
}

function Field({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

// Real Leaflet map of Gunungpati with merchant pins
function GunungpatiMap({ merchants = [], height = 320 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  useEffect(() => {
    if (!elRef.current || mapRef.current || !window.L) return;
    const map = L.map(elRef.current, { scrollWheelZoom: false }).setView(GUNUNGPATI_CENTER, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    const icon = new L.Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    });
    merchants.forEach((m) => {
      L.marker([m.latitude, m.longitude], { icon }).addTo(map)
        .bindPopup(`<div style="font-size:13px"><b>${m.name}</b><br><span style="color:#64748b">${m.address}</span></div>`);
    });
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
  }, [merchants]);
  return <div ref={elRef} style={{ height }} className="w-full" />;
}

const fmtRp = (n) => 'Rp' + Number(n).toLocaleString('id-ID');

// Striped food-image placeholder (no hand-drawn art — labelled drop zone)
function FoodThumb({ label = 'foto menu', accent = '#f97316', className = '', style = {} }) {
  const bg = `repeating-linear-gradient(135deg, ${accent}14 0 10px, ${accent}05 10px 20px)`;
  return (
    <div className={'grid place-items-center overflow-hidden ' + className}
      style={{ background: bg, ...style }}>
      <span className="select-none font-mono text-[10px] uppercase tracking-wider"
        style={{ color: accent }}>{label}</span>
    </div>
  );
}

function Stars({ rating, count }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
      <span className="text-amber-500">★</span>{rating}
      {count != null && <span className="font-normal text-slate-400">({count})</span>}
    </span>
  );
}

// GoFood-style bottom tab bar for buyer screens
function BuyerTabBar() {
  const { route, go } = useRouter();
  const tabs = [
    { path: '/buyer',   label: 'Beranda', icon: '🏠' },
    { path: '/orders',  label: 'Pesanan', icon: '🧾' },
    { path: '/account', label: 'Akun',    icon: '👤' },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl">
        {tabs.map((t) => {
          const active = route.path === t.path;
          return (
            <button key={t.path} onClick={() => go(t.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${active ? 'text-brand-600' : 'text-slate-400'}`}>
              <span className={`text-lg leading-none ${active ? '' : 'grayscale opacity-70'}`}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

Object.assign(window, {
  useState, useEffect, useRef,
  RouterProvider, useRouter, Link, Logo, LogoutButton, TopBar,
  AuthShell, Field, GunungpatiMap, fmtRp, FoodThumb, Stars, BuyerTabBar,
});
