// ---- Cart + order store ----
const CartCtx = React.createContext(null);
const useCart = () => React.useContext(CartCtx);

// Order code like PSN-0607-7QF3
function orderCode() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `PSN-${mm}${dd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// A pre-seeded, in-flight order so "Lacak Pesanan" always has rich data
function makeSeedOrder() {
  const merchant = DEMO_MERCHANTS.find((m) => m.id === 'm4'); // Bakso Sapi Mas Gandhi
  const items = [
    { name: 'Bakso Urat Jumbo', qty: 2, price: 18000 },
    { name: 'Mie Ayam Bakso',   qty: 1, price: 16000 },
    { name: 'Es Teh / Teh Anget', qty: 3, price: 4000 },
  ];
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const t = (min) => new Date(Date.now() - min * 60000).toISOString();
  return {
    id: 'd4e5f6a7b8c9',
    orderNo: 'PSN-0607-7QF3',
    merchant,
    items,
    subtotal,
    delivery_fee: DELIVERY_FEE,
    gas_fee: GAS_FEE,
    total: subtotal + DELIVERY_FEE + GAS_FEE,
    delivery_address: 'Kos Putri Melati, Jl. Cempaka Sari No.7',
    recipient: { name: 'Rina Pratiwi', phone: '0857-2931-0044' },
    payment: 'Wallet Polygon',
    status: 'picked_up',
    driver: { name: 'Andi Saputra', plate: 'H 3148 PQ', vehicle: 'Honda BeAT Merah', rating: 4.9, phone: '0812-3344-5566', trips: 1284 },
    driverDistance: '0.8 km',
    driverEta: 6,
    arrivalAt: new Date(Date.now() + 6 * 60000).toISOString(),
    txHash: '0x8f3a91c47b2e6d05a1f9c3e7b84d20a6f15c9e3b',
    created_at: t(14),
    times: { paid: t(14), accepted_merchant: t(12), ready_for_pickup: t(7), picked_up: t(3) },
  };
}

function CartProvider({ children }) {
  // cart: { merchantId, items: { [itemId]: qty } }
  const [cart, setCart] = useState({ merchantId: null, items: {} });
  const [activeOrder, setActiveOrder] = useState(makeSeedOrder);
  const [history, setHistory] = useState(DEMO_HISTORY);
  const timers = useRef([]);

  const menuOf = (mid) => DEMO_MENU[mid] || [];
  const findItem = (mid, id) => menuOf(mid).find((x) => x.id === id);

  function addItem(merchantId, itemId) {
    setCart((c) => {
      // switching merchant resets the cart
      const base = c.merchantId && c.merchantId !== merchantId ? { merchantId, items: {} } : { ...c, merchantId };
      const items = { ...base.items, [itemId]: (base.items[itemId] || 0) + 1 };
      return { merchantId, items };
    });
  }
  function decItem(itemId) {
    setCart((c) => {
      const items = { ...c.items };
      if (!items[itemId]) return c;
      items[itemId] -= 1;
      if (items[itemId] <= 0) delete items[itemId];
      const merchantId = Object.keys(items).length ? c.merchantId : null;
      return { merchantId, items };
    });
  }
  function clearCart() { setCart({ merchantId: null, items: {} }); }

  const cartLines = () => {
    if (!cart.merchantId) return [];
    return Object.entries(cart.items).map(([id, qty]) => {
      const it = findItem(cart.merchantId, id);
      return { id, qty, name: it?.name, price: it?.price || 0, lineTotal: (it?.price || 0) * qty };
    });
  };
  const cartCount = () => Object.values(cart.items).reduce((a, b) => a + b, 0);
  const subtotal = () => cartLines().reduce((a, l) => a + l.lineTotal, 0);

  function placeOrder(address) {
    const merchant = DEMO_MERCHANTS.find((m) => m.id === cart.merchantId);
    const lines = cartLines();
    const sub = subtotal();
    const order = {
      id: Math.random().toString(16).slice(2, 14),
      orderNo: orderCode(),
      merchant,
      items: lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price })),
      subtotal: sub,
      delivery_fee: DELIVERY_FEE,
      gas_fee: GAS_FEE,
      total: sub + DELIVERY_FEE + GAS_FEE,
      delivery_address: address,
      recipient: { name: 'Rina Pratiwi', phone: '0857-2931-0044' },
      payment: 'Wallet Polygon',
      status: 'paid',
      driver: null,
      driverDistance: null,
      driverEta: merchant?.eta || 20,
      arrivalAt: new Date(Date.now() + 22 * 60000).toISOString(),
      txHash: '0x' + Math.random().toString(16).slice(2).padEnd(40, '0'),
      created_at: new Date().toISOString(),
      times: { paid: new Date().toISOString() },
    };
    setActiveOrder(order);
    clearCart();
    scheduleLifecycle(order);
    return order;
  }

  // Auto-advance status to make tracking feel alive
  function scheduleLifecycle(order) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const steps = [
      { at: 2500, patch: { status: 'accepted_merchant' } },
      { at: 6500, patch: { status: 'ready_for_pickup', driver: { name: 'Andi Saputra', plate: 'H 3148 PQ', vehicle: 'Honda BeAT Merah', rating: 4.9, phone: '0812-3344-5566', trips: 1284 }, driverDistance: '1.2 km', driverEta: 9 } },
      { at: 10000, patch: { status: 'picked_up', driverDistance: '0.6 km', driverEta: 5 } },
      { at: 16000, patch: { status: 'delivered' } },
    ];
    steps.forEach((s) => {
      const t = setTimeout(() => {
        setActiveOrder((o) => (o && o.id === order.id
          ? { ...o, ...s.patch, times: { ...o.times, [s.patch.status]: new Date().toISOString() } }
          : o));
        if (s.patch.status === 'delivered') {
          setHistory((h) => [{
            id: order.id, merchant_id: order.merchant.id,
            items: order.items.map((i) => ({ name: i.name, qty: i.qty })),
            total: order.total, status: 'delivered', created_at: order.created_at,
          }, ...h]);
        }
      }, s.at);
      timers.current.push(t);
    });
  }

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const value = {
    cart, addItem, decItem, clearCart, clearCartAll: clearCart,
    cartLines, cartCount, subtotal,
    activeOrder, setActiveOrder, placeOrder,
    history,
    qtyOf: (id) => cart.items[id] || 0,
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

Object.assign(window, { CartProvider, useCart });
