// Placeholder bergaris untuk foto menu (belum ada gambar asli).
export default function FoodThumb({ label = 'foto menu', accent = '#f97316', className = '', style = {} }) {
  const bg = `repeating-linear-gradient(135deg, ${accent}14 0 10px, ${accent}05 10px 20px)`;
  return (
    <div className={'grid place-items-center overflow-hidden ' + className} style={{ background: bg, ...style }}>
      <span className="select-none font-mono text-[10px] uppercase tracking-wider" style={{ color: accent }}>
        {label}
      </span>
    </div>
  );
}
