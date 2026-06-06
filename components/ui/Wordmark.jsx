// Wordmark resmi: "pesanin" lowercase, ExtraBold, huruf "i" beraksen oranye
// (mewakili .in pada Pesan.in).
export default function Wordmark({ className = 'text-lg', onDark = false }) {
  return (
    <span className={`font-extrabold tracking-tight ${onDark ? 'text-white' : 'text-ink'} ${className}`}>
      pesan<span className="text-brand-500">i</span>n
    </span>
  );
}
