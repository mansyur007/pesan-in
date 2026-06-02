-- ============================================================================
-- Pesanin — Supabase schema (MVP)
-- 3 role: merchant, buyer, driver. Blockchain logic via Polygon (off-chain
-- reference: tx_hash disimpan di orders).
--
-- Jalankan seluruh file ini di Supabase SQL editor.
-- ============================================================================

create extension if not exists "uuid-ossp";
-- postgis sengaja TIDAK dipakai; lat/lng disimpan sebagai double precision biasa.
-- Menghindari tabel bantu seperti spatial_ref_sys yang bikin warning RLS.

-- --------------------------------------------------------------------------
-- ENUMS
-- --------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('merchant', 'buyer', 'driver');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending_payment',   -- belum bayar
    'paid',              -- bayar masuk escrow on-chain
    'accepted_merchant', -- merchant accept
    'ready_for_pickup',  -- makanan siap
    'picked_up',         -- driver pickup
    'delivered',         -- selesai, dana auto-distribute
    'cancelled'
  );
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------------------
-- PROFILES — extend auth.users, simpan role + wallet
-- --------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role not null,
  full_name       text not null,
  phone           text,
  wallet_address  text,                     -- Polygon wallet (0x...)
  avatar_url      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_wallet on public.profiles(wallet_address);

-- --------------------------------------------------------------------------
-- MERCHANTS — data resto per merchant user
-- --------------------------------------------------------------------------
create table if not exists public.merchants (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  description     text,
  address         text not null,
  latitude        double precision not null,
  longitude       double precision not null,
  cover_image_url text,
  is_open         boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists idx_merchants_owner on public.merchants(owner_id);
create index if not exists idx_merchants_geo on public.merchants(latitude, longitude);

-- --------------------------------------------------------------------------
-- MENU ITEMS
-- --------------------------------------------------------------------------
create table if not exists public.menu_items (
  id           uuid primary key default uuid_generate_v4(),
  merchant_id  uuid not null references public.merchants(id) on delete cascade,
  name         text not null,
  description  text,
  price        numeric(12,2) not null check (price >= 0),
  image_url    text,
  is_available boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists idx_menu_merchant on public.menu_items(merchant_id);

-- --------------------------------------------------------------------------
-- DRIVERS — data tambahan driver (lokasi realtime, status)
-- --------------------------------------------------------------------------
create table if not exists public.drivers (
  id              uuid primary key references public.profiles(id) on delete cascade,
  vehicle_plate   text,
  is_online       boolean not null default false,
  current_lat     double precision,
  current_lng     double precision,
  updated_at      timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- ORDERS
-- --------------------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default uuid_generate_v4(),
  buyer_id          uuid not null references public.profiles(id),
  merchant_id       uuid not null references public.merchants(id),
  driver_id         uuid references public.profiles(id),

  -- alamat antar
  delivery_address  text not null,
  delivery_lat      double precision not null,
  delivery_lng      double precision not null,

  -- breakdown biaya (semua dalam IDR; di chain dikonversi ke token/native)
  subtotal          numeric(12,2) not null,  -- total harga makanan → ke merchant
  delivery_fee      numeric(12,2) not null,  -- ongkir → ke driver
  gas_fee           numeric(12,2) not null default 0, -- estimasi gas Polygon (ditanggung buyer)
  total             numeric(12,2) not null,

  -- blockchain refs
  tx_hash_payment    text,   -- hash tx bayar ke escrow
  tx_hash_settlement text,   -- hash tx distribusi saldo

  status            order_status not null default 'pending_payment',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_orders_buyer on public.orders(buyer_id);
create index if not exists idx_orders_merchant on public.orders(merchant_id);
create index if not exists idx_orders_driver on public.orders(driver_id);
create index if not exists idx_orders_status on public.orders(status);

-- --------------------------------------------------------------------------
-- ORDER ITEMS
-- --------------------------------------------------------------------------
create table if not exists public.order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  menu_item_id  uuid not null references public.menu_items(id),
  name_snapshot text not null,   -- nama saat dipesan (harga bisa berubah)
  price_snapshot numeric(12,2) not null,
  quantity      int not null check (quantity > 0)
);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- --------------------------------------------------------------------------
-- TRIGGER — updated_at otomatis
-- --------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- TRIGGER — auto-create profile saat signup (role default: buyer)
-- Frontend harus update role ke 'merchant' / 'driver' sesuai pilihan user.
-- --------------------------------------------------------------------------
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

  -- Validasi enum; fallback ke 'buyer' kalau invalid/null.
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

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles     enable row level security;
alter table public.merchants    enable row level security;
alter table public.menu_items   enable row level security;
alter table public.drivers      enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;

-- profiles
drop policy if exists "profiles: self read" on public.profiles;
create policy "profiles: self read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: public read basic" on public.profiles;
create policy "profiles: public read basic" on public.profiles
  for select using (true);  -- MVP: nama merchant/driver perlu dilihat buyer

drop policy if exists "profiles: self update" on public.profiles;
create policy "profiles: self update" on public.profiles
  for update using (auth.uid() = id);

-- merchants — public read, owner write
drop policy if exists "merchants: public read" on public.merchants;
create policy "merchants: public read" on public.merchants for select using (true);

drop policy if exists "merchants: owner write" on public.merchants;
create policy "merchants: owner write" on public.merchants
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- menu_items — public read, owner write
drop policy if exists "menu: public read" on public.menu_items;
create policy "menu: public read" on public.menu_items for select using (true);

drop policy if exists "menu: owner write" on public.menu_items;
create policy "menu: owner write" on public.menu_items
  for all using (
    exists (select 1 from public.merchants m
            where m.id = menu_items.merchant_id and m.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.merchants m
            where m.id = menu_items.merchant_id and m.owner_id = auth.uid())
  );

-- drivers
drop policy if exists "drivers: self all" on public.drivers;
create policy "drivers: self all" on public.drivers
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "drivers: public read online" on public.drivers;
create policy "drivers: public read online" on public.drivers
  for select using (is_online = true);

-- orders
drop policy if exists "orders: buyer read own" on public.orders;
create policy "orders: buyer read own" on public.orders
  for select using (buyer_id = auth.uid());

drop policy if exists "orders: merchant read own" on public.orders;
create policy "orders: merchant read own" on public.orders
  for select using (
    exists (select 1 from public.merchants m
            where m.id = orders.merchant_id and m.owner_id = auth.uid())
  );

drop policy if exists "orders: driver read assigned or open" on public.orders;
create policy "orders: driver read assigned or open" on public.orders
  for select using (
    driver_id = auth.uid()
    or (driver_id is null and status in ('paid','accepted_merchant','ready_for_pickup'))
  );

drop policy if exists "orders: buyer create" on public.orders;
create policy "orders: buyer create" on public.orders
  for insert with check (buyer_id = auth.uid());

drop policy if exists "orders: participants update" on public.orders;
create policy "orders: participants update" on public.orders
  for update using (
    buyer_id = auth.uid()
    or driver_id = auth.uid()
    or exists (select 1 from public.merchants m
               where m.id = orders.merchant_id and m.owner_id = auth.uid())
  );

-- order_items — ikut policy order
drop policy if exists "order_items: via order" on public.order_items;
create policy "order_items: via order" on public.order_items
  for all using (
    exists (select 1 from public.orders o where o.id = order_items.order_id
            and (o.buyer_id = auth.uid() or o.driver_id = auth.uid()
                 or exists (select 1 from public.merchants m
                            where m.id = o.merchant_id and m.owner_id = auth.uid())))
  );
