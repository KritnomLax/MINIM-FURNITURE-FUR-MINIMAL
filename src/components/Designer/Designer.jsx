import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei';
import FurnitureModel from './FurnitureModel';
import DesignerControls from './DesignerControls';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';
import './Designer.css';

const DEFAULT_CONFIG = {
  furnitureType: 'table',
  width: 10,
  depth: 6,
  height: 7.5,
  color: '#d4b595',
  colorName: 'ไม้โอ๊คธรรมชาติ (Natural Oak)',
};

const FurnitureScene = ({ config }) => (
  <>
    <PerspectiveCamera makeDefault position={[18, 14, 18]} fov={38} />
    <ambientLight intensity={0.4} />
    <directionalLight
      position={[10, 20, 10]}
      intensity={1.2}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
    <Environment preset="apartment" />

    <FurnitureModel
      furnitureType={config.furnitureType}
      width={config.width}
      depth={config.depth}
      height={config.height}
      color={config.color}
    />

    <ContactShadows
      position={[0, 0, 0]}
      opacity={0.55}
      scale={30}
      blur={2.5}
      far={12}
    />

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#f0ece4" roughness={0.9} />
    </mesh>

    <OrbitControls
      makeDefault
      autoRotate
      autoRotateSpeed={0.6}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={8}
      maxDistance={40}
      enableDamping
    />
  </>
);

const Designer = () => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user, saveDesign } = useAuth();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, price, width, depth')
          .not('width', 'is', null)
          .not('depth', 'is', null)
          .order('name', { ascending: true });

        if (error) throw error;
        setProducts(data ?? []);
      } catch (err) {
        console.error('Designer: failed to fetch products', err);
        addToast('ไม่สามารถโหลดรายการสินค้า: ' + err.message, 'error');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [addToast]);

  const handleProductChange = useCallback((productId) => {
    if (!productId) {
      setSelectedProductId(null);
      setConfig(DEFAULT_CONFIG);
      return;
    }

    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;

    setSelectedProductId(product.id);
    setConfig(prev => ({
      ...prev,
      width:  Number(product.width),
      depth:  Number(product.depth),
      height: prev.height,
    }));
  }, [products]);

  const handleAddToCart = () => {
    const price = (config.width * config.depth * 2) + 150;
    const baseProduct = selectedProductId
      ? products.find(p => String(p.id) === String(selectedProductId))
      : null;

    const typeNames = {
      table:    'โต๊ะไม้สั่งทำพิเศษ',
      chair:    'เก้าอี้ไม้สั่งทำพิเศษ',
      cupboard: 'ตู้วางชาม/ตู้ข้างไม้สั่งทำ',
      shoerack: 'ชั้นวางรองเท้าไม้สั่งทำ',
    };

    const typeLabel = typeNames[config.furnitureType] || 'ชิ้นงานสั่งทำพิเศษ';

    addToCart({
      id: `custom-${Date.now()}`,
      name: baseProduct
        ? `${baseProduct.name} (คัสตอม: ${config.colorName})`
        : `${typeLabel} (${config.colorName})`,
      category: 'Custom Design',
      price: baseProduct ? Number(baseProduct.price) : price,
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
      description: `ขนาด กว้าง:${config.width * 10} × ลึก:${config.depth * 10} × สูง:${config.height * 10} ซม.`,
    });
    addToast('เพิ่มแบบสั่งทำพิเศษลงในตะกร้าเรียบร้อยแล้ว!', 'success');
  };

  const handleSaveDesign = async () => {
    if (!user) {
      addToast('กรุณาเข้าสู่ระบบเพื่อบันทึกแบบที่ออกแบบไว้', 'error');
      return;
    }
    const success = await saveDesign({
      ...config,
      furnitureType: config.furnitureType ?? 'table',
      productId: selectedProductId ?? null,
    });
    if (success) {
      addToast('บันทึกแบบจำลอง 3 มิติลงในโปรไฟล์ของคุณเรียบร้อยแล้ว!', 'success');
    } else {
      addToast('เกิดข้อผิดพลาด ไม่สามารถบันทึกแบบได้ กรุณาลองใหม่อีกครั้ง', 'error');
    }
  };

  return (
    <section className="designer-section" id="designer">
      <div className="container designer-layout">
        {/* 3D Canvas */}
        <div className="designer-canvas-container">
          <Canvas shadows gl={{ antialias: true }}>
            <Suspense fallback={null}>
              <FurnitureScene config={config} />
            </Suspense>
          </Canvas>

          <div className="canvas-instruction">
            คลิกซ้ายลากเพื่อหมุนมุมมอง · หมุนลูกกลิ้งเมาส์เพื่อซูมเข้า/ออก · คลิกขวาลากเพื่อเลื่อนตำแหน่ง
          </div>

          <div
            className="canvas-color-tint"
            style={{ '--tint-color': config.color }}
          />
        </div>

        {/* Controls Sidebar */}
        <div className="designer-sidebar">
          <DesignerControls
            config={config}
            setConfig={setConfig}
            products={products}
            productsLoading={productsLoading}
            selectedProductId={selectedProductId}
            onProductChange={handleProductChange}
            onAddToCart={handleAddToCart}
            onSaveDesign={handleSaveDesign}
          />
        </div>
      </div>
    </section>
  );
};

export default Designer;
