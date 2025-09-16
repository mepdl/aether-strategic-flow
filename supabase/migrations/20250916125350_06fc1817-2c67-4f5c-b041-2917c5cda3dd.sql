-- Add new role values to existing enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gerente_marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'analista_marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'assistente_marketing';

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create group_memberships table
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id),
  UNIQUE(group_id, email)
);

-- Enable RLS on group_memberships
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Add persona team members table
CREATE TABLE public.persona_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(persona_id, email)
);

-- Enable RLS on persona_team_members
ALTER TABLE public.persona_team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for groups
CREATE POLICY "Users can manage groups they created or are members of"
ON public.groups
FOR ALL
USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.group_memberships 
    WHERE group_id = groups.id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Create RLS policies for group_memberships
CREATE POLICY "Group creators and members can manage memberships"
ON public.group_memberships
FOR ALL
USING (
  invited_by = auth.uid() OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = group_memberships.group_id 
    AND created_by = auth.uid()
  )
);

-- Create RLS policies for persona_team_members
CREATE POLICY "Users can manage their own persona team members"
ON public.persona_team_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.personas 
    WHERE id = persona_team_members.persona_id 
    AND user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_memberships_updated_at
BEFORE UPDATE ON public.group_memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();