import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Heart, Sun, Moon, Cuboid, User, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import './Navbar.css';

const Navbar = ({ onCartClick, onWishlistClick, currentView, onNavigate }) => {
  const { cartCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const { wishlist } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (view) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-content">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); handleNav('shop'); }}>
          MINI<span>M</span>
        </a>

        <div className="nav-links desktop-only">
          <a 
            href="#" 
            className={currentView === 'shop' ? 'active' : ''} 
            onClick={(e) => { e.preventDefault(); handleNav('shop'); }}
          >
            เลือกชมสินค้า
          </a>
          <a 
            href="#" 
            className={currentView === 'designer' ? 'active' : ''} 
            onClick={(e) => { e.preventDefault(); handleNav('designer'); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cuboid size={16} /> ออกแบบ 3D
            </span>
          </a>
        </div>

        <div className="nav-actions">
          <button 
            className="icon-btn theme-toggle" 
            onClick={toggleTheme} 
            aria-label="เปลี่ยนธีมสี"
            title={isDarkMode ? 'โหมดสว่าง' : 'โหมดมืด'}
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          
          <button 
            className="icon-btn admin-btn" 
            onClick={() => handleNav('admin')} 
            aria-label="ระบบจัดการแอดมิน" 
            title="ระบบจัดการหลังบ้าน (Admin)"
          >
            <Shield size={22} />
          </button>

          <button 
            className="icon-btn profile-btn" 
            onClick={() => handleNav('profile')} 
            aria-label="ข้อมูลส่วนตัว" 
            title="บัญชีผู้ใช้ & ประวัติคำสั่งซื้อ"
          >
            <User size={22} />
          </button>
          
          <button 
            className="icon-btn wishlist-btn" 
            onClick={onWishlistClick}
            aria-label="สินค้าที่ถูกใจ" 
            title="รายการสินค้าที่ถูกใจ"
          >
            <Heart size={22} />
            <AnimatePresence>
              {wishlist.length > 0 && (
                <motion.span
                  key={wishlist.length}
                  className="action-badge"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 18 } }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                >
                  {wishlist.length}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button className="icon-btn cart-btn" onClick={onCartClick} aria-label="ตะกร้าสินค้า" title="ตะกร้าสินค้า">
            <ShoppingBag size={22} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  className="action-badge"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 18 } }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <button 
            className="mobile-menu-btn mobile-only"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="เปิดเมนู"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <a href="#" onClick={(e) => { e.preventDefault(); handleNav('shop'); }}>เลือกชมสินค้า</a>
        <a href="#" onClick={(e) => { e.preventDefault(); handleNav('designer'); }}>ออกแบบ 3D</a>
        <a href="#" onClick={(e) => { e.preventDefault(); handleNav('profile'); }}>ข้อมูลส่วนตัว & ประวัติคำสั่งซื้อ</a>
        <a href="#" onClick={(e) => { e.preventDefault(); handleNav('admin'); }}>ระบบจัดการแอดมิน</a>
      </div>
    </nav>
  );
};

export default Navbar;
