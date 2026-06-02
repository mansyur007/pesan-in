(function () {
  if (!Auth.requireLogin()) return;
  const content = document.getElementById('profileContent');
  const AVATARS = ['😊','😎','🧑','👩','👨','🧔','👱','🙂','😄','🤩','🥳','😇'];
  const ROLE_LABELS = { customer: '🛒 Customer', driver: '🛵 Driver', admin: '⚙️ Admin' };
  let user = null;

  async function init() {
    user = await API.get('/auth/me');
    render(user);
  }

  function render(u) {
    content.innerHTML = `
      <div class="profile-hero">
        <div class="avatar-big">${u.avatar || '😊'}</div>
        <div style="font-size:20px;font-weight:800;">${u.name}</div>
        <div style="font-size:13px;opacity:0.85;margin-top:2px;">${u.email}</div>
        <div class="role-badge">${ROLE_LABELS[u.role] || u.role}</div>
      </div>

      <div class="section-card">
        <a class="menu-row" href="/wallet.html"><span class="icon">💳</span><span class="label">Dompet & Saldo</span><span class="arrow">›</span></a>
        <a class="menu-row" href="/order-history.html"><span class="icon">📋</span><span class="label">Riwayat Pesanan</span><span class="arrow">›</span></a>
        ${u.role === 'driver' ? '<a class="menu-row" href="/driver-dashboard.html"><span class="icon">🛵</span><span class="label">Dashboard Driver</span><span class="arrow">›</span></a>' : ''}
        <a class="menu-row" href="/driver-marketplace.html"><span class="icon">🚗</span><span class="label">Cari Driver</span><span class="arrow">›</span></a>
      </div>

      <div class="section-card" style="padding:16px;">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:14px;">Edit Profil</div>
        <div class="form-group">
          <label class="form-label">Nama</label>
          <input class="form-input" id="editName" value="${u.name}" type="text">
        </div>
        <div class="form-group">
          <label class="form-label">No. HP</label>
          <input class="form-input" id="editPhone" value="${u.phone || ''}" type="tel">
        </div>
        <div class="form-group">
          <label class="form-label">Alamat</label>
          <textarea class="form-input" id="editAddress" rows="2" style="resize:none">${u.address || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Avatar</label>
          <div class="avatar-grid" id="avatarGrid"></div>
        </div>
        <button class="btn-primary" onclick="saveProfile()">Simpan Perubahan</button>
      </div>

      <div class="section-card" style="padding:16px;">
        <div style="font-size:13px;font-weight:700;color:#444;margin-bottom:14px;">Ubah Password</div>
        <div class="form-group">
          <label class="form-label">Password Saat Ini</label>
          <input class="form-input" id="curPwd" type="password" placeholder="Password lama">
        </div>
        <div class="form-group">
          <label class="form-label">Password Baru</label>
          <input class="form-input" id="newPwd" type="password" placeholder="Minimal 6 karakter">
        </div>
        <button class="btn-primary" style="background:#555;" onclick="changePassword()">Ubah Password</button>
      </div>

      <div class="section-card" style="padding:16px;">
        <div style="font-size:12px;color:#999;margin-bottom:6px;">Bergabung sejak ${new Date(u.created_at).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})}</div>
        <button onclick="Auth.logout()" style="width:100%;padding:12px;border:2px solid #F8D7DA;border-radius:12px;background:white;color:#721C24;font-weight:700;font-size:14px;cursor:pointer;">Keluar</button>
      </div>
    `;

    // Build avatar grid
    const grid = document.getElementById('avatarGrid');
    AVATARS.forEach(a => {
      const el = document.createElement('span');
      el.className = 'avatar-opt' + (a === u.avatar ? ' selected' : '');
      el.textContent = a;
      el.onclick = () => {
        grid.querySelectorAll('.avatar-opt').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
      };
      grid.appendChild(el);
    });
  }

  window.saveProfile = async function () {
    const selected = document.querySelector('.avatar-opt.selected');
    const avatar = selected ? selected.textContent : user.avatar;
    try {
      await API.put('/auth/profile', {
        name: document.getElementById('editName').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        address: document.getElementById('editAddress').value.trim(),
        avatar,
      });
      showToast('Profil berhasil disimpan');
      user = await API.get('/auth/me');
      Auth.save(Auth.getToken(), user);
      render(user);
    } catch(e) { showToast(e.error || 'Gagal menyimpan'); }
  };

  window.changePassword = async function () {
    const cur = document.getElementById('curPwd').value;
    const nw = document.getElementById('newPwd').value;
    if (!cur || !nw) { showToast('Isi password lama dan baru'); return; }
    try {
      await API.put('/auth/password', { current_password: cur, new_password: nw });
      showToast('Password berhasil diubah');
      document.getElementById('curPwd').value = '';
      document.getElementById('newPwd').value = '';
    } catch(e) { showToast(e.error || 'Gagal ubah password'); }
  };

  init();
})();
