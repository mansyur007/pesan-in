import Link from 'next/link';

export function AuthShell({ title, children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white font-bold">P</span>
          <span className="text-lg font-bold">Pesanin</span>
        </Link>
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight">{title}</h1>
        {children}
      </div>
    </main>
  );
}

export function Field({ label, type = 'text', value, onChange, required, placeholder }) {
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
