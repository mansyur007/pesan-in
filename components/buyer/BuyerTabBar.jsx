'use client';

import { usePathname, useRouter } from 'next/navigation';

const TABS = [
  { path: '/buyer', label: 'Beranda', icon: '🏠' },
  { path: '/orders', label: 'Pesanan', icon: '🧾' },
  { path: '/account', label: 'Akun', icon: '👤' },
];

export default function BuyerTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl">
        {TABS.map((t) => {
          const active = pathname === t.path;
          return (
            <button
              key={t.path}
              onClick={() => router.push(t.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                active ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <span className={`text-lg leading-none ${active ? '' : 'opacity-70 grayscale'}`}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
