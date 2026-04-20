-- Create scan_history table
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INTEGER NOT NULL,
  status TEXT NOT NULL,
  category TEXT,
  explanation TEXT,
  signals JSONB DEFAULT '[]'::jsonb,
  ai_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scan_history_user_id ON public.scan_history(user_id);
CREATE INDEX idx_scan_history_created_at ON public.scan_history(created_at DESC);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Logged-in users see only their own scans
CREATE POLICY "Users view own scans"
  ON public.scan_history FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone (incl. anonymous) can insert; user_id must match auth.uid() or be null for anon
CREATE POLICY "Anyone can insert scans"
  ON public.scan_history FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL) OR
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  );

-- Users can delete their own scans
CREATE POLICY "Users delete own scans"
  ON public.scan_history FOR DELETE
  USING (auth.uid() = user_id);