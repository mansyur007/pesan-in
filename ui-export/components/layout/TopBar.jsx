import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function TopBar({ user, title }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white font-bold">P</span>
          <div>
            <div className="text-sm font-bold leading-tight">Pesanin</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{title}</div>
          </div>
        </Link>
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
