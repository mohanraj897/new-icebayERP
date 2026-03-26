'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any>(null);

  // UI States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Forms
  const [newCategory, setNewCategory] = useState({ name: '', type: 'milk-based', color: '#3B82F6' });
  const [newProduct, setNewProduct] = useState({ name: '', categoryId: '', price: 0, cost: 0, sku: '', quantity: 0, stockAlertThreshold: 10 });
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'admin') {
        router.push('/seller');
        return;
      }
      setUser(parsedUser);
      loadData();
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    try {
      const [catRes, prodRes, salesRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/products?includeInactive=true'),
        axios.get('/api/reports/sales?period=today'),
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setSalesData(salesRes.data || { totalSales: 0, totalOrders: 0, paymentBreakdown: {}, topSellingItem: null });
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    }
  };

  const handleAddCategory = async () => {
    try {
      await axios.post('/api/categories', newCategory);
      showToast('Category added successfully', 'success');
      setNewCategory({ name: '', type: 'milk-based', color: '#0b63f1' });
      setShowCategoryModal(false);
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      showToast('Category deleted successfully', 'success');
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to delete category', 'error');
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) { showToast('Product name is required', 'error'); return; }
    if (!newProduct.categoryId) { showToast('Please select a category', 'error'); return; }
    if (!newProduct.price || newProduct.price <= 0) { showToast('Price must be greater than 0', 'error'); return; }
    try {
      await axios.post('/api/products', newProduct);
      showToast('Product added successfully', 'success');
      setNewProduct({ name: '', categoryId: '', price: 0, cost: 0, sku: '', quantity: 0, stockAlertThreshold: 10 });
      setShowProductModal(false);
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to add product', 'error');
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      cost: product.cost || 0,
      sku: product.sku || '',
      quantity: product.quantity ?? 0,
      stockAlertThreshold: product.stockAlertThreshold ?? 10,
      categoryId: product.categoryId?._id || product.categoryId,
      isActive: product.isActive !== false,
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    if (!editForm.name?.trim()) { showToast('Product name is required', 'error'); return; }
    if (!editForm.price || editForm.price <= 0) { showToast('Price must be greater than 0', 'error'); return; }
    try {
      await axios.put(`/api/products/${editingProduct._id}`, {
        name: editForm.name,
        price: parseFloat(editForm.price),
        cost: parseFloat(editForm.cost) || 0,
        sku: editForm.sku,
        quantity: parseInt(editForm.quantity) || 0,
        stockAlertThreshold: parseInt(editForm.stockAlertThreshold) || 10,
        categoryId: editForm.categoryId,
        isActive: editForm.isActive,
      });
      showToast('Product updated successfully!', 'success');
      setShowEditModal(false);
      setEditingProduct(null);
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      showToast('Product deleted successfully', 'success');
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to delete product', 'error');
    }
  };

  const handleSendDailyReport = async () => {
    try {
      await axios.post('/api/reports/send-daily');
      showToast('Daily sales report sent to all admins', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to send report', 'error');
    }
  };

  const handleSendMonthlyReport = async () => {
    try {
      await axios.post('/api/reports/send-monthly');
      showToast('Monthly sales summary sent to all admins', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to send report', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'info');
    setTimeout(() => router.push('/'), 500);
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff' }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/icebay-logo.jpeg" alt="Icebay Logo" style={{ height: 60, width: 'auto', marginBottom: 16, mixBlendMode: 'multiply' }} />
        <p style={{ color: '#6b7280', fontSize: 16 }}>Loading Admin Panel...</p>
      </div>
    </div>
  );

  // Low stock products
  const lowStockProducts = products.filter((p: any) =>
    (p.quantity ?? 0) <= (p.stockAlertThreshold ?? 10)
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'stock', label: 'Stock', icon: '🔔' },
    { id: 'reports', label: 'Reports', icon: '📤' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', paddingBottom: 80 }}>
      {/* ── TOAST ── */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 110, background: '#fff', borderRadius: 12, padding: '12px 24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 12,
          borderLeft: `4px solid ${notification.type === 'success' ? '#059669' : notification.type === 'error' ? '#dc2626' : '#2563eb'}`,
          animation: 'fadeIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
        }} onClick={() => setNotification(null)}>
          <span style={{ fontSize: 20 }}>{notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span style={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>{notification.message}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: '#fff',
        padding: '0 16px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 12px rgba(30,64,175,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#fff', padding: '2px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
            <img src="/icebay-logo.jpeg" alt="Icebay Logo" style={{ height: 28, width: 'auto' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Icebay Admin</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{user.name}</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', gap: 4 }} className="desktop-tabs">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: activeTab === t.id ? 'rgba(255,255,255,0.25)' : 'transparent',
              border: 'none', color: '#fff', padding: '8px 14px', borderRadius: 8,
              fontWeight: activeTab === t.id ? 700 : 500, fontSize: 14, cursor: 'pointer',
              transition: 'background 0.2s', position: 'relative',
            }}>
              {t.icon} {t.label}
              {t.id === 'stock' && lowStockProducts.length > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: '#ef4444', color: '#fff',
                  borderRadius: '50%', fontSize: 9, padding: '1px 4px',
                  fontWeight: 800, lineHeight: 1.4,
                }}>{lowStockProducts.length}</span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer',
        }}>
          Logout
        </button>
      </header>

      {/* ── LOW STOCK BANNER ── */}
      {lowStockProducts.length > 0 && activeTab !== 'stock' && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          borderBottom: '2px solid #f59e0b',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
        }} onClick={() => setActiveTab('stock')}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: '#92400e', fontSize: 13 }}>
              Stock Alert: {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} low on stock!
            </span>
            <span style={{ color: '#b45309', fontSize: 12, marginLeft: 6 }}>
              {lowStockProducts.map((p: any) => `${p.name} (${p.quantity ?? 0})`).join(', ')}
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#b45309', fontWeight: 600, flexShrink: 0 }}>View →</span>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>

        {/* ════ DASHBOARD ════ */}
        {activeTab === 'dashboard' && salesData && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#1e293b' }}>📊 Today's Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Sales', value: `₹${salesData.totalSales?.toFixed(2) || '0.00'}`, icon: '💰', bg: 'linear-gradient(135deg, #10b981, #059669)' },
                { label: 'Orders', value: salesData.totalOrders || 0, icon: '🧾', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
                { label: 'Products', value: products.filter(p => (p as any).isActive !== false).length, icon: '📦', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
                { label: 'Low Stock', value: lowStockProducts.length, icon: '⚠️', bg: lowStockProducts.length > 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #6b7280, #4b5563)' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: stat.bg, borderRadius: 20, padding: 24, color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', height: 140,
                  cursor: stat.label === 'Low Stock' ? 'pointer' : 'default',
                }} onClick={stat.label === 'Low Stock' ? () => setActiveTab('stock') : undefined}>
                  <div style={{ fontSize: 32 }}>{stat.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {/* Payment Breakdown */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2937' }}>💳 Payment Methods</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[
                    { type: 'Cash', val: salesData.paymentBreakdown?.cash || 0, color: '#166534', bg: '#dcfce7' },
                    { type: 'Card', val: salesData.paymentBreakdown?.card || 0, color: '#1e40af', bg: '#dbeafe' },
                    { type: 'UPI', val: salesData.paymentBreakdown?.upi || 0, color: '#6b21a8', bg: '#f3e8ff' },
                  ].map(m => (
                    <div key={m.type} style={{ background: m.bg, borderRadius: 12, padding: '16px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: m.color, marginBottom: 4 }}>{m.type}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>₹{m.val.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Item */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2937' }}>🏆 Top Seller</h3>
                {salesData.topSellingItem ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🥇</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{salesData.topSellingItem.productName}</div>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>
                        Sold <span style={{ fontWeight: 600, color: '#ea580c' }}>{salesData.topSellingItem.quantity}</span> units
                        {' · '}
                        <span style={{ fontWeight: 600, color: '#059669' }}>₹{salesData.topSellingItem.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>No sales data yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════ CATEGORIES ════ */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>🏷️ Categories</h2>
              <button onClick={() => setShowCategoryModal(true)} style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none',
                padding: '10px 20px', borderRadius: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(37,99,235,0.2)'
              }}>+ Add New</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {categories.map((cat: any) => (
                <div key={cat._id} style={{
                  background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  borderLeft: `6px solid ${cat.color}`, position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{cat.name}</h3>
                      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                        Type: <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 6 }}>{cat.type}</span>
                      </p>
                    </div>
                    <button onClick={() => handleDeleteCategory(cat._id)} style={{
                      background: '#fee2e2', color: '#dc2626', border: 'none', width: 32, height: 32,
                      borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PRODUCTS ════ */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>📦 Products</h2>
              <button onClick={() => setShowProductModal(true)} style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none',
                padding: '10px 20px', borderRadius: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(37,99,235,0.2)'
              }}>+ Add New</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {products.map((p: any) => {
                const margin = p.cost ? ((p.price - p.cost) / p.price * 100).toFixed(0) : 'N/A';
                const isLow = (p.quantity ?? 0) <= (p.stockAlertThreshold ?? 10);
                return (
                  <div key={p._id} style={{
                    background: '#fff', borderRadius: 16, padding: '16px 20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexWrap: 'wrap',
                    alignItems: 'center', gap: 16, justifyContent: 'space-between',
                    borderLeft: isLow ? '4px solid #f59e0b' : '4px solid transparent',
                  }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {p.name}
                        {isLow && (
                          <span style={{
                            background: '#fef3c7', color: '#b45309', fontSize: 11,
                            fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            border: '1px solid #f59e0b'
                          }}>⚠️ Low Stock</span>
                        )}
                        {p.isActive === false && (
                          <span style={{
                            background: '#f3f4f6', color: '#6b7280', fontSize: 11,
                            fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          }}>Inactive</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                        {p.categoryId?.name || 'No Category'} {' · '} SKU: {p.sku || '-'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Price</div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#059669' }}>₹{p.price}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Cost</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>₹{p.cost || 0}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Margin</div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#d97706' }}>{margin}%</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Stock</div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: isLow ? '#d97706' : '#374151' }}>
                          {p.quantity ?? 0}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEditModal(p)} style={{
                          background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', padding: '7px 14px',
                          borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13
                        }}>✏️ Edit</button>
                        <button onClick={() => handleDeleteProduct(p._id)} style={{
                          background: '#fee2e2', color: '#dc2626', border: 'none', padding: '7px 14px',
                          borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13
                        }}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ STOCK ALERTS ════ */}
        {activeTab === 'stock' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#1e293b' }}>🔔 Stock Overview</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Monitor all product stock levels. Sellers can update quantities from their panel.</p>

            {/* Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Products', value: products.length, icon: '📦', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' },
                { label: 'Low Stock Alerts', value: lowStockProducts.length, icon: '⚠️', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' },
                { label: 'Out of Stock', value: products.filter(p => (p as any).quantity === 0).length, icon: '🚫', bg: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' },
                { label: 'Healthy Stock', value: products.filter(p => (p as any).quantity > ((p as any).stockAlertThreshold ?? 10)).length, icon: '✅', bg: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: stat.bg, borderRadius: 16, padding: '20px 18px', color: stat.color,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Low Stock Section */}
            {lowStockProducts.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#92400e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚠️ Low Stock Products
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: 12, padding: '2px 8px', fontWeight: 800 }}>
                    {lowStockProducts.length}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {lowStockProducts.map((p: any) => {
                    const pct = p.stockAlertThreshold > 0 ? Math.min(100, Math.round((p.quantity / p.stockAlertThreshold) * 100)) : 0;
                    return (
                      <div key={p._id} style={{
                        background: '#fff',
                        border: '2px solid #f59e0b',
                        borderRadius: 14,
                        padding: '16px 20px',
                        boxShadow: '0 2px 10px rgba(245,158,11,0.12)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                              {p.categoryId?.name || 'No Category'} · SKU: {p.sku || '-'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>CURRENT</div>
                              <div style={{ fontWeight: 800, fontSize: 22, color: p.quantity === 0 ? '#dc2626' : '#d97706' }}>{p.quantity ?? 0}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>THRESHOLD</div>
                              <div style={{ fontWeight: 700, fontSize: 18, color: '#6b7280' }}>{p.stockAlertThreshold ?? 10}</div>
                            </div>
                            <button onClick={() => openEditModal(p)} style={{
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                              border: 'none', padding: '8px 16px', borderRadius: 10,
                              cursor: 'pointer', fontWeight: 700, fontSize: 13,
                            }}>✏️ Update</button>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div style={{ background: '#f3f4f6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                          <div style={{
                            background: p.quantity === 0 ? '#ef4444' : pct < 50 ? '#f59e0b' : '#10b981',
                            height: '100%', width: `${pct}%`, borderRadius: 99,
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                          {p.quantity === 0 ? '🚫 Out of stock — needs immediate restocking!' : `${pct}% of alert threshold`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Products Stock Table */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>📋 All Products Stock</h3>
              <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 100px',
                  background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e5e7eb',
                  fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5,
                }} className="stock-table-header">
                  <div>Product</div>
                  <div style={{ textAlign: 'center' }}>Category</div>
                  <div style={{ textAlign: 'center' }}>In Stock</div>
                  <div style={{ textAlign: 'center' }}>Threshold</div>
                  <div style={{ textAlign: 'center' }}>Status</div>
                </div>
                {products.map((p: any, idx: number) => {
                  const isLow = (p.quantity ?? 0) <= (p.stockAlertThreshold ?? 10);
                  const isOut = (p.quantity ?? 0) === 0;
                  return (
                    <div key={p._id} style={{
                      display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 100px',
                      padding: '14px 20px', alignItems: 'center',
                      borderBottom: idx < products.length - 1 ? '1px solid #f1f5f9' : 'none',
                      background: isLow ? 'rgba(254,243,199,0.4)' : '#fff',
                    }} className="stock-table-row">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>SKU: {p.sku || '-'}</div>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                        {p.categoryId?.name || '-'}
                      </div>
                      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 16, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669' }}>
                        {p.quantity ?? 0}
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', fontWeight: 600 }}>
                        {p.stockAlertThreshold ?? 10}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: isOut ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7',
                          color: isOut ? '#dc2626' : isLow ? '#b45309' : '#166534',
                        }}>
                          {isOut ? '🚫 Out' : isLow ? '⚠️ Low' : '✅ OK'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ REPORTS ════ */}
        {activeTab === 'reports' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#1e293b' }}>📤 Send Reports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              <div style={{
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)', borderRadius: 20, padding: 30, color: '#fff',
                boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Daily Report</h3>
                <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 24, lineHeight: 1.5 }}>
                  Send a summary of all sales, orders, and revenue generated today to the admin email list.
                </p>
                <button onClick={handleSendDailyReport} style={{
                  background: '#fff', color: '#2563eb', border: 'none', width: '100%', padding: 14,
                  borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer'
                }}>Send Daily Report</button>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', borderRadius: 20, padding: 30, color: '#fff',
                boxShadow: '0 8px 20px rgba(124,58,237,0.25)'
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Monthly Report</h3>
                <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 24, lineHeight: 1.5 }}>
                  Send a detailed analysis of this month's performance, including top products and growth.
                </p>
                <button onClick={handleSendMonthlyReport} style={{
                  background: '#fff', color: '#7c3aed', border: 'none', width: '100%', padding: 14,
                  borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer'
                }}>Send Monthly Report</button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e5e7eb',
        display: 'flex', zIndex: 50, boxShadow: '0 -4px 16px rgba(0,0,0,0.08)', paddingBottom: 'env(safe-area-inset-bottom)'
      }} className="mobile-bottom-nav">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '12px 0 8px', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: activeTab === t.id ? '#2563eb' : '#9ca3af', position: 'relative',
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: activeTab === t.id ? 700 : 500 }}>{t.label}</span>
            {t.id === 'stock' && lowStockProducts.length > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 'calc(50% - 14px)',
                background: '#ef4444', color: '#fff',
                borderRadius: '50%', fontSize: 8, padding: '1px 4px',
                fontWeight: 800, lineHeight: 1.5,
              }}>{lowStockProducts.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── MODALS ── */}
      {showCategoryModal && (
        <Modal title="Add New Category" onClose={() => setShowCategoryModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Name</label>
              <input type="text" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., Ice Creams" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Type</label>
              <select value={newCategory.type} onChange={e => setNewCategory({ ...newCategory, type: e.target.value })}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none' }}>
                <option value="milk-based">Milk-based</option>
                <option value="water-based">Water-based</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Color Token</label>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
                {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'].map(c => (
                  <div key={c} onClick={() => setNewCategory({ ...newCategory, color: c })}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', background: c, flexShrink: 0, cursor: 'pointer',
                      border: newCategory.color === c ? '3px solid #1f2937' : '3px solid transparent'
                    }} />
                ))}
              </div>
            </div>
            <button onClick={handleAddCategory} style={{
              width: '100%', padding: 14, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, cursor: 'pointer', marginTop: 8
            }}>Add Category</button>
          </div>
        </Modal>
      )}

      {showProductModal && (
        <Modal title="Add New Product" onClose={() => setShowProductModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Product Name *</label>
              <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., Vanilla Scoop" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Category *</label>
              <select value={newProduct.categoryId} onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none' }}>
                <option value="">Select Category</option>
                {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Price (₹) *</label>
                <input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Cost (₹)</label>
                <input type="number" value={newProduct.cost} onChange={e => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Initial Stock</label>
                <input type="number" value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Alert Threshold</label>
                <input type="number" value={newProduct.stockAlertThreshold} onChange={e => setNewProduct({ ...newProduct, stockAlertThreshold: parseInt(e.target.value) || 10 })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>SKU (Optional)</label>
              <input type="text" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleAddProduct} style={{
              width: '100%', padding: 14, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, cursor: 'pointer', marginTop: 8
            }}>Add Product</button>
          </div>
        </Modal>
      )}

      {/* ── EDIT PRODUCT MODAL ── */}
      {showEditModal && editingProduct && (
        <Modal title={`Edit: ${editingProduct.name}`} onClose={() => { setShowEditModal(false); setEditingProduct(null); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Product Name *</label>
              <input type="text" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Category</label>
              <select value={editForm.categoryId || ''} onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none' }}>
                <option value="">Select Category</option>
                {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Price (₹) *</label>
                <input type="number" value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Cost (₹)</label>
                <input type="number" value={editForm.cost || ''} onChange={e => setEditForm({ ...editForm, cost: e.target.value })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Stock Quantity</label>
                <input type="number" value={editForm.quantity ?? ''} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Alert Threshold</label>
                <input type="number" value={editForm.stockAlertThreshold ?? ''} onChange={e => setEditForm({ ...editForm, stockAlertThreshold: e.target.value })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>SKU</label>
              <input type="text" value={editForm.sku || ''} onChange={e => setEditForm({ ...editForm, sku: e.target.value })}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {/* Active Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 10, padding: '12px 16px' }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', flex: 1 }}>Product Active</label>
              <div
                onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                style={{
                  width: 48, height: 26, borderRadius: 13,
                  background: editForm.isActive ? '#2563eb' : '#d1d5db',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: editForm.isActive ? 25 : 3,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
              <button onClick={() => { setShowEditModal(false); setEditingProduct(null); }} style={{
                padding: 14, background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 12,
                fontWeight: 700, cursor: 'pointer', fontSize: 15,
              }}>Cancel</button>
              <button onClick={handleUpdateProduct} style={{
                padding: 14, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff',
                border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 15,
              }}>💾 Save Changes</button>
            </div>
          </div>
        </Modal>
      )}


      <style>{`
        @media (min-width: 768px) {
          .mobile-bottom-nav { display: none !important; }
          .desktop-tabs { display: flex !important; }
          div[style*="paddingBottom: 80"] { padding-bottom: 0 !important; }
        }
        @media (max-width: 767px) {
          .desktop-tabs { display: none !important; }
          .stock-table-header { grid-template-columns: 1fr 80px 60px 70px 60px !important; font-size: 10px !important; }
          .stock-table-row { grid-template-columns: 1fr 80px 60px 70px 60px !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        button:active {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  );
}

// ── Standalone Modal (must be outside AdminPanel to avoid remount blink) ──
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: 24, width: '90%', maxWidth: 480,
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', width: 32, height: 32, borderRadius: '50%', fontSize: 18, cursor: 'pointer', color: '#4b5563' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
