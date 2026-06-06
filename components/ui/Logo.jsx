import Link from 'next/link';
import BrandMark from './BrandMark';
import Wordmark from './Wordmark';

export default function Logo({ sub, href = '/' }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <BrandMark className="h-8 w-8" />
      {sub ? (
        <div className="leading-tight">
          <Wordmark className="text-sm" />
          <div className="text-[10px] uppercase tracking-wider text-ink-soft">{sub}</div>
        </div>
      ) : (
        <Wordmark className="text-xl" />
      )}
    </Link>
  );
}
