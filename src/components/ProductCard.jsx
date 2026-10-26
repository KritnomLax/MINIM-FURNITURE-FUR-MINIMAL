import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatters';
import { handleImageError, FALLBACK_WOOD_IMAGE } from '../utils/imageUtils';
import './ProductCard.css';

export const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

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
    <motion.div
      className="product-card"
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="product-image-container">
        <img 
          src={product.image || FALLBACK_WOOD_IMAGE} 
          alt={product.name} 
          className="product-image" 
          loading="lazy" 
          onError={handleImageError}
        />

        <motion.button
          className={`wishlist-btn-card ${isLiked ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          aria-label="ถูกใจสินค้า"
          whileTap={{ scale: 1.35 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          title={isLiked ? 'นำออกจากรายการถูกใจ' : 'เพิ่มในรายการถูกใจ'}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
        </motion.button>

        <div className="product-overlay">
          <div className="product-actions">
            <motion.button
              className="action-btn"
              onClick={handleAddToCart}
              aria-label="เพิ่มลงตะกร้า"
              title="เพิ่มลงตะกร้า"
              whileTap={{ scale: 0.88 }}
            >
              <ShoppingCart size={20} />
            </motion.button>
            <motion.button
              className="action-btn"
              onClick={onQuickView}
              aria-label="ดูรายละเอียดด่วน"
              title="ดูรายละเอียดด่วน"
              whileTap={{ scale: 0.88 }}
            >
              <Eye size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
