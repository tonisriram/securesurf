REVOKE SELECT ON public.user_roles FROM anon, authenticated;
REVOKE SELECT ON public.scan_history FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;