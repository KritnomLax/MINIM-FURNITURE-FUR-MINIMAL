-- ============================================================
-- SQL SCRIPT: อัปเดตสินค้าทั้งหมดเป็น "เฟอร์นิเจอร์ไม้แท้ 100%" (ไม่มีโซฟา)
-- + ปลดล็อก RLS ให้หน้าเว็บ Admin แก้ไข/เพิ่ม/ลบสินค้าได้จริง ไม่โดนบล็อก
-- ============================================================

-- 1. ปลดล็อก RLS Policies ของตาราง products ให้ระบบ Admin ทำงานได้สมบูรณ์
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
DROP POLICY IF EXISTS "products_insert_all" ON public.products;
CREATE POLICY "products_insert_all" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
DROP POLICY IF EXISTS "products_update_all" ON public.products;
CREATE POLICY "products_update_all" ON public.products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
DROP POLICY IF EXISTS "products_delete_all" ON public.products;
CREATE POLICY "products_delete_all" ON public.products FOR DELETE USING (true);


-- 2. กรณีต้องการอัปเดตเฉพาะรายการที่ 9 (ม้านั่งไม้) ทันที:
UPDATE public.products
SET 
  name = 'ม้านั่งไม้ทรงยาวขัดเรียบ (Minimalist Solid Wood Bench)',
  image_url = 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=900&q=80'
WHERE id = 9;


-- 3. หากต้องการ Reset สินค้าทั้งหมดให้เป็นเซ็ตไม้แท้ 100% ครบทั้ง 10 ชิ้น ให้รันชุดนี้:
TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;

INSERT INTO public.products (name, category, price, width, depth, image_url)
VALUES 
  (
    'โต๊ะทานอาหารไม้โอ๊คแท้ (Solid Oak Dining Table)',
    'Living Room',
    420.00,
    16,
    9,
    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'โต๊ะกลางกาแฟไม้วอลนัทมินิมอล (Walnut Coffee Table)',
    'Living Room',
    185.00,
    10,
    6,
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'เก้าอี้ไม้แอชโมเดิร์น (Modern Ash Wood Dining Chair)',
    'Living Room',
    120.00,
    5,
    5,
    'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'ตู้วางถ้วย จาน ชาม ไม้โอ๊คบานทึบ (Oak Sideboard & Cupboard)',
    'Living Room',
    450.00,
    15,
    5,
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'ชั้นวางรองเท้าไม้สักระบายอากาศ (Slatted Teak Shoe Rack)',
    'Living Room',
    160.00,
    9,
    4,
    'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'โต๊ะทำงานไม้สักแท้พร้อมลิ้นชัก (Minimalist Teak Desk)',
    'Office',
    340.00,
    13,
    7,
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'โต๊ะข้างเตียงไม้เนื้อแข็ง (Wooden Bedside Nightstand)',
    'Bedroom',
    95.00,
    5,
    4,
    'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'ตู้เก็บแก้วและเครื่องครัวไม้สน (Pine Kitchen Cupboard)',
    'Living Room',
    380.00,
    12,
    5,
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'ม้านั่งไม้ทรงยาวขัดเรียบ (Minimalist Solid Wood Bench)',
    'Living Room',
    140.00,
    12,
    4,
    'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=900&q=80'
  ),
  (
    'ชั้นวางของไม้โครงเปิด 4 ชั้น (4-Tier Wooden Display Shelf)',
    'Living Room',
    220.00,
    10,
    4,
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80'
  );
