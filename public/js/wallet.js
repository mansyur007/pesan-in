(function () {
  if (!Auth.requireLogin()) return;
  const content = document.getElementById('walletContent');

  // Simulated rates (IDR)
  const RATES = { IDR: 1, GFC: 1000, USDT: 16200, BTC: 1620000000 };
  const ASSETS = [
    { key: 'idr_balance',  symbol: 'IDR',  name: 'Rupiah',        icon: '🇮🇩', color: '#E8F5EE', fmt: v => 'Rp ' + v.toLocaleString('id-ID') },
    { key: 'gfc_balance',  symbol: 'GFC',  name: 'GoFood Coin',   icon: '🪙', color: '#FFF3CD', fmt: v => v.toFixed(2) + ' GFC' },
    { key: 'usdt_balance', symbol: 'USDT', name: 'Tether',        icon: '₮',  color: '#D1ECF1', fmt: v => v.toFixed(4) + ' USDT' },
    { key: 'btc_balance',  symbol: 'BTC',  name: 'Bitcoin',       icon: '₿',  color: '#FDEBD0', fmt: v => v.toFixed(8) + ' BTC' },
  ];

  const TXN_ICONS = {
    topup: { cls: 'in', icon: '⬇️', label: 'Top Up' },
    payment: { cls: 'out', icon: '🛒', label: 'Pembayaran' },
    earning: { cls: 'gfc', icon: '🎁', label: 'Reward' },
    transfer_out: { cls: 'out', icon: '⬆️', label: 'Transfer Keluar' },
    transfer_in: { cls: 'in', icon: '⬇️', label: 'Transfer Masuk' },
  };

  async function init() {
    const data = await API.get('/wallet');
    render(data.wallet, data.transactions);
  }

  function portfolioIDR(wallet) {
    return (wallet.idr_balance || 0) +
      (wallet.gfc_balance || 0) * RATES.GFC +
      (wallet.usdt_balance || 0) * RATES.USDT +
      (wallet.btc_balance || 0) * RATES.BTC;
  }

  function render(wallet, txns) {
    const total = portfolioIDR(wallet);
    content.innerHTML = `
      <div class="wallet-hero">
        <div class="wallet-total-label">Total Portfolio</div>
        <div class="wallet-total">Rp ${total.toLocaleString('id-ID')}</div>
        <div class="wallet-sub">Saldo gabungan semua aset</div>
        <div class="action-bar">
          <button class="action-btn" onclick="openModal('topupModal')">⬇️<br>Top Up</button>
          <button class="action-btn" onclick="openModal('transferModal')">↗️<br>Transfer</button>
          <button class="action-btn" onclick="location.href='/order-history.html'">📋<br>Riwayat</button>
          <button class="action-btn" onclick="location.href='/driver-marketplace.html'">🚗<br>Hire Driver</button>
        </div>
      </div>

      <div style="padding:16px 16px 8px;font-size:13px;font-weight:700;color:#444;">Aset Digital</div>
      ${ASSETS.map(a => {
        const val = wallet[a.key] || 0;
        const idr = val * RATES[a.symbol];
        const pct = total > 0 ? ((idr / total) * 100).toFixed(1) : '0.0';
        return `
          <div class="asset-card">
            <div class="asset-icon" style="background:${a.color};">${a.icon}</div>
            <div class="asset-info">
              <div class="asset-symbol">${a.symbol}</div>
              <div class="asset-name">${a.name}</div>
            </div>
            <div class="asset-balance">
              <div class="asset-amount">${a.fmt(val)}</div>
              <div class="asset-idr">${a.symbol !== 'IDR' ? '≈ Rp ' + idr.toLocaleString('id-ID') : pct + '% portfolio'}</div>
            </div>
          </div>`;
      }).join('')}

      <div style="background:white;border-radius:14px;margin:16px 16px 0;box-shadow:0 1px 4px rgba(0,0,0,0.07);">
        <div style="padding:14px 16px 8px;font-size:13px;font-weight:700;color:#444;border-bottom:1px solid #f5f5f5;">Riwayat Transaksi</div>
        ${txns.length ? txns.map(t => {
          const cfg = TXN_ICONS[t.type] || { cls: 'in', icon: '💱', label: t.type };
          const isOut = t.type === 'payment' || t.type === 'transfer_out';
          const isGFC = t.currency === 'GFC';
          const amountStr = isGFC
            ? (isOut ? '-' : '+') + t.amount.toFixed(2) + ' GFC'
            : (isOut ? '-' : '+') + 'Rp ' + Number(t.amount).toLocaleString('id-ID');
          return `
            <div class="txn-row">
              <div class="txn-icon ${cfg.cls}">${cfg.icon}</div>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:600;">${t.description || cfg.label}</div>
                <div style="font-size:11px;color:#999;">${new Date(t.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
              </div>
              <div style="font-size:13px;font-weight:700;color:${isOut ? '#dc3545' : isGFC ? '#856404' : '#00AA5B'};">${amountStr}</div>
            </div>`;
        }).join('') : '<div style="padding:24px;text-align:center;color:#999;font-size:13px;">Belum ada transaksi</div>'}
      </div>
    `;
  }

  window.openModal = function(id) { document.getElementById(id).classList.add('open'); };
  window.closeModal = function(id) { document.getElementById(id).classList.remove('open'); };

  window.updateTopupHint = function() {
    const cur = document.getElementById('topupCurrency').value;
    const hints = { IDR: 'Min. Rp 10.000', GFC: '1 GFC ≈ Rp 1.000', USDT: '1 USDT ≈ Rp 16.200', BTC: '1 BTC ≈ Rp 1.62 Miliar' };
    document.getElementById('topupHint').textContent = hints[cur] || '';
  };

  window.doTopup = async function() {
    const currency = document.getElementById('topupCurrency').value;
    const amount = parseFloat(document.getElementById('topupAmount').value);
    const method = document.getElementById('topupMethod').value;
    if (!amount || amount <= 0) { showToast('Masukkan jumlah yang valid'); return; }
    try {
      await API.post('/wallet/topup', { amount, currency, method });
      showToast(`Top Up ${currency} berhasil!`);
      closeModal('topupModal');
      document.getElementById('topupAmount').value = '';
      init();
    } catch(e) { showToast(e.error || 'Gagal top up'); }
  };

  window.doTransfer = async function() {
    const currency = document.getElementById('transferCurrency').value;
    const to_email = document.getElementById('transferEmail').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);
    if (!to_email || !amount) { showToast('Lengkapi data transfer'); return; }
    try {
      await API.post('/wallet/transfer', { to_email, amount, currency });
      showToast('Transfer berhasil!');
      closeModal('transferModal');
      document.getElementById('transferEmail').value = '';
      document.getElementById('transferAmount').value = '';
      init();
    } catch(e) { showToast(e.error || 'Gagal transfer'); }
  };

  init();
})();
