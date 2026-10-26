import React from 'react';
import { ShoppingCart, Save, Loader, Ruler, Armchair, Box } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

const COLORS = [
  { name: 'ไม้โอ๊คธรรมชาติ (Natural Oak)', value: '#d4b595' },
  { name: 'ไม้วอลนัท (Walnut)',            value: '#6b4c35' },
  { name: 'ดำด้าน (Matte Black)',          value: '#222222' },
  { name: 'ขาวคลีน (Clean White)',         value: '#f5f5f5' },
  { name: 'เขียวเสจ (Sage Green)',         value: '#8aad99' },
  { name: 'ชมพูกุหลาบ (Dusty Rose)',       value: '#c9938c' },
];

const FURNITURE_TYPES = [
  { id: 'table',    label: 'โต๊ะไม้ (Table)' },
  { id: 'chair',    label: 'เก้าอี้ไม้ (Chair)' },
  { id: 'cupboard', label: 'ตู้วางถ้วยชาม/ตู้ข้าง (Cupboard)' },
  { id: 'shoerack', label: 'ชั้นวางรองเท้าไม้ (Shoe Rack)' },
];

const DesignerControls = ({
  config,
  setConfig,
  products,
  productsLoading,
  selectedProductId,
  onProductChange,
  onAddToCart,
  onSaveDesign,
}) => {
  const estimatedPriceRaw = (config.width * config.depth * 2) + 150;

  return (
    <div className="designer-controls">
      <h2>สตูดิโอออกแบบเฟอร์นิเจอร์ 3 มิติ</h2>
      <p className="controls-subtitle">เลือกประเภท ปรับสัดส่วน และเลือกเฉดสีวัสดุได้ตามต้องการ</p>

      {/* เลือกประเภทเฟอร์นิเจอร์ */}
      <div className="control-group">
        <label>ประเภทเฟอร์นิเจอร์</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {FURNITURE_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              className={`btn-secondary ${config.furnitureType === t.id ? 'active' : ''}`}
              style={{
                padding: '8px 12px',
                fontSize: '0.88rem',
                border: config.furnitureType === t.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                backgroundColor: config.furnitureType === t.id ? 'var(--color-surface)' : 'transparent',
                fontWeight: config.furnitureType === t.id ? '600' : 'normal',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
              onClick={() => setConfig(prev => ({ ...prev, furnitureType: t.id }))}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* เลือกสินค้าอ้างอิง */}
      <div className="control-group">
        <label htmlFor="product-select">เลือกชิ้นงานต้นแบบ (ถ้ามี)</label>
        {productsLoading ? (
          <div className="designer-loading">
            <Loader size={16} className="spin-sm" /> กำลังโหลดชิ้นงาน...
          </div>
        ) : (
          <select
            id="product-select"
            className="product-select"
            value={selectedProductId ?? ''}
            onChange={(e) => onProductChange(e.target.value)}
          >
            <option value="">— กำหนดสัดส่วนอิสระ (Custom) —</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — กว้าง:{p.width * 10} × ลึก:{p.depth * 10} ซม.
              </option>
            ))}
          </select>
        )}
      </div>

      {/* แสดงขนาดปัจจุบัน */}
      <div className="dimension-badges">
        <span className="dim-badge">
          <Ruler size={13} />
          กว้าง: {(config.width * 10).toFixed(0)} ซม.
        </span>
        <span className="dim-badge">
          <Ruler size={13} style={{ transform: 'rotate(90deg)' }} />
          ลึก: {(config.depth * 10).toFixed(0)} ซม.
        </span>
        <span className="dim-badge">
          สูง: {(config.height * 10).toFixed(0)} ซม.
        </span>
      </div>

      {/* Slider ความกว้าง */}
      <div className="control-group">
        <label>
          ความกว้าง (Width)
          <span className="slider-value">{(config.width * 10).toFixed(0)} ซม.</span>
        </label>
        <input
          type="range"
          min="4" max="22" step="0.5"
          value={config.width}
          onChange={(e) => setConfig(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
        />
        <div className="slider-minmax"><span>40 ซม.</span><span>220 ซม.</span></div>
      </div>

      {/* Slider ความลึก */}
      <div className="control-group">
        <label>
          ความลึก (Depth)
          <span className="slider-value">{(config.depth * 10).toFixed(0)} ซม.</span>
        </label>
        <input
          type="range"
          min="3" max="14" step="0.5"
          value={config.depth}
          onChange={(e) => setConfig(prev => ({ ...prev, depth: parseFloat(e.target.value) }))}
        />
        <div className="slider-minmax"><span>30 ซม.</span><span>140 ซม.</span></div>
      </div>

      {/* Slider ความสูง */}
      <div className="control-group">
        <label>
          ความสูง (Height)
          <span className="slider-value">{(config.height * 10).toFixed(0)} ซม.</span>
        </label>
        <input
          type="range"
          min="2" max="15" step="0.5"
          value={config.height}
          onChange={(e) => setConfig(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
        />
        <div className="slider-minmax"><span>20 ซม.</span><span>150 ซม.</span></div>
      </div>

      {/* เลือกสีวัสดุ */}
      <div className="control-group">
        <label>เฉดสีและเนื้อไม้ (Material Finish)</label>
        <div className="color-picker">
          {COLORS.map(c => (
            <button
              key={c.name}
              className={`color-btn ${config.color === c.value ? 'active' : ''}`}
              style={{ backgroundColor: c.value }}
              onClick={() => setConfig(prev => ({ ...prev, color: c.value, colorName: c.name }))}
              title={c.name}
              aria-label={c.name}
            />
          ))}
        </div>
        <p className="selected-color-name">{config.colorName}</p>
      </div>

      {/* ประเมินราคา */}
      <div className="price-estimation">
        <span>ราคาประเมินโดยประมาณ</span>
        <span className="price-value">{formatPrice(estimatedPriceRaw)}</span>
      </div>

      {/* ปุ่ม Action */}
      <div className="designer-actions">
        <button className="btn-primary add-custom-btn" onClick={onAddToCart}>
          <ShoppingCart size={20} /> เพิ่มแบบสั่งทำลงตะกร้า
        </button>
        <button className="btn-secondary save-design-btn" onClick={onSaveDesign}>
          <Save size={20} /> บันทึกแบบนี้ไว้
        </button>
      </div>
    </div>
  );
};

export default DesignerControls;
