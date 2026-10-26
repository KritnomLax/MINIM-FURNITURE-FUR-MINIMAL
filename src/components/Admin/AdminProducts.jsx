import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Plus, Edit2, Trash2, Save, X, Package, ChevronDown, ChevronUp, Loader, RefreshCw, Search, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { handleImageError, FALLBACK_WOOD_IMAGE, WOOD_IMAGE_PRESETS } from '../../utils/imageUtils';
import './AdminProducts.css';
import { useToast } from '../../context/ToastContext';

const ORDER_STATUSES = [
  { value: 'pending',    label: 'รอดำเนินการ (Pending)' },
  { value: 'processing', label: 'กำลังเตรียมของ (Processing)' },
  { value: 'shipped',    label: 'จัดส่งแล้ว (Shipped)' },
  { value: 'delivered',  label: 'จัดส่งสำเร็จ (Delivered)' },
  { value: 'cancelled',  label: 'ยกเลิกออร์เดอร์ (Cancelled)' },
];

// ── AdminOrders Component ──────────────────────────────────────
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total_price,
        shipping_name,
        shipping_address,
        shipping_phone,
        user_id,
        order_items ( id, product_name, quantity, price )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      addToast('ไม่สามารถโหลดรายการคำสั่งซื้อ: ' + error.message, 'error');
    } else {
      setOrders(data ?? []);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus, prevStatus) => {
    setUpdatingId(orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: prevStatus } : o));
      addToast('ไม่สามารถอัปเดตสถานะได้: ' + error.message, 'error');
    } else {
      addToast(`อัปเดตออร์เดอร์ #${orderId.slice(0, 8).toUpperCase()} เรียบร้อยแล้ว`, 'success');
    }
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const id = o.id.toLowerCase();
    const name = (o.shipping_name || '').toLowerCase();
    return id.includes(term) || name.includes(term);
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Loader size={32} className="spin" />
        <p style={{ marginTop: 12, color: 'var(--color-text-secondary)' }}>กำลังโหลดรายการคำสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>จัดการคำสั่งซื้อของลูกค้า (Orders Management)</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            ติดตามสถานะและตรวจสอบข้อมูลการจัดส่งของลูกค้า
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchOrders} title="โหลดข้อมูลใหม่">
          <RefreshCw size={18} /> รีเฟรชข้อมูล
        </button>
      </div>

      {/* ค้นหาออร์เดอร์ */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', maxWidth: '350px' }}>
        <input
          type="text"
          placeholder="ค้นหาตามรหัสคำสั่งซื้อ หรือชื่อผู้รับ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-text-primary)',
            width: '100%',
            fontSize: '0.9rem'
          }}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>ยังไม่มีคำสั่งซื้อในระบบ</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>รหัสคำสั่งซื้อ</th>
                <th>วันที่สั่งซื้อ</th>
                <th>ชื่อผู้รับ</th>
                <th>ยอดรวม</th>
                <th>เปลี่ยนสถานะ</th>
                <th>ดูรายการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td><code style={{ fontSize: '0.85rem' }}>#{order.id.slice(0, 8).toUpperCase()}</code></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(order.created_at).toLocaleDateString('th-TH', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                      {order.shipping_name || '—'}
                    </td>
                    <td><strong>{formatPrice(order.total_price)}</strong></td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status ?? 'pending'}
                        disabled={updatingId === order.id}
                        onChange={e => handleStatusChange(order.id, e.target.value, order.status)}
                      >
                        {ORDER_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="icon-btn edit-btn"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        title="ดูรายการสินค้าข้างใน"
                      >
                        {expandedId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                  </tr>

                  {expandedId === order.id && (
                    <tr className="order-detail-row">
                      <td colSpan="6">
                        <div className="order-detail-panel">
                          {order.shipping_address && (
                            <p className="order-shipping-info">
                              📦 <strong>ที่อยู่จัดส่ง:</strong> {order.shipping_name} · {order.shipping_address} · โทร. {order.shipping_phone}
                            </p>
                          )}
                          <table className="order-items-inner-table">
                            <thead>
                              <tr>
                                <th>ชื่อสินค้า</th>
                                <th>จำนวน</th>
                                <th>ราคาต่อหน่วย</th>
                                <th>ยอดรวม</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(order.order_items ?? []).map(item => (
                                <tr key={item.id}>
                                  <td>{item.product_name}</td>
                                  <td>{item.quantity}</td>
                                  <td>{formatPrice(item.price)}</td>
                                  <td>{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── AdminProductsPanel Component ──────────────────────────────
const AdminProductsPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { addToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) {
      console.error('Error fetching products:', error);
      addToast('ไม่สามารถดึงข้อมูลสินค้าได้', 'error');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้ารายการนี้?')) return;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) {
      addToast('เกิดข้อผิดพลาดในการลบสินค้า', 'error');
    } else {
      addToast('ลบสินค้าออกจากระบบเรียบร้อยแล้ว', 'success');
      fetchProducts();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const rawUrl = (currentProduct.image_url || '').trim();
    if (rawUrl.startsWith('C:\\') || rawUrl.startsWith('D:\\') || rawUrl.startsWith('file://')) {
      addToast('กรุณาใช้ลิงก์ภาพแบบ URL (http:// หรือ https://) เท่านั้น ไม่สามารถใช้ที่อยู่ไฟล์ในเครื่องได้', 'error');
      return;
    }

    const productData = {
      name: currentProduct.name,
      price: parseFloat(currentProduct.price),
      category: currentProduct.category,
      width: parseFloat(currentProduct.width) || null,
      depth: parseFloat(currentProduct.depth) || null,
      image_url: rawUrl || 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=900&q=80'
    };

    let error = null;

    if (currentProduct.id) {
      const res = await supabase
        .from('products')
        .update(productData)
        .eq('id', currentProduct.id)
        .select();

      if (res.error) {
        error = res.error;
      } else if (!res.data || res.data.length === 0) {
        error = new Error('Supabase RLS บล็อกการแก้ไข (กรุณารัน SQL ปลดล็อกสิทธิ์ใน Supabase)');
      }
    } else {
      const res = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (res.error) {
        error = res.error;
      } else if (!res.data || res.data.length === 0) {
        error = new Error('Supabase RLS บล็อกการเพิ่มข้อมูล (กรุณารัน SQL ปลดล็อกสิทธิ์ใน Supabase)');
      }
    }

    if (error) {
      console.error('Save error:', error);
      addToast('ข้อผิดพลาด: ' + (error.message || 'ไม่สามารถบันทึกสินค้าได้'), 'error');
    } else {
      addToast('บันทึกข้อมูลสินค้าเรียบร้อยแล้ว', 'success');
      setIsEditing(false);
      fetchProducts();
    }
  };

  const openEditor = (product = null) => {
    if (product) {
      setCurrentProduct(product);
    } else {
      setCurrentProduct({
        name: '',
        price: '',
        category: 'Living Room',
        width: '',
        depth: '',
        image_url: ''
      });
    }
    setIsEditing(true);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>จัดการรายการสินค้า (Products Management)</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            เพิ่ม แก้ไข และลบสินค้าที่จัดแสดงบนหน้าร้าน (CRUD)
          </p>
        </div>
        <button className="btn-primary" onClick={() => openEditor()}>
          <Plus size={20} /> เพิ่มสินค้าใหม่
        </button>
      </div>

      {loading ? (
        <p>กำลังโหลดรายการสินค้า...</p>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>รูปภาพ</th>
                <th>ชื่อสินค้า</th>
                <th>หมวดหมู่</th>
                <th>ราคา</th>
                <th>สัดส่วน (กว้าง × ลึก)</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                    ยังไม่มีสินค้าในระบบ ลองกดปุ่ม "เพิ่มสินค้าใหม่" เพื่อสาธิตการทำงาน
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <img 
                        src={p.image_url || FALLBACK_WOOD_IMAGE} 
                        alt={p.name} 
                        className="admin-product-img" 
                        onError={handleImageError} 
                      />
                    </td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td>{p.width && p.depth ? `${p.width * 10} × ${p.depth * 10} ซม.` : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn edit-btn" onClick={() => openEditor(p)} title="แก้ไข">
                          <Edit2 size={18} />
                        </button>
                        <button className="icon-btn delete-btn" onClick={() => handleDelete(p.id)} title="ลบสินค้า">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isEditing && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>{currentProduct.id ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
              <button className="close-btn" onClick={() => setIsEditing(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label>ชื่อสินค้า</label>
                <input 
                  type="text" 
                  required 
                  value={currentProduct.name} 
                  onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                  placeholder="เช่น Minimalist Coffee Table"
                />
              </div>
              <div className="form-group row">
                <div className="col">
                  <label>ราคาฐาน ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={currentProduct.price} 
                    onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})}
                  />
                </div>
                <div className="col">
                  <label>หมวดหมู่</label>
                  <select 
                    value={currentProduct.category} 
                    onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                  >
                    <option value="Living Room">ห้องนั่งเล่น (Living Room)</option>
                    <option value="Bedroom">ห้องนอน (Bedroom)</option>
                    <option value="Office">ห้องทำงาน (Office)</option>
                    <option value="Custom Design">ดีไซน์สั่งทำ (Custom Design)</option>
                  </select>
                </div>
              </div>
              <div className="form-group row">
                <div className="col">
                  <label>ความกว้าง (หน่วยสเกล 1 = 10 ซม.)</label>
                  <input 
                    type="number" 
                    value={currentProduct.width || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, width: e.target.value})}
                    placeholder="เช่น 10 (= 100 ซม.)"
                  />
                </div>
                <div className="col">
                  <label>ความลึก (หน่วยสเกล 1 = 10 ซม.)</label>
                  <input 
                    type="number" 
                    value={currentProduct.depth || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, depth: e.target.value})}
                    placeholder="เช่น 6 (= 60 ซม.)"
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>ลิงก์ URL รูปภาพสินค้า</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    (รองรับ https:// หรือกดเลือกภาพสำเร็จรูป)
                  </span>
                </label>
                <input 
                  type="text" 
                  value={currentProduct.image_url || ''} 
                  onChange={e => setCurrentProduct({...currentProduct, image_url: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                />

                {/* Local path warning */}
                {((currentProduct.image_url || '').startsWith('C:\\') || 
                  (currentProduct.image_url || '').startsWith('D:\\') || 
                  (currentProduct.image_url || '').startsWith('file://')) && (
                  <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={14} /> เบราว์เซอร์ไม่สามารถเปิดไฟล์ในเครื่องได้ กรุณาใช้ URL หรือเลือกปุ่มลัดด้านล่าง
                  </div>
                )}

                {/* Quick Presets */}
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                    ⚡ หรือคลิกเลือกภาพเฟอร์นิเจอร์ไม้แท้ที่เตรียมไว้:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {WOOD_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setCurrentProduct({ ...currentProduct, image_url: preset.url })}
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--color-border)',
                          background: currentProduct.image_url === preset.url ? 'var(--color-accent, #8b6914)' : 'var(--color-bg)',
                          color: currentProduct.image_url === preset.url ? '#fff' : 'var(--color-text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--color-bg)', borderRadius: '6px', border: '1px dashed var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={currentProduct.image_url || FALLBACK_WOOD_IMAGE}
                      alt="ตัวอย่างภาพ"
                      onError={handleImageError}
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', background: '#f5f5f5' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', color: 'var(--color-text-primary)' }}>
                        ตัวอย่างภาพแสดงผล (Live Preview)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {currentProduct.image_url ? 'ภาพจะแสดงตาม URL ที่ท่านระบุ (หากเสียจะเปลี่ยนเป็นภาพไม้แท้ให้อัตโนมัติ)' : 'ยังไม่มี URL ภาพ ระบบจะใช้ภาพไม้แท้เริ่มต้น'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>ยกเลิก</button>
                <button type="submit" className="btn-primary">
                  <Save size={18} /> บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Admin Dashboard (Tab wrapper) ────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <section className="admin-section">
      <div className="container">
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 จัดการสินค้า (Products)
          </button>
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 จัดการคำสั่งซื้อ (Orders)
          </button>
        </div>

        {activeTab === 'products' && <AdminProductsPanel />}
        {activeTab === 'orders'   && <AdminOrders />}
      </div>
    </section>
  );
};

export default AdminDashboard;
