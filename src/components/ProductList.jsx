import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import ProductCard, { cardVariants } from './ProductCard';
import QuickViewModal from './QuickViewModal';
import './ProductList.css';
import { supabase } from '../config/supabaseClient';

const CATEGORIES = [
  { id: 'All',           label: 'ทั้งหมด' },
  { id: 'Living Room',   label: 'ห้องนั่งเล่น' },
  { id: 'Bedroom',       label: 'ห้องนอน' },
  { id: 'Office',        label: 'ห้องทำงาน' },
  { id: 'Custom Design', label: 'ดีไซน์สั่งทำพิเศษ' },
];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      const formattedData = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image_url,
        description: `ขนาด: ${p.width || '?'}0 × ${p.depth || '?'}0 ซม. ชิ้นงานไม้แท้สั่งผลิตสำหรับ ${p.category}`,
        dimensions: `กว้าง ${p.width || '?'}0 ซม., ลึก ${p.depth || '?'}0 ซม.`,
        material: 'เนื้อไม้พรีเมียมคัดเกรด เคลือบผิวกันน้ำและความชื้น'
      }));
      setProducts(formattedData);
    }
    setLoading(false);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      );
    }

    // Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Sort Order
    if (sortOrder === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, sortOrder, searchQuery, products]);

  return (
    <section className="product-list-section" id="products">
      <div className="container">
        <div className="section-header reveal">
          <h2 className="section-title">คอลเลกชันเฟอร์นิเจอร์ไม้จริง</h2>
          <p className="section-subtitle">งานไม้เนื้อแท้คัดเกรดพิเศษ สไตล์มินิมอล แข็งแรง ทนทานเหนือกาลเวลา</p>
        </div>
        
        <div className="controls-bar reveal">
          <div className="filter-tabs">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                className={`filter-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="search-and-sort">
            {/* Search Input Box */}
            <div className="product-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="ค้นหาชื่อเฟอร์นิเจอร์ไม้..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="search-clear-btn" 
                  onClick={() => setSearchQuery('')}
                  aria-label="ล้างคำค้นหา"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-dropdown">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="default">เรียงลำดับมาตรฐาน</option>
                <option value="price-asc">ราคา: ต่ำไปสูง</option>
                <option value="price-desc">ราคา: สูงไปต่ำ</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-secondary)' }}>
            <p>กำลังโหลดรายการสินค้าไม้จริง...</p>
          </div>
        ) : (
          <motion.div
            className="product-grid"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate="show"
          >
            {filteredAndSortedProducts.length === 0 ? (
              <motion.div
                variants={cardVariants}
                style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px 20px', color: 'var(--color-text-secondary)' }}
              >
                <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>ไม่พบรายการสินค้าที่ตรงกับคำค้นหา "{searchQuery}"</p>
                <span style={{ fontSize: '0.9rem' }}>ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูสิ</span>
              </motion.div>
            ) : (
              filteredAndSortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={() => setQuickViewProduct(product)}
                />
              ))
            )}
          </motion.div>
        )}
      </div>
      
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </section>
  );
};

export default ProductList;
