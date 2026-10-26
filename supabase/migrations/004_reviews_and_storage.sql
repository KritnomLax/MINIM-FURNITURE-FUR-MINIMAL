-- ============================================================
-- Migration: Task C — Reviews Table + Supabase Storage
-- ============================================================
-- วิธีรัน: Supabase Dashboard → SQL Editor → วางโค้ดนี้ → Run
--
-- ⚠️  Storage bucket ต้องสร้างแยกใน Dashboard:
--     Storage → New Bucket → ชื่อ: "review-photos"
--     ✅ Public bucket (เปิด Public)
-- ============================================================

-- ── Create reviews table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email  text NOT NULL,
  rating      smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text NOT NULL,
  photo_url   text,          -- Supabase Storage public URL (nullable)
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-product queries
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.reviews(product_id);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  USING (true);

-- Logged-in users can insert their own review
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own review; admin can delete any
CREATE POLICY "reviews_delete_own_or_admin"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- ── Storage policy (SQL, run after creating the bucket) ──────
-- Allow public read on review-photos
CREATE POLICY "review_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-photos');

-- Allow logged-in users to upload
CREATE POLICY "review_photos_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'review-photos' AND auth.role() = 'authenticated');

-- Allow users to delete their own uploads
CREATE POLICY "review_photos_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
