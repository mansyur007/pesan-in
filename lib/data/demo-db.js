// Data dummy untuk demo mode. Tidak dipakai kalau Supabase sudah dikonfigurasi.

export const DEMO_MERCHANTS = [
  {
    id: 'demo-m-001',
    owner_id: 'demo-merchant-001',
    name: 'Kedai Gunungpati',
    address: 'Jl. Pawiyatan Luhur Sel. No.12, Gunungpati, Semarang',
    latitude: -7.0695,
    longitude: 110.3942,
    is_open: true,
  },
  {
    id: 'demo-m-002',
    owner_id: 'demo-merchant-002',
    name: 'Nasi Goreng Bu Rini',
    address: 'Jl. Sekaran Raya No.7, Gunungpati',
    latitude: -7.0521,
    longitude: 110.3975,
    is_open: true,
  },
  {
    id: 'demo-m-003',
    owner_id: 'demo-merchant-003',
    name: 'Warung Kopi UNNES',
    address: 'Jl. Taman Siswa, Sekaran, Gunungpati',
    latitude: -7.0498,
    longitude: 110.4018,
    is_open: false,
  },
];

export const DEMO_MENU = {
  'demo-m-001': [
    { id: 'i-1', name: 'Nasi Ayam Bakar', price: 18000, is_available: true },
    { id: 'i-2', name: 'Es Teh Manis',    price: 4000,  is_available: true },
    { id: 'i-3', name: 'Mie Ayam',        price: 15000, is_available: true },
  ],
};

export const DEMO_ORDERS = [
  {
    id: '11111111-2222-3333-4444-555555555555',
    buyer_id: 'demo-buyer-001',
    merchant_id: 'demo-m-001',
    driver_id: null,
    subtotal: 22000,
    delivery_fee: 8000,
    gas_fee: 500,
    total: 30500,
    status: 'paid',
    delivery_address: 'Jl. Kalimasada No.3, Gunungpati',
    delivery_lat: -7.0712,
    delivery_lng: 110.3985,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: '22222222-3333-4444-5555-666666666666',
    buyer_id: 'demo-buyer-001',
    merchant_id: 'demo-m-001',
    driver_id: null,
    subtotal: 15000,
    delivery_fee: 7000,
    gas_fee: 500,
    total: 22500,
    status: 'ready_for_pickup',
    delivery_address: 'Jl. Patemon Raya No.22, Gunungpati',
    delivery_lat: -7.0603,
    delivery_lng: 110.4021,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];
