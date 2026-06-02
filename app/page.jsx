import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white font-bold">P</span>
            <span className="text-lg font-bold tracking-tight">Pesanin</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600">
              Masuk
            </Link>
            <Link href="/register" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
              Daftar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-14 sm:pt-16 sm:pb-20">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            Khusus area Gunungpati, Semarang
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            Delivery makanan <span className="text-brand-500">0% komisi</span>,
            transparan di blockchain.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            Harga ke merchant, ongkir ke driver — langsung, tanpa potongan platform. Dicatat on-chain di Polygon.
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/register?role=buyer" className="rounded-xl bg-brand-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-brand-600">
              Pesan Sekarang
            </Link>
            <Link href="/register?role=merchant" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600">
              Jadi Merchant
            </Link>
          </div>
          <Link href="/register?role=driver" className="mt-3 text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-brand-600">
            Atau daftar sebagai Driver
          </Link>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-6 text-center text-xl font-bold sm:text-2xl">Tiga peran, satu ekosistem</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RoleCard
            emoji="🍔"
            title="Merchant"
            desc="Upload menu, kelola pesanan masuk, terima pembayaran langsung ke wallet."
          />
          <RoleCard
            emoji="🛒"
            title="Pembeli"
            desc="Browse menu sekitar Gunungpati, checkout, bayar sekali (makanan + ongkir + gas)."
          />
          <RoleCard
            emoji="🏍️"
            title="Driver"
            desc="Ambil pesanan yang tersedia, antar, ongkir masuk wallet otomatis."
          />
        </div>
      </section>

      {/* How it works */}
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
          © {new Date().getFullYear()} Pesanin. MVP — Gunungpati, Semarang.
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
