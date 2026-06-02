(function () {
  if (!Auth.requireLogin()) return;
  let profile = null;
  let orders = [];
  let walletData = null;

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.panel).classList.add('active');
    });
  });

  const STATUS_LABELS = { pending: 'Menunggu', accepted: 'Diterima', picked_up: 'Dijemput', delivered: 'Selesai', cancelled: 'Dibatalkan' };
  const NEXT = { pending: 'accepted', accepted: 'picked_up', picked_up: 'delivered' };

  async function init() {
    const user = Auth.getUser();
    // Auto-create driver profile if role is driver
    if (user?.role !== 'driver') {
      document.getElementById('panel-status').innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <div style="font-size:48px;margin-bottom:12px;">🛵</div>
          <div style="font-weight:700;font-size:16px;margin-bottom:8px;">Daftar sebagai Driver</div>
          <div style="font-size:13px;color:#777;margin-bottom:20px;">Isi data kendaraan kamu di tab Pengaturan untuk mulai menerima pesanan</div>
        </div>`;
    }
    try {
      [profile, walletData] = await Promise.all([
        API.get('/drivers/me').catch(() => null),
        API.get('/wallet').catch(() => null),
      ]);
    } catch {}
    if (profile) {
      orders = await API.get('/drivers/orders').catch(() => []);
    }
    renderStats();
    renderStatus();
    renderOrders();
    renderSettings();
  }

  function renderStats() {
    if (!profile || !walletData) return;
    const earnings = (walletData.transactions || [])
      .filter(t => t.type === 'earning' && t.currency === 'IDR')
      .reduce((s, t) => s + t.amount, 0);
    document.getElementById('statsBar').innerHTML = `
      <div class="stat-item"><div class="stat-val">${profile.total_trips}</div><div class="stat-label">Total Trip</div></div>
      <div class="stat-item"><div class="stat-val">⭐${profile.rating.toFixed(1)}</div><div class="stat-label">Rating</div></div>
      <div class="stat-item"><div class="stat-val" style="font-size:13px;">Rp ${earnings.toLocaleString('id-ID')}</div><div class="stat-label">Pendapatan</div></div>
    `;
  }

  function renderStatus() {
    const el = document.getElementById('panel-status');
    if (!profile) {
      el.innerHTML = `<div style="text-align:center;padding:40px 20px;"><div style="font-size:48px;">🛵</div><div style="font-weight:700;margin-top:8px;">Lengkapi profil driver di tab Pengaturan</div></div>`;
      return;
    }
    const activeOrders = orders.filter(o => ['pending','accepted','picked_up'].includes(o.status));
    el.innerHTML = `
      <div class="availability-toggle">
        <div>
          <div style="font-size:15px;font-weight:700;">${profile.is_available ? '🟢 Kamu Online' : '⚫ Kamu Offline'}</div>
          <div style="font-size:12px;color:#777;">${profile.is_available ? 'Siap menerima pesanan' : 'Tidak terlihat oleh customer'}</div>
        </div>
        <button class="toggle-switch ${profile.is_available ? 'on' : 'off'}" onclick="toggleAvail()">${profile.is_available ? 'ON' : 'OFF'}</button>
      </div>

      <div class="earnings-card">
        <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Saldo Driver</div>
        <div style="font-size:24px;font-weight:900;">Rp ${(walletData?.wallet?.idr_balance || 0).toLocaleString('id-ID')}</div>
        <div style="font-size:12px;opacity:0.7;margin-top:4px;">
          Tarif: Rp ${Number(profile.base_price).toLocaleString('id-ID')} + Rp ${Number(profile.price_per_km).toLocaleString('id-ID')}/km
        </div>
      </div>

      <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:10px;">Pesanan Aktif (${activeOrders.length})</div>
      ${activeOrders.length ? activeOrders.map(o => orderCardHTML(o)).join('') : '<div style="text-align:center;padding:24px;color:#999;font-size:13px;">Tidak ada pesanan aktif</div>'}
    `;
  }

  function orderCardHTML(o) {
    const next = NEXT[o.status];
    return `
      <div class="order-card">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;font-weight:700;">${o.customer_avatar || '😊'} ${o.customer_name}</span>
          <span class="status-badge status-${o.status === 'delivered' ? 'delivered' : o.status === 'cancelled' ? 'cancelled' : 'pending'}">${STATUS_LABELS[o.status]}</span>
        </div>
        <div style="font-size:12px;color:#555;margin-bottom:2px;">📍 Dari: ${o.pickup_address}</div>
        <div style="font-size:12px;color:#555;margin-bottom:6px;">🏁 Ke: ${o.dropoff_address}</div>
        <div style="font-size:12px;color:#777;margin-bottom:8px;">📏 ${o.distance_km} km · 💰 Rp ${Number(o.total_price).toLocaleString('id-ID')}</div>
        ${o.notes ? `<div style="font-size:12px;color:#888;margin-bottom:8px;">📝 ${o.notes}</div>` : ''}
        <div style="display:flex;gap:8px;">
          ${next ? `<button class="btn-primary" style="flex:1;padding:9px;font-size:12px;" onclick="updateOrderStatus(${o.id},'${next}')">→ ${STATUS_LABELS[next]}</button>` : ''}
          ${o.status !== 'delivered' && o.status !== 'cancelled' ? `<button onclick="updateOrderStatus(${o.id},'cancelled')" style="padding:9px 14px;border-radius:20px;border:1.5px solid #F8D7DA;background:white;color:#721C24;font-size:12px;font-weight:700;cursor:pointer;">Batal</button>` : ''}
        </div>
      </div>`;
  }

  function renderOrders() {
    const el = document.getElementById('panel-orders');
    const done = orders.filter(o => ['delivered','cancelled'].includes(o.status));
    const all = orders;
    if (!all.length) {
      el.innerHTML = `<div style="text-align:center;padding:40px;color:#999;">Belum ada riwayat pesanan</div>`;
      return;
    }
    el.innerHTML = all.map(o => `
      <div class="order-card">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:700;">${o.customer_avatar || '😊'} ${o.customer_name}</span>
          <span class="status-badge status-${o.status === 'delivered' ? 'delivered' : o.status === 'cancelled' ? 'cancelled' : 'confirmed'}">${STATUS_LABELS[o.status]}</span>
        </div>
        <div style="font-size:12px;color:#555;">📍 ${o.pickup_address} → ${o.dropoff_address}</div>
        <div style="font-size:12px;color:var(--green-dark);font-weight:700;margin-top:4px;">+Rp ${Number(o.total_price).toLocaleString('id-ID')}</div>
        <div style="font-size:11px;color:#aaa;margin-top:2px;">${new Date(o.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</div>
      </div>`).join('');
  }

  function renderSettings() {
    const el = document.getElementById('panel-settings');
    const p = profile || {};
    el.innerHTML = `
      <div style="background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.07);margin-bottom:12px;">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:14px;">Informasi Kendaraan</div>
        <div class="form-group">
          <label class="form-label">Jenis Kendaraan</label>
          <select class="form-input" id="vType">
            <option value="motor" ${p.vehicle_type==='motor'?'selected':''}>🛵 Motor</option>
            <option value="mobil" ${p.vehicle_type==='mobil'?'selected':''}>🚗 Mobil</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Plat Nomor</label>
          <input class="form-input" id="vPlate" value="${p.vehicle_plate||''}" placeholder="AB 1234 CD">
        </div>
        <div class="form-group">
          <label class="form-label">Model Kendaraan</label>
          <input class="form-input" id="vModel" value="${p.vehicle_model||''}" placeholder="Honda Vario 125">
        </div>
      </div>
      <div style="background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.07);margin-bottom:12px;">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:14px;">Penetapan Harga</div>
        <div class="form-group">
          <label class="form-label">Harga Dasar (IDR)</label>
          <input class="form-input" id="basePrice" type="number" value="${p.base_price||5000}" placeholder="5000">
          <div style="font-size:11px;color:#999;margin-top:3px;">Biaya minimal per perjalanan</div>
        </div>
        <div class="form-group">
          <label class="form-label">Harga per KM (IDR)</label>
          <input class="form-input" id="priceKm" type="number" value="${p.price_per_km||3000}" placeholder="3000">
          <div style="font-size:11px;color:#999;margin-top:3px;">Biaya tambahan per kilometer</div>
        </div>
        <div style="background:var(--green-light);border-radius:10px;padding:10px;margin-top:8px;font-size:12px;color:var(--green-dark);">
          Contoh: 5 km = Rp <span id="priceExample">—</span>
        </div>
      </div>
      <div style="background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.07);margin-bottom:12px;">
        <div class="form-group">
          <label class="form-label">Bio / Perkenalan</label>
          <textarea class="form-input" id="driverBio" rows="3" placeholder="Ceritakan sedikit tentang kamu...">${p.bio||''}</textarea>
        </div>
      </div>
      <button class="btn-primary" onclick="saveSettings()">Simpan Pengaturan</button>
    `;
    updateExample();
    document.getElementById('basePrice').addEventListener('input', updateExample);
    document.getElementById('priceKm').addEventListener('input', updateExample);
  }

  function updateExample() {
    const base = parseInt(document.getElementById('basePrice')?.value) || 0;
    const pkm = parseInt(document.getElementById('priceKm')?.value) || 0;
    const ex = document.getElementById('priceExample');
    if (ex) ex.textContent = (base + pkm * 5).toLocaleString('id-ID');
  }

  window.toggleAvail = async function() {
    if (!profile) return;
    await API.put('/drivers/me', { is_available: profile.is_available ? 0 : 1 });
    profile.is_available = profile.is_available ? 0 : 1;
    renderStatus();
    showToast(profile.is_available ? 'Kamu sekarang Online' : 'Kamu sekarang Offline');
  };

  window.updateOrderStatus = async function(id, status) {
    await API.put(`/drivers/orders/${id}/status`, { status });
    orders = await API.get('/drivers/orders');
    renderStats();
    renderStatus();
    renderOrders();
    showToast('Status diperbarui');
  };

  window.saveSettings = async function() {
    try {
      await API.put('/drivers/me', {
        vehicle_type: document.getElementById('vType').value,
        vehicle_plate: document.getElementById('vPlate').value,
        vehicle_model: document.getElementById('vModel').value,
        base_price: parseInt(document.getElementById('basePrice').value) || 5000,
        price_per_km: parseInt(document.getElementById('priceKm').value) || 3000,
        bio: document.getElementById('driverBio').value,
      });
      showToast('Pengaturan disimpan');
      profile = await API.get('/drivers/me');
      renderStats();
      renderStatus();
    } catch(e) { showToast(e.error || 'Gagal menyimpan'); }
  };

  init();
})();
