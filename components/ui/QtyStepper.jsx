export default function QtyStepper({ qty, onAdd, onDec }) {
  if (!qty) {
    return (
      <button
        onClick={onAdd}
        className="rounded-lg border border-brand-500 px-4 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50"
      >
        Tambah
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <button onClick={onDec} className="grid h-7 w-7 place-items-center rounded-md bg-brand-50 text-brand-600 ring-1 ring-brand-200 hover:bg-brand-100">
        −
      </button>
      <span className="w-4 text-center text-sm font-bold tabular-nums">{qty}</span>
      <button onClick={onAdd} className="grid h-7 w-7 place-items-center rounded-md bg-brand-500 text-white hover:bg-brand-600">
        +
      </button>
    </div>
  );
}
