CREATE TABLE public.scan_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_hash text NOT NULL UNIQUE,
  url text NOT NULL,
  result jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_scan_cache_hash_expires ON public.scan_cache(url_hash, expires_at);

ALTER TABLE public.scan_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read fresh cache"
ON public.scan_cache FOR SELECT
USING (expires_at > now());