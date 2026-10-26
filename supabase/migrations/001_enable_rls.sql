-- ============================================================
-- Migration: Fix 6.2 — Enable Row Level Security (RLS)
-- ============================================================
-- วิธีรัน: เปิด Supabase Dashboard → SQL Editor → วางโค้ดนี้ → Run
-- ⚠️  ตรวจสอบ policy ทั้งหมดก่อนรัน อย่า run บน production โดยไม่ตรวจ
-- ============================================================

-- ── Admin mechanism ──────────────────────────────────────────
-- โปรเจกต์นี้ยังไม่มีระบบ role ใน DB
-- เลือกวิธีที่ง่ายที่สุดสำหรับโปรเจกต์มหาวิทยาลัย:
-- ใช้ Supabase User Metadata → ตั้ง raw_app_meta_data = {"role":"admin"}
-- ให้รัน query ด้านล่างเพื่อตั้ง user ที่ต้องการเป็น admin:
--
--   UPDATE auth.users
--   SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
--   WHERE email = 'your-admin@email.com';   -- ← แก้เป็น email ของคุณ
--
-- Helper function ที่ policy จะใช้:
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ── products ─────────────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ทุกคน (รวม anonymous) อ่านได้
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (true);

-- เฉพาะ admin เขียน/แก้/ลบได้
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- ── orders ───────────────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- user อ่านได้เฉพาะ order ตัวเอง; admin อ่านได้ทั้งหมด
CREATE POLICY "orders_select"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- user สร้าง order ของตัวเองได้
CREATE POLICY "orders_insert"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- เฉพาะ admin อัปเดตสถานะ order ได้
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ── order_items ──────────────────────────────────────────────
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- อ่าน order_items ได้เฉพาะถ้าเป็นเจ้าของ order; admin อ่านได้ทั้งหมด
CREATE POLICY "order_items_select"
  ON public.order_items FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- insert ได้ผ่าน order ที่เป็นของตัวเอง
CREATE POLICY "order_items_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );
