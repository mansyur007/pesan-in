// Mark Pesan.in — pin peta + gelembung pesan, ruang negatif membentuk "p".
// Geometri murni (font-independent), sesuai aset brand resmi.
const VARIANTS = {
  color: { pin: '#F97316', glyph: '#ffffff', dot: '#F97316' },
  onOrange: { pin: '#ffffff', glyph: '#F97316', dot: '#ffffff' },
  white: { pin: '#ffffff', glyph: '#211A14', dot: '#ffffff' },
  ink: { pin: '#211A14', glyph: '#ffffff', dot: '#211A14' },
};

export default function BrandMark({ className = 'h-8 w-8', variant = 'color' }) {
  const c = VARIANTS[variant] || VARIANTS.color;
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Pesan.in">
      <path
        d="M32 4C18.7 4 8 14.7 8 28c0 14.4 16.3 26.4 24 32 7.7-5.6 24-17.6 24-32C56 14.7 45.3 4 32 4Z"
        fill={c.pin}
      />
      <circle cx="33" cy="25" r="11" fill={c.glyph} />
      <rect x="19.5" y="13.5" width="6.6" height="29" rx="3.3" fill={c.glyph} />
      <circle cx="33" cy="25" r="4.6" fill={c.dot} />
    </svg>
  );
}
