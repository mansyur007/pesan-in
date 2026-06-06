import Logo from '@/components/ui/Logo';
import LogoutButton from './LogoutButton';

export default function TopBar({ user, title }) {
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
