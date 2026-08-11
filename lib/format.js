export const fmtRp = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');

export const DELIVERY_FEE = 6000;
export const GAS_FEE = 1500; // biaya jaringan (gas) Polygon

export const STATUS_FLOW = ['paid', 'accepted_merchant', 'ready_for_pickup', 'picked_up', 'delivered'];

export const STATUS_LABEL = {
  paid: 'Menunggu konfirmasi',
  accepted_merchant: 'Pesanan disiapkan',
  ready_for_pickup: 'Siap diambil driver',
  picked_up: 'Driver mengantar',
  delivered: 'Pesanan selesai',
  rejected: 'Ditolak merchant',
};

// Label pendek untuk dashboard merchant (kolom sempit, sudut pandang toko).
export const MERCHANT_STATUS = {
  paid: { label: 'Baru', chip: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  accepted_merchant: { label: 'Dimasak', chip: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  ready_for_pickup: { label: 'Siap', chip: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  picked_up: { label: 'Diantar', chip: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  delivered: { label: 'Selesai', chip: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  rejected: { label: 'Ditolak', chip: 'bg-red-100 text-red-600', dot: 'bg-red-400' },
};
