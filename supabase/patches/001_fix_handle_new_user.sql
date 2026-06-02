-- Patch 001 — fix error "Database error saving new user" saat signup.
-- Jalankan sekali di Supabase SQL Editor.
--
-- Perubahan:
--   1. search_path diset ke public supaya enum user_role ketemu
--      saat function jalan sebagai security definer.
--   2. Role divalidasi eksplisit dengan fallback ke 'buyer' kalau invalid.
--   3. full_name punya multi-level fallback biar tidak pernah NULL.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role     public.user_role;
  v_meta_role text;
begin
  v_meta_role := new.raw_user_meta_data->>'role';

  if v_meta_role in ('merchant', 'buyer', 'driver') then
    v_role := v_meta_role::public.user_role;
  else
    v_role := 'buyer'::public.user_role;
  end if;

  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    v_role,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'User'
    )
  );
  return new;
end $$;

-- Pastikan trigger re-attached (kalau sudah ada, no-op).
drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Opsional: hapus extension postgis jika sempat ter-install dari schema awal.
-- Buka komentar baris di bawah ini kalau kamu mau membersihkan warning
-- "spatial_ref_sys RLS not enabled":
--
-- drop extension if exists postgis cascade;
