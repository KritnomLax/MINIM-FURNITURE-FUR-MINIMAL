import React, { useEffect } from 'react';
import { X, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatters';
import { handleImageError, FALLBACK_WOOD_IMAGE } from '../utils/imageUtils';
import ProductReviews from './ProductReviews';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAddToCart = () => {
    addToCart(product);
    addToast(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`, 'success');
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    if (isInWishlist(product.id)) {
      addToast(`นำ "${product.name}" ออกจากรายการถูกใจ`, 'info');
    } else {
      addToast(`บันทึก "${product.name}" ในรายการถูกใจแล้ว`, 'success');
    }
  };

  const isLiked = isInWishlist(product.id);

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-content" onClick={e => e.stopPropagation()}>
        <button className="quick-view-close" onClick={onClose} aria-label="ปิดหน้าต่าง">
          <X size={24} />
        </button>
        
        <div className="quick-view-layout">
          <div className="quick-view-image-container">
            <img 
              src={product.image || FALLBACK_WOOD_IMAGE} 
              alt={product.name} 
              className="quick-view-image" 
              onError={handleImageError}
            />
          </div>
          
          <div className="quick-view-details">
            <span className="quick-view-category">{product.category}</span>
            <h2 className="quick-view-title">{product.name}</h2>
            <p className="quick-view-price">{formatPrice(product.price)}</p>
            
            <p className="quick-view-desc">{product.description || 'เฟอร์นิเจอร์คุณภาพระดับพรีเมียม เพื่อบ้านที่สวยงามของคุณ'}</p>
            
            <div className="quick-view-meta">
              {product.dimensions && (
                <div className="meta-item">
                  <strong>ขนาด:</strong> {product.dimensions}
                </div>
              )}
              {product.material && (
                <div className="meta-item">
                  <strong>วัสดุ:</strong> {product.material}
                </div>
              )}
            </div>
            
            <div className="quick-view-actions">
              <button className="btn-primary flex-1 add-cart" onClick={handleAddToCart}>
                <ShoppingCart size={20} />
                เพิ่มลงในตะกร้า
              </button>
              
              <button 
                className={`btn-secondary quick-wishlist ${isLiked ? 'active' : ''}`}
                onClick={handleToggleWishlist}
                title={isLiked ? 'นำออกจากรายการถูกใจ' : 'เพิ่มในรายการถูกใจ'}
              >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              </button>
            </div>
            
            <ProductReviews productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
