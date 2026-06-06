'use client';

import { useRouter } from 'next/navigation';

export default function BackBar({ title, back, right }) {
  const router = useRouter();
  const onBack = () => (back ? router.push(back) : router.back());
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
      <button
        onClick={onBack}
        className="grid h-9 w-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100"
        aria-label="Kembali"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 className="flex-1 truncate text-base font-bold">{title}</h1>
      {right}
    </header>
  );
}
