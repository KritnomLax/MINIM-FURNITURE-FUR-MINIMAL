-- ============================================================
-- ALL-IN-ONE SAFE MIGRATION FOR SUPABASE
-- รันได้หลายรอบอย่างปลอดภัย (DROP POLICY IF EXISTS + UTF-8 Clean)
-- ============================================================

-- ── 1. Admin Helper Function ────────────────────────────────
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

-- ── 2. Table: products (RLS & Policies) ──────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- ── 3. Table: orders (RLS & Policies) ────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select" ON public.orders;
CREATE POLICY "orders_select"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert" ON public.orders;
CREATE POLICY "orders_insert"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ── 4. Table: order_items (RLS & Policies) ───────────────────
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
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

DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- ── 5. RPC: place_order (Atomic checkout transaction) ────────
CREATE OR REPLACE FUNCTION public.place_order(
  p_items jsonb,
  p_shipping_name text DEFAULT NULL,
  p_shipping_address text DEFAULT NULL,
  p_shipping_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     uuid;
  v_order_id    uuid;
  v_total_price numeric(10, 2) := 0;
  v_item        jsonb;
  v_qty         integer;
  v_price       numeric(10, 2);
  v_product_id  integer;
  v_name        text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty   := (v_item ->> 'quantity')::integer;
    v_price := (v_item ->> 'price')::numeric;

    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity: %', v_qty;
    END IF;
    IF v_price IS NULL OR v_price < 0 THEN
      RAISE EXCEPTION 'Invalid price: %', v_price;
    END IF;

    v_total_price := v_total_price + (v_price * v_qty);
  END LOOP;

  INSERT INTO public.orders (
    user_id,
    total_price,
    status,
    shipping_name,
    shipping_address,
    shipping_phone
  )
  VALUES (
    v_user_id,
    v_total_price,
    'pending',
    p_shipping_name,
    p_shipping_address,
    p_shipping_phone
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty   := (v_item ->> 'quantity')::integer;
    v_price := (v_item ->> 'price')::numeric;
    v_name  := v_item ->> 'product_name';

    BEGIN
      v_product_id := (v_item ->> 'product_id')::integer;
    EXCEPTION WHEN OTHERS THEN
      v_product_id := NULL;
    END;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      price
    )
    VALUES (
      v_order_id,
      v_product_id,
      v_name,
      v_qty,
      v_price
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- ── 6. Table: saved_designs (Task B) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_designs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  furniture_type text NOT NULL DEFAULT 'table',
  color          text NOT NULL,
  color_name     text NOT NULL,
  width          numeric NOT NULL,
  depth          numeric NOT NULL,
  height         numeric NOT NULL,
  product_id     integer REFERENCES public.products(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_designs_user_id_idx ON public.saved_designs(user_id);

ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_designs_select_own" ON public.saved_designs;
CREATE POLICY "saved_designs_select_own"
  ON public.saved_designs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_designs_insert_own" ON public.saved_designs;
CREATE POLICY "saved_designs_insert_own"
  ON public.saved_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_designs_delete_own" ON public.saved_designs;
CREATE POLICY "saved_designs_delete_own"
  ON public.saved_designs FOR DELETE
  USING (auth.uid() = user_id);

-- ── 7. Table: reviews & Storage Policies (Task C) ────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email  text NOT NULL,
  rating      smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text NOT NULL,
  photo_url   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.reviews(product_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_delete_own_or_admin" ON public.reviews;
CREATE POLICY "reviews_delete_own_or_admin"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Storage policies for bucket 'review-photos'
DROP POLICY IF EXISTS "review_photos_public_read" ON storage.objects;
CREATE POLICY "review_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "review_photos_insert_auth" ON storage.objects;
CREATE POLICY "review_photos_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'review-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "review_photos_delete_own" ON storage.objects;
CREATE POLICY "review_photos_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── 8. Demo Seed Data (Task F) ───────────────────────────────
INSERT INTO public.products (name, category, price, width, depth, image_url)
VALUES 
  ('Minimalist Oak Dining Table', 'Living Room', 450.00, 14, 8, 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80'),
  ('Scandinavian Coffee Table', 'Living Room', 180.00, 9, 6, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80'),
  ('Ergonomic Wooden Work Desk', 'Office', 320.00, 12, 7, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'),
  ('Walnut Bedside Nightstand', 'Bedroom', 120.00, 5, 4, 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80'),
  ('Compact Study Desk', 'Office', 210.00, 10, 5, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;
