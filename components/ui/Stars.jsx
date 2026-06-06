export default function Stars({ rating, count }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
      <span className="text-amber-500">★</span>
      {rating}
      {count != null && <span className="font-normal text-slate-400">({count})</span>}
    </span>
  );
}
