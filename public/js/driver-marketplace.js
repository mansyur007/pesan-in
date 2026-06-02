(function () {
  const listEl = document.getElementById('driversList');
  let allDrivers = [];
  let selectedDriver = null;

  async function init() {
    allDrivers = await API.get('/drivers');
    renderDrivers();
  }

  window.renderDrivers = function () {
    const vehicleFilter = document.getElementById('vehicleFilter').value;
    const sort = document.getElementById('sortFilter').value;
    let drivers = allDrivers.filter(d => !vehicleFilter || d.vehicle_type === vehicleFilter);
    if (sort === 'price') drivers.sort((a, b) => a.price_per_km - b.price_per_km);
    else if (sort === 'trips') drivers.sort((a, b) => b.total_trips - a.total_trips);
    else drivers.sort((a, b) => b.rating - a.rating);

    if (!drivers.length) {
      listEl.innerHTML = `<div class="empty-state" style="padding:60px 20px"><div class="icon">🛵</div><div>Belum ada driver tersedia</div></div>`;
      return;
    }

    listEl.innerHTML = drivers.map(d => {
      const vehicleIcon = d.vehicle_type === 'mobil' ? '🚗' : '🛵';
      const stars = '⭐'.repeat(Math.round(d.rating));
      return `
        <div class="driver-card">
          <div style="display:flex;gap:14px;margin-bottom:12px;">
            <div class="driver-avatar">${d.avatar || '😊'}</div>
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:15px;font-weight:700;">${d.name}</span>
                <span class="vehicle-badge">${vehicleIcon} ${d.vehicle_type}</span>
                ${d.is_available ? '<span style="background:#D4EDDA;color:#155724;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700;">Online</span>' : '<span style="background:#f8d7da;color:#721c24;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700;">Offline</span>'}
              </div>
              <div style="font-size:12px;color:#777;margin-bottom:2px;">${d.vehicle_model || '—'} · ${d.vehicle_plate || '—'}</div>
              <div style="font-size:12px;color:#555;">${stars} ${d.rating.toFixed(1)} · ${d.total_trips} trip</div>
            </div>
          </div>
          ${d.bio ? `<div style="font-size:12px;color:#777;margin-bottom:10px;padding:8px;background:#f9f9f9;border-radius:8px;">"${d.bio}"</div>` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div class="price-tag">Rp ${Number(d.base_price).toLocaleString('id-ID')} + Rp ${Number(d.price_per_km).toLocaleString('id-ID')}/km</div>
            </div>
            ${d.is_available
              ? `<button class="btn-primary" style="width:auto;padding:9px 20px;font-size:13px;" onclick="openBookModal(${d.id})">Pesan</button>`
              : `<button style="padding:9px 20px;border-radius:20px;border:none;background:#eee;color:#999;font-size:13px;font-weight:700;cursor:not-allowed;">Tidak Tersedia</button>`
            }
          </div>
        </div>`;
    }).join('');
  };

  window.openBookModal = function(driverId) {
    selectedDriver = allDrivers.find(d => d.id === driverId);
    if (!selectedDriver) return;
    if (!Auth.isLoggedIn()) { location.href = '/auth.html?redirect=/driver-marketplace.html'; return; }
    document.getElementById('bookDriverName').textContent = `Pesan ${selectedDriver.name}`;
    document.getElementById('bookDriverInfo').textContent =
      `${selectedDriver.vehicle_type === 'mobil' ? '🚗' : '🛵'} ${selectedDriver.vehicle_model || ''} ${selectedDriver.vehicle_plate || ''} · Rp ${Number(selectedDriver.base_price).toLocaleString('id-ID')} + Rp ${Number(selectedDriver.price_per_km).toLocaleString('id-ID')}/km`;
    document.getElementById('pricePreviewAmt').textContent = '—';
    document.getElementById('bookDistance').value = '';
    document.getElementById('bookPickup').value = '';
    document.getElementById('bookDropoff').value = '';
    document.getElementById('bookNotes').value = '';
    document.getElementById('bookModal').classList.add('open');
  };

  window.closeBookModal = function() {
    document.getElementById('bookModal').classList.remove('open');
    selectedDriver = null;
  };

  window.updatePricePreview = function() {
    if (!selectedDriver) return;
    const km = parseFloat(document.getElementById('bookDistance').value) || 0;
    const price = Math.round(selectedDriver.base_price + selectedDriver.price_per_km * km);
    document.getElementById('pricePreviewAmt').textContent = 'Rp ' + price.toLocaleString('id-ID');
  };

  window.doBook = async function() {
    if (!selectedDriver) return;
    const pickup = document.getElementById('bookPickup').value.trim();
    const dropoff = document.getElementById('bookDropoff').value.trim();
    const km = parseFloat(document.getElementById('bookDistance').value) || 1;
    const notes = document.getElementById('bookNotes').value.trim();
    if (!pickup || !dropoff) { showToast('Isi alamat jemput dan tujuan'); return; }
    const btn = document.getElementById('bookBtn');
    btn.disabled = true; btn.textContent = 'Memproses...';
    try {
      const res = await API.post('/drivers/book', {
        driver_id: selectedDriver.id,
        pickup_address: pickup,
        dropoff_address: dropoff,
        distance_km: km,
        notes,
      });
      closeBookModal();
      showToast(`Driver ${res.driver_name} berhasil dipesan! Total: Rp ${Number(res.total_price).toLocaleString('id-ID')}`);
      init();
    } catch(e) {
      showToast(e.error || 'Gagal memesan driver');
    }
    btn.disabled = false; btn.textContent = 'Pesan Driver';
  };

  init();
})();
