// ---- Cart + order store ----
const CartCtx = React.createContext(null);
const useCart = () => React.useContext(CartCtx);

function CartProvider({ children }) {
  // cart: { merchantId, items: { [itemId]: qty } }
  const [cart, setCart] = useState({ merchantId: null, items: {} });
  const [activeOrder, setActiveOrder] = useState(null);
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
      merchant,
      items: lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price })),
      subtotal: sub,
      delivery_fee: DELIVERY_FEE,
      gas_fee: GAS_FEE,
      total: sub + DELIVERY_FEE + GAS_FEE,
      delivery_address: address,
      status: 'paid',
      driver: null,
      txHash: '0x' + Math.random().toString(16).slice(2).padEnd(40, '0'),
      created_at: new Date().toISOString(),
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
      { at: 6500, patch: { status: 'ready_for_pickup', driver: { name: 'Andi Saputra', plate: 'H 3148 PQ', vehicle: 'Honda BeAT', rating: 4.9, phone: '0812-xxxx' } } },
      { at: 10000, patch: { status: 'picked_up' } },
      { at: 16000, patch: { status: 'delivered' } },
    ];
    steps.forEach((s) => {
      const t = setTimeout(() => {
        setActiveOrder((o) => (o && o.id === order.id ? { ...o, ...s.patch } : o));
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
