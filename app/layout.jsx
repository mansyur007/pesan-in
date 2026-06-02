import './globals.css';

export const metadata = {
  title: 'Pesanin — Delivery Makanan 0% Komisi',
  description: 'MVP food delivery untuk area Gunungpati, Semarang. Transaksi on-chain via Polygon.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
