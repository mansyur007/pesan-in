(function () {
  if (!Auth.requireLogin()) return;
  const content = document.getElementById('historyContent');

  const STATUS_LABELS = {
    pending: 'Pending', confirmed: 'Dikonfirmasi', preparing: 'Dimasak',
    ready: 'Siap', picked_up: 'Dikirim', delivered: 'Selesai', cancelled: 'Dibatalkan'
  };

  async function init() {
    const orders = await API.get('/orders/user/history');
    if (!orders.length) {
      content.innerHTML = `<div class="empty-state" style="padding-top:80px"><div class="icon">📋</div><div style="font-weight:600;margin-bottom:8px;">Belum ada pesanan</div><a href="/" style="color:var(--green);font-size:14px;">Pesan sekarang</a></div>`;
      return;
    }
    content.innerHTML = orders.map(o => `
      <div class="order-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-size:15px;font-weight:700;">${o.restaurant_name}</div>
            <div style="font-size:11px;color:#999;">${new Date(o.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
          </div>
          <span class="status-badge status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span>
        </div>
        <div style="font-size:12px;color:#777;margin-bottom:8px;">Kode: <b>${o.order_code}</b></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;font-weight:700;color:var(--green-dark);">Total: Rp ${Number(o.total).toLocaleString('id-ID')}</span>
          <a href="/order-status.html?code=${o.order_code}" style="font-size:12px;color:var(--green);font-weight:700;text-decoration:none;">Lihat Detail ›</a>
        </div>
      </div>
    `).join('');
  }

  init();
})();
