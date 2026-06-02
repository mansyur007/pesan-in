-- ============================================================================
-- Pesanin — SEED DATA (demo)
--
-- Cara pakai:
--   1. GANTI nilai `:merchant_email` di baris di bawah dengan email
--      user yang sudah kamu daftarkan dan ingin dijadikan merchant.
--   2. Paste seluruh file ini ke Supabase SQL Editor → Run.
--
-- Apa yang akan diisi:
--   - 1 merchant beserta 5 menu item (owner = user email yang kamu masukkan)
--   - Role user itu akan di-update jadi 'merchant' (kalau sebelumnya beda)
--
-- Aman dijalankan berulang: pakai ON CONFLICT / idempotent.
-- ============================================================================

do $$
declare
  v_email      text := 'mhidayat.id@gmail.com';  -- <<< EDIT DI SINI
  v_user_id    uuid;
  v_merchant_id uuid;
begin
  -- 1. Cari user berdasarkan email
  select id into v_user_id from auth.users where email = v_email;
  if v_user_id is null then
    raise exception 'Tidak ada user dengan email %. Daftar dulu lewat /register.', v_email;
  end if;

  -- 2. Pastikan role = merchant
  update public.profiles set role = 'merchant' where id = v_user_id;

  -- 3. Upsert merchant (1 toko per user ini, cek by name)
  select id into v_merchant_id
  from public.merchants
  where owner_id = v_user_id and name = 'Kedai Gunungpati';

  if v_merchant_id is null then
    insert into public.merchants (owner_id, name, description, address, latitude, longitude, is_open)
    values (
      v_user_id,
      'Kedai Gunungpati',
      'Makanan rumahan khas Gunungpati, porsi mahasiswa.',
      'Jl. Pawiyatan Luhur Sel. No.12, Gunungpati, Semarang',
      -7.0695, 110.3942,
      true
    )
    returning id into v_merchant_id;
  end if;

  -- 4. Seed menu (hapus dulu yang lama biar idempotent)
  delete from public.menu_items where merchant_id = v_merchant_id;

  insert into public.menu_items (merchant_id, name, description, price, is_available) values
    (v_merchant_id, 'Nasi Ayam Bakar',     'Ayam bakar bumbu kecap, nasi putih, lalapan', 18000, true),
    (v_merchant_id, 'Nasi Goreng Spesial', 'Nasi goreng telur + ayam suwir',              15000, true),
    (v_merchant_id, 'Mie Ayam Bakso',      'Mie ayam + 3 bakso',                          14000, true),
    (v_merchant_id, 'Es Teh Manis',        'Segar dingin',                                 4000, true),
    (v_merchant_id, 'Es Jeruk',            'Jeruk peras segar',                            6000, true);

  raise notice 'Seed selesai. merchant_id = %, jumlah menu = 5', v_merchant_id;
end $$;
