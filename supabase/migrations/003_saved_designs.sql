-- ============================================================
-- Migration: Task B — Saved Designs Table
-- ============================================================
-- วิธีรัน: Supabase Dashboard → SQL Editor → วางโค้ดนี้ → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.saved_designs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  furniture_type text NOT NULL DEFAULT 'table',
  color       text NOT NULL,
  color_name  text NOT NULL,
  width       numeric NOT NULL,
  depth       numeric NOT NULL,
  height      numeric NOT NULL,
  product_id  integer REFERENCES public.products(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS saved_designs_user_id_idx ON public.saved_designs(user_id);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own designs
CREATE POLICY "saved_designs_select_own"
  ON public.saved_designs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own designs
CREATE POLICY "saved_designs_insert_own"
  ON public.saved_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own designs
CREATE POLICY "saved_designs_delete_own"
  ON public.saved_designs FOR DELETE
  USING (auth.uid() = user_id);
