import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import { handleImageError, FALLBACK_WOOD_IMAGE } from '../utils/imageUtils';
import CheckoutModal from './CheckoutModal';
import './CartModal.css';

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  show:   { x: 0,      opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 32 } },
  exit:   { x: '100%', opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.25 } },
  exit:   { opacity: 0, transition: { duration: 0.25 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:   { opacity: 0, x: -20, height: 0, marginBottom: 0, paddingBottom: 0, transition: { duration: 0.22 } },
};

const CartModal = ({ onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (isCheckoutOpen) {
    return (
      <CheckoutModal onClose={() => {
        setIsCheckoutOpen(false);
        onClose();
      }} />
    );
  }

  return (
    <>
      <motion.div
        className="cart-backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={onClose}
      />

      <motion.div
        className="cart-modal"
        variants={panelVariants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <div className="cart-header">
          <h2>ตะกร้าสินค้าของคุณ</h2>
          <button className="close-btn" onClick={onClose} aria-label="ปิดตะกร้า">
            <X size={24} />
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <motion.div
              className="empty-cart"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
            >
              <ShoppingBag size={48} className="empty-cart-icon" />
              <p>ยังไม่มีสินค้าในตะกร้า</p>
              <button className="btn-primary" onClick={onClose}>เลือกซื้อสินค้าต่อ</button>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="cart-items">
                {cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    className="cart-item"
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                  >
                    <img 
                      src={item.image || FALLBACK_WOOD_IMAGE} 
                      alt={item.name} 
                      className="cart-item-image" 
                      onError={handleImageError} 
                    />
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">{formatPrice(item.price)}</p>

                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="ลดจำนวน">
                            <Minus size={16} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="เพิ่มจำนวน">
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          ลบออก
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <span>ยอดรวมคำสั่งซื้อ</span>
              <span className="cart-total">{formatPrice(cartTotal)}</span>
            </div>
            <p className="cart-taxes">รวมภาษีมูลค่าเพิ่มและฟรีค่าจัดส่งทั่วประเทศ</p>
            <button className="btn-primary checkout-btn" onClick={() => setIsCheckoutOpen(true)}>
              ดำเนินการสั่งซื้อ (Checkout)
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default CartModal;
