-- ============================================================
-- Migration: Fix 6.1 — Atomic place_order Transaction
-- ============================================================
-- วิธีรัน: เปิด Supabase Dashboard → SQL Editor → วางโค้ดนี้ → Run
-- รัน หลัง migration 001_enable_rls.sql แล้ว
-- ============================================================
--
-- Function นี้จะ:
--   1. INSERT into orders  (ใช้ auth.uid() จาก session — ไม่รับ user_id จาก client)
--   2. INSERT into order_items  (ทั้งหมดในครั้งเดียว = transaction เดียว)
--   3. ถ้าขั้นใดพัง → rollback ทั้งหมด ไม่มี order ว่างค้างในระบบ
--
-- Input parameter (jsonb):
--   {
--     "items": [
--       { "product_id": 1, "product_name": "Chair", "quantity": 2, "price": 99.99 },
--       ...
--     ],
--     "total_price": 199.98
--   }
--
-- Returns: uuid ของ order ที่สร้างใหม่

CREATE OR REPLACE FUNCTION public.place_order(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id   uuid;
  v_order_id  uuid;
  v_total     numeric;
  v_item      jsonb;
BEGIN
  -- ── Auth check ──────────────────────────────────────────────
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- ── Read total from payload (client-calculated for display;
  --    in a real app you would recalculate from products table here) ──
  v_total := (payload ->> 'total_price')::numeric;

  -- ── Insert order ────────────────────────────────────────────
  INSERT INTO public.orders (user_id, total_price, status)
  VALUES (v_user_id, v_total, 'pending')
  RETURNING id INTO v_order_id;

  -- ── Insert order items (one row per item in the array) ──────
  FOR v_item IN SELECT * FROM jsonb_array_elements(payload -> 'items')
  LOOP
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price)
    VALUES (
      v_order_id,
      (v_item ->> 'product_id')::int8,
      v_item ->> 'product_name',
      (v_item ->> 'quantity')::int4,
      (v_item ->> 'price')::numeric
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Grant execute to authenticated users only (anon cannot call this)
GRANT EXECUTE ON FUNCTION public.place_order(jsonb) TO authenticated;
