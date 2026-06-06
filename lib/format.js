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
};
