'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SellerPanel() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('billing');
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  // UI States
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    try {
      const u = JSON.parse(storedUser);
      // Guard: ensure the stored id looks like a real MongoDB ObjectId (24-char hex string)
      // If it's a fake/legacy value like "1", wipe localStorage and force re-login
      if (!u.id || !/^[a-f\d]{24}$/i.test(u.id)) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }
      setUser(u);
      loadData(u.id);
    } catch (e) {
      console.error('Data error', e);
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async (sellerId: string) => {
    try {
      const [catRes, prodRes, ordRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/products'),           // only active products
        axios.get(`/api/orders?sellerId=${sellerId}`),
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setOrders(ordRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.productId === product._id);
    if (existingItem) {
      existingItem.quantity += 1;
      setCart([...cart]);
    } else {
      setCart([...cart, { productId: product._id, productName: product.name, price: product.price, quantity: 1 }]);
    }
    setAddedFeedback(product._id);
    setTimeout(() => setAddedFeedback(null), 1000);
  };

  const removeFromCart = (productId: string) =>
    setCart(cart.filter((item) => item.productId !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) { removeFromCart(productId); return; }
    const item = cart.find((item) => item.productId === productId);
    if (item) { item.quantity = quantity; setCart([...cart]); }
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const initiateCheckout = () => {
    if (cart.length === 0) { showToast('Cart is empty', 'error'); return; }
    setIsCheckoutOpen(true);
    setCartOpen(false);
  };

  const handleConfirmCheckout = async (customerName: string, paymentMethod: string) => {
    try {
      const response = await axios.post('/api/orders', {
        sellerId: user.id,
        items: cart,
        customerName,
        paymentMethod,
      });
      showToast(`Order #${response.data.orderNumber} created!`, 'success');
      setCart([]);
      setIsCheckoutOpen(false);
      loadData(user.id); // reload so product stock display stays current
      // Show receipt modal
      setCurrentReceiptOrder(response.data);
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Checkout failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'info');
    setTimeout(() => router.push('/'), 500);
  };

  const sendDailyReport = async () => {
    try {
      const response = await axios.post('/api/reports/send-daily');
      if (response.data.success) showToast(`✅ Daily report sent to ${response.data.sentTo} users!`, 'success');
      else showToast('Failed to send daily report', 'error');
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message, 'error');
    }
  };

  const sendMonthlyReport = async () => {
    try {
      const response = await axios.post('/api/reports/send-monthly');
      if (response.data.success) showToast(`✅ Monthly report sent to ${response.data.sentTo} users!`, 'success');
      else showToast('Failed to send monthly report', 'error');
    } catch (error: any) {
      showToast(error.response?.data?.error || error.message, 'error');
    }
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff' }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/icebay-logo.jpeg" alt="Icebay Logo" style={{ height: 60, width: 'auto', marginBottom: 16, mixBlendMode: 'multiply' }} />
        <p style={{ color: '#6b7280', fontSize: 16 }}>Loading Seller Panel...</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'billing', label: 'Billing', icon: '🧾' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'sales', label: 'Today', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📤' },
  ];

  const todayOrders = orders.filter((o: any) =>
    new Date(o.createdAt).toDateString() === new Date().toDateString()
  );
  const todayTotal = todayOrders.reduce((sum, o: any) => sum + (o.subtotal ?? o.total), 0);
  const cartTotal = calculateTotal();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', paddingBottom: 72 }}>

      {/* ── TOAST ── */}
      {notification && (
        <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* ── CHECKOUT MODAL ── */}
      {isCheckoutOpen && (
        <CheckoutModal
          amount={cartTotal}
          onClose={() => setIsCheckoutOpen(false)}
          onConfirm={handleConfirmCheckout}
        />
      )}

      {/* ── RECEIPT MODAL ── */}
      {currentReceiptOrder && (
        <ReceiptModal 
          order={currentReceiptOrder} 
          user={user} 
          onClose={() => setCurrentReceiptOrder(null)} 
        />
      )}

      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: '#fff', padding: '0 16px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 12px rgba(30,64,175,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#fff', padding: '2px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
            <img src="/icebay-logo.jpeg" alt="Icebay Logo" style={{ height: 28, width: 'auto' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Icebay Seller</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{user.name}</div>
          </div>
        </div>

        {/* Desktop tabs */}
        <nav style={{ display: 'flex', gap: 4 }} className="desktop-tabs">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: activeTab === t.id ? 'rgba(255,255,255,0.25)' : 'transparent',
              border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 8,
              fontWeight: activeTab === t.id ? 700 : 500, fontSize: 13,
              cursor: 'pointer', transition: 'background 0.2s',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeTab === 'billing' && (
            <button onClick={() => setCartOpen(true)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
              borderRadius: 20, padding: '6px 12px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', position: 'relative',
            }} className="mobile-cart-btn">
              🛒 {cartCount > 0 && (
                <span style={{
                  background: '#ef4444', color: '#fff', borderRadius: '50%',
                  fontSize: 10, padding: '1px 5px', marginLeft: 4,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}>{cartCount}</span>
              )}
            </button>
          )}
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer',
          }}>
            Logout
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 12px' }}>

        {/* ════ BILLING TAB ════ */}
        {activeTab === 'billing' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }} className="billing-grid">

            {/* Products Panel */}
            <div>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', padding: '11px 40px 11px 38px',
                    border: '2px solid #dbeafe', borderRadius: 12, fontSize: 15,
                    outline: 'none', background: '#fff', boxSizing: 'border-box',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16,
                  }}>✕</button>
                )}
              </div>

              {categories.map((category: any) => {
                const filtered = products
                  .filter((p: any) => p.categoryId._id === category._id)
                  .filter((p: any) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));
                if (filtered.length === 0) return null;
                return (
                  <div key={category._id} style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 2,
                    }}>
                      {category.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {filtered.map((product: any) => {
                        const inCart = cart.find(i => i.productId === product._id);
                        const isJustAdded = addedFeedback === product._id;
                        return (
                          <button key={product._id} onClick={() => addToCart(product)} style={{
                            padding: '10px 16px',
                            background: isJustAdded
                              ? '#059669'
                              : inCart
                                ? 'linear-gradient(135deg, #059669, #10b981)'
                                : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            color: '#fff', border: 'none', borderRadius: 24,
                            fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                            transition: 'all 0.1s',
                            transform: isJustAdded ? 'scale(0.95)' : 'scale(1)',
                            display: 'flex', alignItems: 'center', gap: 6, minHeight: 44,
                          }}>
                            {isJustAdded ? '✅ Added!' : product.name}
                            {!isJustAdded && <span style={{ opacity: 0.85, fontSize: 12 }}>₹{product.price}</span>}
                            {inCart && !isJustAdded && (
                              <span style={{
                                background: 'rgba(255,255,255,0.3)', borderRadius: 10,
                                padding: '1px 7px', fontSize: 11, fontWeight: 800,
                              }}>×{inCart.quantity}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Panel — desktop sticky sidebar */}
            <div className="cart-panel" style={{
              background: '#fff', borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              padding: 20, height: 'fit-content',
              maxHeight: 'calc(100vh - 100px)', overflowY: 'auto',
              position: 'sticky', top: 72,
            }}>
              <CartContent
                cart={cart}
                cartTotal={cartTotal}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                onCheckout={initiateCheckout}
                setCart={setCart}
              />
            </div>
          </div>
        )}

        {/* ════ ORDERS TAB ════ */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>📋 Your Orders</h2>
            {orders.length === 0 ? (
              <EmptyState icon="📋" message="No orders yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...orders].reverse().map((order: any) => (
                  <div key={order._id} style={{
                    background: '#fff', borderRadius: 14, padding: '14px 16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'flex', flexWrap: 'wrap', gap: 8,
                    alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{order.orderNumber}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}{order.customerName || 'Walk-in'}
                        {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: order.paymentMethod === 'cash' ? '#dcfce7' : order.paymentMethod === 'card' ? '#dbeafe' : '#f3e8ff',
                        color: order.paymentMethod === 'cash' ? '#166534' : order.paymentMethod === 'card' ? '#1e40af' : '#6b21a8',
                      }}>
                        {order.paymentMethod === 'cash' ? '💵 Cash' : order.paymentMethod === 'card' ? '💳 Card' : '📱 UPI'}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 16, color: '#059669' }}>
                        ₹{(order.subtotal ?? order.total).toFixed(2)}
                      </span>
                      <button onClick={() => setCurrentReceiptOrder(order)} style={{
                        background: '#e0f2fe', color: '#0284c7', border: 'none',
                        borderRadius: 8, padding: '4px 8px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}>
                        🧾 Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ TODAY'S SALES TAB ════ */}
        {activeTab === 'sales' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>📊 Today's Sales</h2>

            <div style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              borderRadius: 20, padding: '24px 20px', color: '#fff',
              marginBottom: 16, display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12,
              boxShadow: '0 4px 12px rgba(30,64,175,0.2)',
            }}>
              <div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Total Orders Today</div>
                <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>{todayOrders.length}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Total Amount</div>
                <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>₹{todayTotal.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { method: 'cash', label: 'Cash', icon: '💵', bg: '#dcfce7', color: '#166534' },
                { method: 'card', label: 'Card', icon: '💳', bg: '#dbeafe', color: '#1e40af' },
                { method: 'upi', label: 'UPI', icon: '📱', bg: '#f3e8ff', color: '#6b21a8' },
              ].map(({ method, label, icon, bg, color }) => {
                const amt = todayOrders
                  .filter((o: any) => o.paymentMethod === method)
                  .reduce((sum, o: any) => sum + (o.subtotal ?? o.total), 0);
                return (
                  <div key={method} style={{ background: bg, borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22 }}>{icon}</div>
                    <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 4 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color, marginTop: 2 }}>₹{amt.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            {todayOrders.length === 0 ? (
              <EmptyState icon="📊" message="No orders today yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Today's Orders</div>
                {[...todayOrders].reverse().map((order: any) => (
                  <div key={order._id} style={{
                    background: '#fff', borderRadius: 12, padding: '12px 14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{order.customerName || 'Walk-in'}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#059669' }}>
                        ₹{(order.subtotal ?? order.total).toFixed(2)}
                      </div>
                      <button onClick={() => setCurrentReceiptOrder(order)} style={{
                        background: '#e0f2fe', color: '#0284c7', border: 'none',
                        borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}>
                        🧾 Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ REPORTS TAB ════ */}
        {activeTab === 'reports' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>📤 Send Reports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 14 }} className="reports-grid">
              <div style={{
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                borderRadius: 20, padding: '28px 24px', color: '#fff',
                boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Daily Report</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 20 }}>
                  Send today's sales summary to all admins and sellers
                </div>
                <button onClick={sendDailyReport} style={{
                  width: '100%', background: '#fff', color: '#2563eb', border: 'none',
                  borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                }}>
                  Send Daily Report
                </button>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                borderRadius: 20, padding: '28px 24px', color: '#fff',
                boxShadow: '0 4px 12px rgba(124,58,237,0.2)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Monthly Report</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 20 }}>
                  Send this month's summary to all admins and sellers
                </div>
                <button onClick={sendMonthlyReport} style={{
                  width: '100%', background: '#fff', color: '#7c3aed', border: 'none',
                  borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                }}>
                  Send Monthly Report
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MOBILE CART SLIDE-UP ── */}
      {cartOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }} onClick={() => setCartOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 32px', maxHeight: '80vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>🛒 Cart</h3>
              <button onClick={() => setCartOpen(false)} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '50%',
                width: 32, height: 32, fontSize: 16, cursor: 'pointer',
              }}>✕</button>
            </div>
            <CartContent
              cart={cart}
              cartTotal={cartTotal}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              onCheckout={initiateCheckout}
              setCart={setCart}
            />
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        display: 'flex', zIndex: 50,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
      }} className="mobile-bottom-nav">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setCartOpen(false); }} style={{
            flex: 1, padding: '10px 4px 8px', background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: activeTab === t.id ? '#2563eb' : '#9ca3af', transition: 'color 0.2s',
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: activeTab === t.id ? 700 : 500 }}>{t.label}</span>
            {activeTab === t.id && (
              <span style={{ width: 20, height: 3, background: '#2563eb', borderRadius: 2 }} />
            )}
          </button>
        ))}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .billing-grid { grid-template-columns: minmax(0, 1fr) 340px !important; }
          .reports-grid { grid-template-columns: 1fr 1fr !important; }
          .mobile-bottom-nav { display: none !important; }
          .desktop-tabs { display: flex !important; }
          .mobile-cart-btn { display: none !important; }
          div[style*="paddingBottom: 72"] { padding-bottom: 0 !important; }
        }
        @media (max-width: 767px) {
          .cart-panel { display: none !important; }
          .desktop-tabs { display: none !important; }
          .mobile-cart-btn { display: flex !important; }
        }
        button:active { transform: scale(0.96); }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        }
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px;
            box-shadow: none !important; border: none !important; color: #000 !important;
          }
          .no-print { display: none !important; }
          .receipt-overlay { background: #fff !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Components ── */

function ReceiptModal({ order, onClose, user }: any) {
  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', padding: 16
    }} className="receipt-overlay" onClick={onClose}>
      <div id="printable-receipt" style={{
        background: '#fff', padding: '24px', width: '100%', maxWidth: 360,
        borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        color: '#000', fontFamily: 'monospace', maxHeight: '90vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        {/* ESCAPE print styles for modal buttons */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Receipt</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', fontSize: 16, cursor: 'pointer', width: 32, height: 32, borderRadius: '50%' }}>✕</button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '1px dashed #ccc', paddingBottom: 16 }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: 28, fontWeight: 800 }}>ICEBAY</h2>
          <div style={{ fontSize: 13, color: '#444' }}>Tax Invoice / Receipt</div>
          <div style={{ fontSize: 13, color: '#444' }}>Seller: {user?.name || 'Icebay Store'}</div>
        </div>

        <div style={{ marginBottom: 16, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div>Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}</div>
            <div>Time: {new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN')}</div>
            <div style={{ marginTop: 4 }}>Order: {order.orderNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>Customer: {order.customerName || 'Walk-in'}</div>
            <div style={{ marginTop: 4 }}>Pay Mode: {order.paymentMethod?.toUpperCase()}</div>
          </div>
        </div>

        <table style={{ width: '100%', fontSize: 13, marginBottom: 16, borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px dashed #ccc' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '8px 0', borderBottom: '1px dashed #ccc' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px dashed #ccc' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item: any, i: number) => (
              <tr key={i}>
                <td style={{ padding: '8px 0', borderBottom: i !== order.items.length - 1 ? '1px dotted #eaeaea' : 'none' }}>
                  {item.productName}
                </td>
                <td style={{ textAlign: 'center', padding: '8px 0', borderBottom: i !== order.items.length - 1 ? '1px dotted #eaeaea' : 'none' }}>
                  {item.quantity}
                </td>
                <td style={{ textAlign: 'right', padding: '8px 0', borderBottom: i !== order.items.length - 1 ? '1px dotted #eaeaea' : 'none' }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
          <span>Total</span>
          <span>₹{(order.subtotal ?? order.total).toFixed(2)}</span>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#666', borderTop: '1px dashed #ccc', paddingTop: 16 }}>
          Thank you for your purchase!<br />
          Have a great day!
        </div>

        <div className="no-print" style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{
            flex: 1, padding: 14, background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', borderRadius: 10,
            border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 12px rgba(30,64,175,0.2)'
          }}>
            <span style={{ fontSize: 18 }}>🖨️</span> Print PDF
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: 14, background: '#f3f4f6', color: '#4b5563', borderRadius: 10,
            border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 15,
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: any) {
  const bg = type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#2563eb';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 110, background: '#fff', borderRadius: 12, padding: '12px 20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 10,
      borderLeft: `4px solid ${bg}`, animation: 'slideDown 0.3s ease-out',
    }} onClick={onClose}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>{message}</span>
    </div>
  );
}

function CheckoutModal({ onClose, amount, onConfirm }: any) {
  const [name, setName] = useState('Walk-in Customer');
  const [method, setMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    if (processing) return;
    setProcessing(true);
    await onConfirm(name, method);
    setProcessing(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 24, width: '90%', maxWidth: 400,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>Complete Order</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Total Amount</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#059669' }}>₹{amount.toFixed(2)}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Customer Name</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} autoFocus
            style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 8 }}>Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { id: 'cash', label: 'Cash', icon: '💵' },
              { id: 'card', label: 'Card', icon: '💳' },
              { id: 'upi', label: 'UPI', icon: '📱' },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id as any)} style={{
                padding: '10px 4px', borderRadius: 10,
                border: `2px solid ${method === m.id ? '#3b82f6' : '#f3f4f6'}`,
                background: method === m.id ? '#eff6ff' : '#fff',
                color: method === m.id ? '#1e40af' : '#6b7280',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={processing} style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff',
          fontSize: 16, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
          opacity: processing ? 0.7 : 1,
        }}>
          {processing ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}

function CartContent({ cart, cartTotal, updateQuantity, removeFromCart, onCheckout, setCart }: any) {
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
        <p style={{ fontSize: 14 }}>Cart is empty</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Tap a product to add it</p>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {cart.map((item: any) => (
          <div key={item.productId} style={{
            background: '#f8faff', borderRadius: 12, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.productName}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>₹{item.price} each</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{
                width: 30, height: 30, borderRadius: '50%', border: '2px solid #e5e7eb',
                background: '#fff', fontSize: 16, cursor: 'pointer', fontWeight: 700, color: '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>−</button>
              <span style={{ fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{
                width: 30, height: 30, borderRadius: '50%', border: '2px solid #2563eb',
                background: '#2563eb', fontSize: 16, cursor: 'pointer', fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#059669', minWidth: 56, textAlign: 'right' }}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
            <button onClick={() => removeFromCart(item.productId)} style={{
              background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: 4,
            }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Total Amount</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>₹{cartTotal.toFixed(2)}</span>
        </div>
        <button onClick={onCheckout} style={{
          width: '100%', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff',
          border: 'none', borderRadius: 14, padding: '14px', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', marginBottom: 8, boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
        }}>
          ✅ Complete Order
        </button>
        <button onClick={() => setCart([])} style={{
          width: '100%', background: '#f3f4f6', color: '#6b7280', border: 'none',
          borderRadius: 14, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Clear Cart
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15 }}>{message}</p>
    </div>
  );
}
