// Ditampilkan saat akun merchant belum punya toko terdaftar.
export default function NoStore() {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
      <div className="mb-2 text-4xl">🏪</div>
      <p className="text-sm font-semibold text-slate-600">Kamu belum punya toko terdaftar</p>
      <p className="mt-1 text-xs text-slate-400">Hubungi admin Pesan.in untuk mendaftarkan warungmu.</p>
    </div>
  );
}
