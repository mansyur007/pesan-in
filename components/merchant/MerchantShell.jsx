'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { initNotifications, ensurePermission, subscribeToPush } from '@/lib/notify';

const TABS = [
  { path: '/merchant', label: 'Pesanan', icon: '🧾' },
  { path: '/merchant/menu', label: 'Menu', icon: '🍽️' },
  { path: '/merchant/store', label: 'Toko', icon: '🏪' },
];

// Kerangka bersama 3 halaman merchant: header sticky + bottom-tab.
// newCount memberi badge merah di tab Pesanan (jumlah pesanan berstatus 'paid').
export default function MerchantShell({ title, subtitle, headerRight, newCount = 0, children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Aktifkan push di halaman merchant manapun yang dibuka duluan, supaya "pesanan
  // baru" tetap masuk walau merchant sedang membuka tab Menu/Toko, bukan Pesanan.
  useEffect(() => {
    initNotifications().then(() => {
      ensurePermission().then((granted) => granted && subscribeToPush());
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-3.5 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold leading-tight">{title}</h1>
            {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl">
          {TABS.map((t) => {
            const active = pathname === t.path;
            const badge = t.path === '/merchant' ? newCount : 0;
            return (
              <button
                key={t.path}
                onClick={() => router.push(t.path)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                  active ? 'text-brand-600' : 'text-slate-400'
                }`}
              >
                <span className={`text-lg leading-none ${active ? '' : 'opacity-70 grayscale'}`}>{t.icon}</span>
                {t.label}
                {badge > 0 && (
                  <span className="absolute right-1/2 top-1.5 translate-x-3.5 rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
