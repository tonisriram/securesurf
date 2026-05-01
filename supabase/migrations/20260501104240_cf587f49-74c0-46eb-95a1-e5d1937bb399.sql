-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Realtime channel authorization =====
-- Restrict realtime subscriptions: users can only subscribe to channels named "scan_history:<their_uid>"
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can subscribe to their own scan_history channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'scan_history:' || auth.uid()::text
);

-- ===== Hide scan_history from GraphQL anon/authenticated discovery =====
-- RLS still enforces row access; this just removes it from the public GraphQL schema
REVOKE SELECT ON public.scan_history FROM anon;
REVOKE SELECT ON public.scan_history FROM authenticated;

-- Grant explicit access needed for the SDK to still function (RLS-gated)
GRANT SELECT ON public.scan_history TO authenticated;
-- Anonymous users can insert (per existing RLS) but not select
GRANT INSERT ON public.scan_history TO anon, authenticated;
GRANT DELETE ON public.scan_history TO authenticated;