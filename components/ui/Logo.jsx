import Link from 'next/link';

export default function Logo({ sub, href = '/' }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 font-bold text-white">P</span>
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
