-- ============================================================
-- Task F: Seed Demo Data for Presentation / Testing
-- ============================================================
-- วิธีรัน: Supabase Dashboard → SQL Editor → วางและ Run
-- (คำแนะนำ: รัน 001 - 004 ให้ครบก่อนรันไฟล์นี้)
-- ============================================================

-- 1. ตรวจสอบ/เพิ่มข้อมูลสินค้าตัวอย่าง (Products)
INSERT INTO public.products (name, category, price, width, depth, image_url)
VALUES 
  ('Minimalist Oak Dining Table', 'Living Room', 450.00, 14, 8, 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80'),
  ('Scandinavian Coffee Table', 'Living Room', 180.00, 9, 6, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80'),
  ('Ergonomic Wooden Work Desk', 'Office', 320.00, 12, 7, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'),
  ('Walnut Bedside Nightstand', 'Bedroom', 120.00, 5, 4, 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80'),
  ('Compact Study Desk', 'Office', 210.00, 10, 5, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;

-- 2. Mock Reviews สำหรับสินค้าชิ้นแรก (ดึง ID แรกที่มี)
DO $$
DECLARE
  first_product_id integer;
BEGIN
  SELECT id INTO first_product_id FROM public.products LIMIT 1;
  
  IF first_product_id IS NOT NULL THEN
    -- หมายเหตุ: แทรกเฉพาะเมื่อยังไม่มี review จำลอง เพื่อไม่ให้ข้อมูลซ้ำซ้อน
    IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE product_id = first_product_id) THEN
      -- ใส่รีวิวตัวอย่างพร้อม mock user
      INSERT INTO public.reviews (product_id, user_id, user_email, rating, comment, photo_url, created_at)
      VALUES 
        (first_product_id, '00000000-0000-0000-0000-000000000000', 'demo.customer@example.com', 5, 'วัสดุไม้โอ๊คสวยงามมาก ประกอบง่าย วางในห้องแล้วมินิมอลสมชื่อ!', 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80', now() - interval '2 days'),
        (first_product_id, '00000000-0000-0000-0000-000000000000', 'sarah.design@example.com', 4, 'ขนาดกำลังดี แข็งแรงทนทาน การจัดส่งแพ็คมาเรียบร้อยดีมากครับ', NULL, now() - interval '5 days');
    END IF;
  END IF;
END $$;
