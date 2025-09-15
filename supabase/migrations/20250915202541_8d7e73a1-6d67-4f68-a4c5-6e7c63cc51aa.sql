-- Fix the security warning about function search path
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;