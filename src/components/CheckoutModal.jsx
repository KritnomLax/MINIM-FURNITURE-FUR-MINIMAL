import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CreditCard, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../config/supabaseClient';
import { formatPrice } from '../utils/formatters';
import './CheckoutModal.css';

const CheckoutModal = ({ onClose }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName:  '',
    email:     user?.email ?? '',
    phone:     '081-234-5678',
    address:   '',
    city:      '',
    zipCode:   '',
    paymentMethod: 'promptpay', // promptpay or cod or card
    notes:     '',
    cardNumber: '',
    expiry:     '',
    cvv:        '',
  });

  const handleAutoFill = () => {
    setFormData(prev => ({
      ...prev,
      firstName: 'สมชาย',
      lastName:  'ใจดี',
      email:     user?.email ?? 'somchai@example.com',
      phone:     '089-876-5432',
      address:   '99/1 ซอยสุขุมวิท 55 (ทองหล่อ)',
      city:      'แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ',
      zipCode:   '10110',
      notes:     'มีลิฟต์ขนของ กรุณาโทรแจ้งก่อนส่ง 1 ชั่วโมงครับ',
      cardNumber: '4111 2222 3333 4444',
      expiry:     '12/28',
      cvv:        '123',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      addToast('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า', 'error');
      return;
    }

    if (cartItems.length === 0) {
      addToast('ไม่มีสินค้าในตะกร้า', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = cartItems.map(item => {
        const parsedId = parseInt(item.id, 10);
        return {
          product_id:   isNaN(parsedId) ? null : parsedId,
          product_name: item.name,
          quantity:     item.quantity,
          price:        item.price,
        };
      });

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      let fullAddress = `${formData.address}, ${formData.city} ${formData.zipCode}`.trim();
      if (formData.notes.trim()) {
        fullAddress += ` (หมายเหตุ: ${formData.notes.trim()})`;
      }

      const { error } = await supabase.rpc('place_order', {
        p_items: itemsPayload,
        p_shipping_name: fullName || 'ลูกค้าทั่วไป',
        p_shipping_address: fullAddress,
        p_shipping_phone: formData.phone || '081-234-5678',
      });

      if (error) throw error;

      clearCart();
      addToast('บันทึกคำสั่งซื้อเรียบร้อยแล้ว! ร้านค้าได้รับออร์เดอร์แล้ว', 'success');
      onClose();

    } catch (err) {
      console.error('Checkout Error:', err.message);
      addToast('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-content">
        <button className="checkout-close" onClick={onClose} disabled={isSubmitting} aria-label="ปิดหน้าต่าง">
          <X size={24} />
        </button>

        <div className="checkout-header-bar">
          <div>
            <h2>ยืนยันคำสั่งซื้อและการจัดส่ง</h2>
            <p className="checkout-subtitle">จัดส่งเฟอร์นิเจอร์ไม้จริงตรงจากสตูดิโอช่างไม้ พร้อมประกอบติดตั้งฟรี</p>
          </div>
          <button
            type="button"
            className="btn-secondary autofill-btn"
            onClick={handleAutoFill}
          >
            <Sparkles size={16} /> เติมข้อมูลทดสอบ
          </button>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          {/* ข้อมูลจัดส่ง */}
          <div className="form-section">
            <div className="section-title-wrap">
              <Truck size={18} className="section-icon" />
              <h3>ข้อมูลการจัดส่งสินค้า</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>ชื่อจริง *</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} disabled={isSubmitting} placeholder="เช่น สมชาย" />
              </div>
              <div className="form-group">
                <label>นามสกุล *</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} disabled={isSubmitting} placeholder="เช่น ใจดี" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>เบอร์โทรศัพท์ติดต่อช่างส่งของ *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} disabled={isSubmitting} placeholder="08x-xxx-xxxx" />
              </div>
              <div className="form-group">
                <label>อีเมลสำหรับรับเอกสารยืนยัน *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} disabled={isSubmitting} />
              </div>
            </div>

            <div className="form-group">
              <label>ที่อยู่จัดส่ง (บ้านเลขที่, ถนน, ซอย, อาคาร) *</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} disabled={isSubmitting} placeholder="เช่น 99/1 อาคารมินิมอล ซ.ทองหล่อ" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>แขวง/ตำบล, เขต/อำเภอ, จังหวัด *</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} disabled={isSubmitting} placeholder="เช่น วัฒนา กรุงเทพมหานคร" />
              </div>
              <div className="form-group">
                <label>รหัสไปรษณีย์ *</label>
                <input type="text" name="zipCode" required value={formData.zipCode} onChange={handleChange} disabled={isSubmitting} placeholder="10110" />
              </div>
            </div>

            <div className="form-group">
              <label>หมายเหตุเพิ่มเติมสำหรับการจัดส่ง (Optional)</label>
              <input type="text" name="notes" value={formData.notes} onChange={handleChange} disabled={isSubmitting} placeholder="เช่น ขนขึ้นชั้น 3, ฝากไว้ที่ป้อมยาม" />
            </div>
          </div>

          {/* ช่องทางการชำระเงิน */}
          <div className="form-section">
            <div className="section-title-wrap">
              <CreditCard size={18} className="section-icon" />
              <h3>ช่องทางการชำระเงิน</h3>
            </div>

            <div className="payment-options-grid">
              <label className={`payment-method-card ${formData.paymentMethod === 'promptpay' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="promptpay" 
                  checked={formData.paymentMethod === 'promptpay'} 
                  onChange={handleChange}
                />
                <div className="method-text">
                  <strong>พร้อมเพย์ QR Code (PromptPay)</strong>
                  <span>สแกนจ่ายสะดวกรวดเร็ว ไม่มีค่าธรรมเนียม</span>
                </div>
              </label>

              <label className={`payment-method-card ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={formData.paymentMethod === 'cod'} 
                  onChange={handleChange}
                />
                <div className="method-text">
                  <strong>ชำระเงินปลายทาง (Cash on Delivery)</strong>
                  <span>ตรวจเช็กสภาพงานไม้จริงก่อนชำระเงินกับช่างส่งของ</span>
                </div>
              </label>

              <label className={`payment-method-card ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card" 
                  checked={formData.paymentMethod === 'card'} 
                  onChange={handleChange}
                />
                <div className="method-text">
                  <strong>บัตรเครดิต / เดบิต</strong>
                  <span>Visa, Mastercard, JCB (ระบบทดสอบ Demo)</span>
                </div>
              </label>
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="card-fields-wrap">
                <div className="form-group">
                  <label>หมายเลขบัตร</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="4111 2222 3333 4444"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>วันหมดอายุ (ดด/ปป)</label>
                    <input type="text" name="expiry" placeholder="12/28" value={formData.expiry} onChange={handleChange} autoComplete="off" />
                  </div>
                  <div className="form-group">
                    <label>รหัส CVV</label>
                    <input type="password" name="cvv" placeholder="•••" value={formData.cvv} onChange={handleChange} autoComplete="off" />
                  </div>
                </div>
              </div>
            )}

            <div className="store-guarantee-badge">
              <ShieldCheck size={18} />
              <span>การรับประกัน: เฟอร์นิเจอร์ไม้แท้รับประกันโครงสร้าง 5 ปีเต็ม และบริการประกอบติดตั้งฟรีโดยทีมช่างชำนาญการ</span>
            </div>
          </div>

          {/* สรุปยอด */}
          <div className="checkout-summary">
            <div className="summary-row">
              <span>ราคาสินค้ารวม</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>ค่าจัดส่งและประกอบติดตั้ง</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>ฟรีทั่วประเทศ</span>
            </div>
            <div className="summary-row total">
              <span>ยอดชำระสุทธิ</span>
              <span className="total-highlight">{formatPrice(cartTotal)}</span>
            </div>
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'กำลังบันทึกคำสั่งซื้อ...' : `ยืนยันสั่งซื้อสินค้า ${formatPrice(cartTotal)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
