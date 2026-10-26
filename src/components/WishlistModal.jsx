import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatters';
import { handleImageError, FALLBACK_WOOD_IMAGE } from '../utils/imageUtils';
import './WishlistModal.css';

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

const WishlistModal = ({ onClose, onQuickView }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (product) => {
    addToCart(product);
    addToast(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`, 'success');
  };

  const handleRemove = (product) => {
    toggleWishlist(product);
    addToast(`นำ "${product.name}" ออกจากรายการที่ชอบแล้ว`, 'info');
  };

  return (
    <>
      <motion.div
        className="wishlist-backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={onClose}
      />

      <motion.div
        className="wishlist-modal"
        variants={panelVariants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <div className="wishlist-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={22} className="wishlist-header-icon" fill="currentColor" />
            <h2>รายการสินค้าที่ถูกใจ ({wishlist.length})</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="ปิด">
            <X size={24} />
          </button>
        </div>

        <div className="wishlist-body">
          {wishlist.length === 0 ? (
            <div className="empty-wishlist">
              <Heart size={48} className="empty-wishlist-icon" />
              <p>ยังไม่มีสินค้าในรายการที่ถูกใจ</p>
              <span>กดที่รูปหัวใจบนการ์ดสินค้าเพื่อบันทึกสินค้าที่คุณชื่นชอบไว้ที่นี่</span>
              <button className="btn-primary" onClick={onClose} style={{ marginTop: '16px' }}>
                ไปเลือกชมสินค้า
              </button>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlist.map(item => (
                <div key={item.id} className="wishlist-item">
                  <img 
                    src={item.image || FALLBACK_WOOD_IMAGE} 
                    alt={item.name} 
                    className="wishlist-item-img" 
                    onError={handleImageError} 
                  />
                  <div className="wishlist-item-info">
                    <h4>{item.name}</h4>
                    <span className="wishlist-item-cat">{item.category}</span>
                    <p className="wishlist-item-price">{formatPrice(item.price)}</p>

                    <div className="wishlist-item-actions">
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart size={15} /> ใส่ตะกร้า
                      </button>
                      <button 
                        className="icon-btn delete-btn"
                        onClick={() => handleRemove(item)}
                        title="ลบออกจากรายการถูกใจ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default WishlistModal;
