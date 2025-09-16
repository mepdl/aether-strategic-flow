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
  role app_role NOT NULL DEFAULT 'assistente_marketing',
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited', -- invited, active, inactive
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

-- Update RLS policies for shared access within groups
-- First drop existing policies that need to be updated
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can manage their own personas" ON public.personas;
DROP POLICY IF EXISTS "Users can manage their own objectives" ON public.objectives;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage their own content" ON public.content;
DROP POLICY IF EXISTS "Users can manage their own metrics" ON public.metrics;

-- Create new shared policies for campaigns
CREATE POLICY "Users can manage campaigns in their groups"
ON public.campaigns
FOR ALL
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_memberships gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE (g.created_by = campaigns.user_id OR gm.user_id = campaigns.user_id)
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  )
);

-- Create new shared policies for personas
CREATE POLICY "Users can manage personas in their groups"
ON public.personas
FOR ALL
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_memberships gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE (g.created_by = personas.user_id OR gm.user_id = personas.user_id)
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  )
);

-- Create new shared policies for objectives  
CREATE POLICY "Users can manage objectives in their groups"
ON public.objectives
FOR ALL
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_memberships gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE (g.created_by = objectives.user_id OR gm.user_id = objectives.user_id)
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  )
);

-- Create new shared policies for tasks
CREATE POLICY "Users can manage tasks in their groups"
ON public.tasks
FOR ALL
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_memberships gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE (g.created_by = tasks.user_id OR gm.user_id = tasks.user_id)
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  )
);

-- Create new shared policies for content
CREATE POLICY "Users can manage content in their groups"
ON public.content
FOR ALL
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_memberships gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE (g.created_by = content.user_id OR gm.user_id = content.user_id)
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  )
);

-- Create new shared policies for metrics
CREATE POLICY "Users can manage metrics in their groups"
ON public.metrics
FOR ALL
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_memberships gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE (g.created_by = metrics.user_id OR gm.user_id = metrics.user_id)
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
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

-- Update app_role enum to include new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gerente_marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'analista_marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'assistente_marketing';