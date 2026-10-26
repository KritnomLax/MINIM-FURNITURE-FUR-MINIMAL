import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import CartModal from './components/CartModal';
import WishlistModal from './components/WishlistModal';
import Designer from './components/Designer/Designer';
import UserProfile from './components/UserProfile';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/Admin/AdminProducts';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Page fade + slight upward slide on view change
const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

function MainApp() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [currentView, setCurrentView] = useState('shop');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [currentView]);

  const handleNavigate = (view) => {
    if (view === 'profile' && !user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="app-layout">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      <main className="main-content">
        {/* AnimatePresence lets exit animations run before unmounting */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ minHeight: '100%' }}
          >
            {currentView === 'shop' && (
              <>
                <Hero />
                <ProductList />
              </>
            )}
            {currentView === 'designer' && <Designer />}
            {currentView === 'profile'  && <UserProfile />}
            {currentView === 'admin'    && <AdminDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Modals — animated via CartModal / WishlistModal / AuthModal themselves */}
      <AnimatePresence>
        {isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isWishlistOpen && <WishlistModal onClose={() => setIsWishlistOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <ToastProvider>
            <CartProvider>
              <MainApp />
            </CartProvider>
          </ToastProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
