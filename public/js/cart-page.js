(function () {
  const content = document.getElementById('cartContent');
  let restaurant = null;
  let walletBalance = 0;
  let payMethod = 'cash'; // 'cash' | 'wallet'

  async function init() {
    const cart = Cart.get();
    if (!cart.restaurantId || !cart.items.length) {
      renderEmpty();
      return;
    }

    const fetches = [API.get(`/restaurants/${cart.restaurantId}`)];
    if (Auth.isLoggedIn()) {
      fetches.push(API.get('/auth/me').catch(() => null));
      fetches.push(API.get('/wallet').catch(() => null));
    }

    const [rest, profile, walletData] = await Promise.all(fetches);
    restaurant = rest;
    if (walletData) walletBalance = walletData.wallet?.idr_balance || 0;

    render(cart, restaurant, profile);
  }

  function renderEmpty() {
    content.innerHTML = `
      <div class="empty-state" style="padding-top:80px">
        <div class="icon">🛒</div>
        <div style="font-weight:600;margin-bottom:8px;">Keranjang kosong</div>
        <a href="/" style="color:var(--green);font-size:14px;">Cari restoran</a>
      </div>`;
  }

  function render(cart, r, profile) {
    const subtotal = Cart.total();
    const deliveryFee = r.delivery_fee;
    const total = subtotal + deliveryFee;
    const walletOk = Auth.isLoggedIn() && walletBalance >= total;

    content.innerHTML = `
      <div class="section-card">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:10px;">📍 Dari ${r.name}</div>
        ${cart.items.map(item => `
          <div class="cart-item-row">
            <div class="qty-control">
              <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn add" onclick="changeQty(${item.id},1)">+</button>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:14px;font-weight:600;">${item.name}</div>
            </div>
            <div style="font-size:13px;font-weight:700;color:var(--green-dark);white-space:nowrap;">${formatRupiah(item.price * item.quantity)}</div>
          </div>`).join('')}
      </div>

      <div class="section-card">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:10px;">Ringkasan Pembayaran</div>
        <div class="summary-row"><span>Subtotal</span><span>${formatRupiah(subtotal)}</span></div>
        <div class="summary-row"><span>Ongkos Kirim</span><span>${formatRupiah(deliveryFee)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatRupiah(total)}</span></div>
      </div>

      <div class="section-card">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:12px;">Metode Pembayaran</div>
        <div class="pay-method">
          ${Auth.isLoggedIn() ? `
            <button class="pay-btn${payMethod==='wallet'?' active':''}" id="payWallet" onclick="setPayMethod('wallet')">
              <span class="pay-icon">💳</span>
              <span>Saldo Dompet</span>
              <div class="wallet-balance-badge">${formatRupiah(walletBalance)}</div>
              ${!walletOk ? '<div style="font-size:10px;color:#dc3545;margin-top:3px;">Saldo kurang</div>' : ''}
            </button>` : ''}
          <button class="pay-btn${payMethod==='cash'?' active':''}" id="payCash" onclick="setPayMethod('cash')">
            <span class="pay-icon">💵</span>
            <span>Bayar di Tempat</span>
            <div style="font-size:10px;color:#888;margin-top:3px;">Tunai / QRIS</div>
          </button>
        </div>
        ${Auth.isLoggedIn() && !walletOk ? `
          <a href="/wallet.html" style="display:block;text-align:center;font-size:12px;color:var(--green);font-weight:700;padding:6px;">
            + Top Up Saldo Dompet
          </a>` : ''}
      </div>

      <div class="section-card">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:12px;">Data Pengiriman</div>
        <div class="form-group">
          <label class="form-label">Nama</label>
          <input class="form-input" id="custName" type="text" placeholder="Nama lengkap" value="${profile?.name || ''}" autocomplete="name">
        </div>
        <div class="form-group">
          <label class="form-label">No. HP</label>
          <input class="form-input" id="custPhone" type="tel" placeholder="08xxxxxxxxxx" value="${profile?.phone || ''}" autocomplete="tel">
        </div>
        <div class="form-group">
          <label class="form-label">Alamat Pengiriman</label>
          <textarea class="form-input" id="custAddress" rows="3" placeholder="Alamat lengkap..." style="resize:none">${profile?.address || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Catatan (opsional)</label>
          <input class="form-input" id="custNotes" type="text" placeholder="Contoh: tidak pakai bawang">
        </div>
      </div>

      <div style="height:80px"></div>
      <div class="sticky-bottom">
        <button class="btn-primary" id="orderBtn" onclick="submitOrder()">
          ${payMethod === 'wallet' ? '💳 Bayar Sekarang' : '🛒 Pesan Sekarang'} · ${formatRupiah(total)}
        </button>
      </div>
    `;
  }

  window.setPayMethod = function(method) {
    if (method === 'wallet' && !Auth.isLoggedIn()) {
      location.href = '/auth.html?redirect=/cart.html';
      return;
    }
    payMethod = method;
    // Re-render to reflect selection (cheaply update buttons only)
    const cart = Cart.get();
    if (!cart.restaurantId || !restaurant) return;
    render(cart, restaurant, null);
    // Restore form values
  };

  window.changeQty = function(itemId, delta) {
    const cart = Cart.get();
    if (!cart.restaurantId) return;
    if (delta > 0) {
      const item = cart.items.find(i => i.id === itemId);
      if (item) Cart.addItem(cart.restaurantId, cart.restaurantName, item);
    } else {
      Cart.removeItem(cart.restaurantId, itemId);
    }
    const updated = Cart.get();
    if (!updated.items.length) { renderEmpty(); return; }
    render(updated, restaurant, null);
  };

  window.submitOrder = async function() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const notes = document.getElementById('custNotes').value.trim();
    if (!name || !phone || !address) {
      showToast('Lengkapi data pengiriman');
      return;
    }

    const cart = Cart.get();
    const total = Cart.total() + (restaurant?.delivery_fee || 0);

    if (payMethod === 'wallet') {
      if (!Auth.isLoggedIn()) { location.href = '/auth.html?redirect=/cart.html'; return; }
      if (walletBalance < total) { showToast('Saldo tidak cukup. Top up dulu ya!'); return; }
    }

    const btn = document.getElementById('orderBtn');
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
      const result = await API.post('/orders', {
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        restaurant_id: cart.restaurantId,
        items: cart.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity })),
        notes,
        payment_method: payMethod,
      });
      Cart.clear();
      location.href = `/order-status.html?code=${result.order_code}`;
    } catch (e) {
      btn.disabled = false;
      btn.textContent = payMethod === 'wallet' ? `💳 Bayar Sekarang · ${formatRupiah(total)}` : `🛒 Pesan Sekarang · ${formatRupiah(total)}`;
      showToast(e.error || 'Gagal membuat pesanan');
    }
  };

  init();
})();
