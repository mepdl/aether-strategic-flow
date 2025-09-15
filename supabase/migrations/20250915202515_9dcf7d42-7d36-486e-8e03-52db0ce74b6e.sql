-- First, let's check if RLS is enabled and improve security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Remove the email column since it's already available in auth.users and creates security risk
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Create more restrictive and secure policies
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Explicitly deny DELETE operations for security
-- Users should not be able to delete their profile record
CREATE POLICY "profiles_delete_deny" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (false);

-- Update the trigger function to not insert email since we removed the column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name)
  VALUES (
    gen_random_uuid(),
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário')
  );
  RETURN NEW;
END;
$$;

-- Add a function to safely get user email from auth context
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;