import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Trash2, ShoppingCart, Cuboid, Package, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../config/supabaseClient';
import { formatPrice } from '../utils/formatters';
import './UserProfile.css';

const STATUS_MAP = {
  pending:    { label: 'รอดำเนินการ', class: 'status-pending' },
  processing: { label: 'กำลังเตรียมจัดส่ง', class: 'status-processing' },
  shipped:    { label: 'จัดส่งแล้ว', class: 'status-shipped' },
  delivered:  { label: 'จัดส่งสำเร็จ', class: 'status-delivered' },
  cancelled:  { label: 'ยกเลิกคำสั่งซื้อ', class: 'status-cancelled' },
};

const StatusBadge = ({ status }) => {
  const current = STATUS_MAP[status] || { label: status || 'รอดำเนินการ', class: 'status-pending' };
  return (
    <span className={`status-badge ${current.class}`}>
      {current.label}
    </span>
  );
};

const OrderCard = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="order-card">
      <button
        className="order-card-header"
        onClick={() => setIsExpanded(prev => !prev)}
        aria-expanded={isExpanded}
      >
        <div className="order-card-left">
          <Package size={18} className="order-icon" />
          <div>
            <p className="order-id">หมายเลขคำสั่งซื้อ #{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="order-date">
              สั่งซื้อเมื่อ {new Date(order.created_at).toLocaleDateString('th-TH', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="order-card-right">
          <StatusBadge status={order.status} />
          <p className="order-total">{formatPrice(order.total_price)}</p>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isExpanded && (
        <div className="order-items-list">
          <table className="order-items-table">
            <thead>
              <tr>
                <th>รายการสินค้า</th>
                <th>จำนวน</th>
                <th>ราคาต่อหน่วย</th>
                <th>รวมย่อย</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map(item => (
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
      )}
    </div>
  );
};

const TYPE_NAMES = {
  table:    'โต๊ะไม้สั่งทำ',
  chair:    'เก้าอี้ไม้สั่งทำ',
  cupboard: 'ตู้วางชาม/ตู้ข้างไม้สั่งทำ',
  shoerack: 'ชั้นวางรองเท้าไม้สั่งทำ',
};

const DesignCard = ({ design, onAddToCart, onDelete }) => {
  const color      = design.color;
  const colorName  = design.color_name  ?? design.colorName  ?? '—';
  const width      = design.width;
  const depth      = design.depth;
  const height     = design.height;
  const type       = design.furniture_type ?? design.furnitureType ?? 'table';
  const createdAt  = design.created_at   ?? design.createdAt;
  const typeLabel  = TYPE_NAMES[type] || 'แบบจำลอง 3 มิติ';

  return (
    <div className="design-card">
      <div className="design-preview" style={{ backgroundColor: color }}>
        <div className="mock-table-top" />
      </div>
      <div className="design-details">
        <h4>{typeLabel}</h4>
        <p className="design-meta">
          {colorName} · ขนาด {Number(width) * 10} × {Number(depth) * 10} × {Number(height) * 10} ซม.
        </p>
        <p className="design-date">
          บันทึกเมื่อ: {new Date(createdAt).toLocaleDateString('th-TH')}
        </p>
        <div className="design-actions">
          <button className="btn-primary btn-sm" onClick={() => onAddToCart(design)}>
            <ShoppingCart size={16} /> ใส่ตะกร้า
          </button>
          <button
            className="icon-btn delete-btn"
            onClick={() => onDelete(design.id)}
            aria-label="ลบแบบที่บันทึก"
            title="ลบแบบนี้"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { user, logout, savedDesigns, designsLoading, deleteDesign } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_price,
          status,
          created_at,
          order_items ( id, product_name, quantity, price )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data ?? []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      addToast('ไม่สามารถดึงข้อมูลประวัติคำสั่งซื้อ: ' + err.message, 'error');
    } finally {
      setOrdersLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, fetchOrders]);

  const handleAddToCart = (design) => {
    const width  = Number(design.width);
    const depth  = Number(design.depth);
    const color  = design.color_name ?? design.colorName ?? '';
    const type   = design.furniture_type ?? design.furnitureType ?? 'table';
    const typeLabel = TYPE_NAMES[type] || 'แบบสั่งทำพิเศษ';
    const price  = (width * depth * 2) + 150;

    addToCart({
      id:          `custom-${design.id}`,
      name:        `${typeLabel} (${color})`,
      category:    'Custom Design',
      price:       price,
      image:       'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
      description: `ขนาด กว้าง:${width * 10} × ลึก:${depth * 10} ซม.`,
    });
    addToast('เพิ่มแบบที่ออกแบบไว้ลงในตะกร้าสินค้าแล้ว', 'success');
  };

  const handleDelete = async (id) => {
    await deleteDesign(id);
    addToast('ลบแบบจำลอง 3D ออกจากโปรไฟล์แล้ว', 'success');
  };

  if (!user) return null;

  return (
    <section className="profile-section">
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="avatar">{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
            <div>
              <h2>สวัสดี, {user.email}</h2>
              <p>ยินดีต้อนรับสู่บัญชีสมาชิก MINIM Furniture</p>
            </div>
          </div>
          <button className="btn-secondary logout-btn" onClick={logout}>
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} /> ประวัติการสั่งซื้อ
          </button>
          <button
            className={`profile-tab ${activeTab === 'designs' ? 'active' : ''}`}
            onClick={() => setActiveTab('designs')}
          >
            <Cuboid size={18} /> แบบ 3D ที่บันทึกไว้
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="profile-card">
            <div className="card-header">
              <Package size={24} />
              <h3>รายการคำสั่งซื้อของคุณ</h3>
            </div>

            {ordersLoading ? (
              <div className="loading-state">
                <Loader size={32} className="spin" />
                <p>กำลังโหลดประวัติคำสั่งซื้อ...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <p>คุณยังไม่มีประวัติการสั่งซื้อสินค้า</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Designs Tab */}
        {activeTab === 'designs' && (
          <div className="profile-card">
            <div className="card-header">
              <Cuboid size={24} />
              <h3>แบบเฟอร์นิเจอร์ 3 มิติที่คุณบันทึกไว้</h3>
            </div>

            {designsLoading ? (
              <div className="loading-state">
                <Loader size={32} className="spin" />
                <p>กำลังโหลดแบบจำลองที่คุณบันทึกไว้...</p>
              </div>
            ) : savedDesigns.length === 0 ? (
              <div className="empty-state">
                <p>คุณยังไม่ได้บันทึกแบบที่ออกแบบไว้ ลองไปที่หน้า "ออกแบบ 3D" แล้วกดบันทึกแบบดูสิ!</p>
              </div>
            ) : (
              <div className="saved-designs-grid">
                {savedDesigns.map(design => (
                  <DesignCard
                    key={design.id}
                    design={design}
                    onAddToCart={handleAddToCart}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserProfile;
