// Image helper utilities & ultra-reliable fallbacks for MINIM Furniture

// SVG Minimalist Solid Wood Furniture fallback (100% offline, never breaks)
export const FALLBACK_WOOD_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdfbf7"/>
      <stop offset="100%" stop-color="#ece4d8"/>
    </linearGradient>
    <linearGradient id="wood" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b87a4a"/>
      <stop offset="50%" stop-color="#c98a58"/>
      <stop offset="100%" stop-color="#a0643b"/>
    </linearGradient>
    <linearGradient id="leg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#93572d"/>
      <stop offset="100%" stop-color="#6e3f1e"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#bg)"/>
  
  <!-- Shadow -->
  <ellipse cx="300" cy="330" rx="190" ry="16" fill="#000" opacity="0.08"/>

  <!-- Solid Wood Bench / Table -->
  <!-- Legs -->
  <rect x="155" y="210" width="18" height="110" rx="3" fill="url(#leg)"/>
  <rect x="427" y="210" width="18" height="110" rx="3" fill="url(#leg)"/>
  <rect x="173" y="255" width="254" height="12" rx="3" fill="url(#leg)" opacity="0.9"/>

  <!-- Top Plank -->
  <rect x="120" y="195" width="360" height="26" rx="6" fill="url(#wood)"/>
  <line x1="135" y1="208" x2="465" y2="208" stroke="#f6c297" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>

  <!-- Minimal Brand Label -->
  <text x="300" y="375" font-family="'IBM Plex Sans Thai', -apple-system, sans-serif" font-size="14" font-weight="600" fill="#8d5932" text-anchor="middle" letter-spacing="2">
    MINIM • SOLID WOOD CRAFT
  </text>
  <text x="300" y="398" font-family="'IBM Plex Sans Thai', -apple-system, sans-serif" font-size="11" fill="#b08b6e" text-anchor="middle">
    เฟอร์นิเจอร์ไม้แท้ 100%
  </text>
</svg>
`)}`;

// Pre-curated, rock-solid wood furniture presets for quick replacement
export const WOOD_IMAGE_PRESETS = [
  {
    label: 'ม้านั่งไม้ยาว (Solid Wood Bench)',
    url: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'โต๊ะทานอาหารไม้โอ๊ค (Dining Table)',
    url: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'โต๊ะกลางกาแฟไม้วอลนัท (Coffee Table)',
    url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'เก้าอี้ไม้แอชโมเดิร์น (Dining Chair)',
    url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'ตู้วางชาม-แก้ว ไม้แท้ (Sideboard Cupboard)',
    url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'ชั้นวางรองเท้าไม้สัก (Teak Shoe Rack)',
    url: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'โต๊ะทำงานไม้สัก (Teak Work Desk)',
    url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'โต๊ะข้างเตียงไม้เนื้อแข็ง (Bedside Nightstand)',
    url: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'ชั้นวางของไม้โครงเปิด (Wooden Shelf)',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
  },
];

// Helper to handle image load errors gracefully
export const handleImageError = (e) => {
  if (e?.currentTarget && e.currentTarget.src !== FALLBACK_WOOD_IMAGE) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_WOOD_IMAGE;
  }
};
