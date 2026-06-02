(function () {
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  if (!code) { location.href = '/'; return; }

  const content = document.getElementById('statusContent');
  let pollTimer = null;

  const STEPS = [
    { key: 'pending',   icon: '🕐', label: 'Pesanan Diterima',   desc: 'Menunggu konfirmasi restoran' },
    { key: 'confirmed', icon: '✅', label: 'Dikonfirmasi',        desc: 'Restoran menerima pesanan' },
    { key: 'preparing', icon: '👨‍🍳', label: 'Sedang Dimasak',     desc: 'Dapur sedang mempersiapkan' },
    { key: 'ready',     icon: '📦', label: 'Siap Diantarkan',     desc: 'Pesanan siap dijemput kurir' },
    { key: 'picked_up', icon: '🛵', label: 'Dalam Perjalanan',    desc: 'Kurir menuju lokasi kamu' },
    { key: 'delivered', icon: '🎉', label: 'Pesanan Tiba',        desc: 'Selamat menikmati!' },
  ];

  const STATUS_ORDER = STEPS.map(s => s.key);

  async function load() {
    try {
      const order = await API.get(`/orders/${code}`);
      render(order);
      if (order.status !== 'delivered' && order.status !== 'cancelled') {
        clearTimeout(pollTimer);
        pollTimer = setTimeout(load, 30000);
      }
    } catch (e) {
      content.innerHTML = `<div class="empty-state" style="padding-top:80px"><div class="icon">😕</div><div>Pesanan tidak ditemukan</div><br><a href="/" style="color:var(--green)">Kembali ke Beranda</a></div>`;
    }
  }

  function render(order) {
    const currentIdx = STATUS_ORDER.indexOf(order.status);
    const cancelled = order.status === 'cancelled';

    const stepsHtml = cancelled
      ? `<div style="text-align:center;padding:20px 0;color:#721C24;">
           <div style="font-size:48px;margin-bottom:8px;">❌</div>
           <div style="font-weight:700;font-size:16px;">Pesanan Dibatalkan</div>
         </div>`
      : STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return `
            <div class="status-step${done ? ' done' : ''}">
              <div class="status-dot${done ? ' done' : active ? ' active' : ''}">
                ${done ? '✓' : step.icon}
              </div>
              <div style="padding-top:4px;">
                <div style="font-size:14px;font-weight:${active ? '700' : '500'};color:${active ? '#1A1A1A' : done ? '#555' : '#AAA'};">${step.label}</div>
                <div style="font-size:12px;color:${active ? '#555' : '#BBB'};">${step.desc}</div>
              </div>
            </div>`;
        }).join('');

    content.innerHTML = `
      <div class="order-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:12px;color:#999;">Kode Pesanan</span>
          <span style="font-size:13px;font-weight:700;color:var(--green-dark);">${order.order_code}</span>
        </div>
        <div style="font-size:16px;font-weight:800;margin-bottom:2px;">${order.restaurant_name}</div>
        <div style="font-size:12px;color:#777;">${order.restaurant_address || ''}</div>
      </div>

      <div class="order-card">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:14px;">Status Pesanan</div>
        ${stepsHtml}
      </div>

      <div class="order-card">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:10px;">Detail Pesanan</div>
        ${order.items.map(i => `
          <div class="order-item-row">
            <span>${i.quantity}x ${i.menu_item_name}</span>
            <span>${formatRupiah(i.subtotal)}</span>
          </div>`).join('')}
        <div class="summary-row" style="margin-top:8px;"><span>Subtotal</span><span>${formatRupiah(order.subtotal)}</span></div>
        <div class="summary-row"><span>Ongkos Kirim</span><span>${formatRupiah(order.delivery_fee)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatRupiah(order.total)}</span></div>
      </div>

      <div class="order-card">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:8px;">Informasi Pengiriman</div>
        <div style="font-size:13px;color:#555;margin-bottom:4px;">👤 ${order.customer_name}</div>
        <div style="font-size:13px;color:#555;margin-bottom:4px;">📞 ${order.customer_phone}</div>
        <div style="font-size:13px;color:#555;">📍 ${order.customer_address}</div>
        ${order.notes ? `<div style="font-size:12px;color:#777;margin-top:6px;">📝 ${order.notes}</div>` : ''}
      </div>

      <div style="padding:16px;text-align:center;">
        <a href="/" class="btn-primary" style="display:inline-block;text-decoration:none;padding:12px 32px;width:auto;">Pesan Lagi</a>
      </div>
    `;
  }

  load();
})();
