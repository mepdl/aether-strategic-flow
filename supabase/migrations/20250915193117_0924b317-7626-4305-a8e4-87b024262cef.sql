-- Create comprehensive database schema for Aether Marketing Platform

-- Create enums
CREATE TYPE app_role AS ENUM ('admin', 'editor', 'analyst', 'viewer');
CREATE TYPE task_status AS ENUM ('ideas', 'in_progress', 'review', 'approved', 'published');
CREATE TYPE content_format AS ENUM ('blog_post', 'social_media', 'email', 'video', 'infographic', 'webinar', 'ebook');
CREATE TYPE customer_journey_stage AS ENUM ('awareness', 'consideration', 'decision', 'retention');
CREATE TYPE marketing_channel AS ENUM ('seo', 'ppc', 'social_media', 'email', 'content', 'pr', 'events');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personas table
CREATE TABLE public.personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  persona_name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  demographics JSONB DEFAULT '{}',
  goals TEXT,
  pain_points TEXT,
  watering_holes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create objectives (OKRs) table
CREATE TABLE public.objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  quarter TEXT,
  year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create key results table
CREATE TABLE public.key_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_value DECIMAL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  objective_id UUID REFERENCES public.objectives(id),
  start_date DATE,
  end_date DATE,
  budget DECIMAL DEFAULT 0,
  spent DECIMAL DEFAULT 0,
  channels marketing_channel[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_personas junction table
CREATE TABLE public.campaign_personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, persona_id)
);

-- Create content calendar table
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  format content_format NOT NULL,
  author TEXT,
  delivery_date DATE,
  publish_date DATE,
  persona_id UUID REFERENCES public.personas(id),
  campaign_id UUID REFERENCES public.campaigns(id),
  journey_stage customer_journey_stage,
  status task_status DEFAULT 'ideas',
  content_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table for Kanban
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'ideas',
  assigned_to UUID REFERENCES public.profiles(id),
  campaign_id UUID REFERENCES public.campaigns(id),
  content_id UUID REFERENCES public.content(id),
  due_date DATE,
  priority INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competitors table
CREATE TABLE public.competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  products JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  marketing_strategies TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SWOT analysis table
CREATE TABLE public.swot_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strengths TEXT,
  weaknesses TEXT,
  opportunities TEXT,
  threats TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brand identity table
CREATE TABLE public.brand_identity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission TEXT,
  vision TEXT,
  values TEXT,
  positioning TEXT,
  brand_persona TEXT,
  marketing_mix JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create metrics/analytics table
CREATE TABLE public.metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id),
  channel marketing_channel,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swot_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create RLS policies for personas
CREATE POLICY "Users can manage their own personas" ON public.personas
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create RLS policies for objectives
CREATE POLICY "Users can manage their own objectives" ON public.objectives
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create RLS policies for key results
CREATE POLICY "Users can manage their own key results" ON public.key_results
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create RLS policies for campaigns
CREATE POLICY "Users can manage their own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create RLS policies for campaign_personas
CREATE POLICY "Users can manage their own campaign personas" ON public.campaign_personas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_personas.campaign_id 
      AND campaigns.user_id::text = auth.uid()::text
    )
  );

-- Create RLS policies for content
CREATE POLICY "Users can manage their own content" ON public.content
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create RLS policies for tasks
CREATE POLICY "Users can manage their own tasks" ON public.tasks
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create RLS policies for competitors
CREATE POLICY "Users can manage their own competitors" ON public.competitors
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create RLS policies for SWOT analysis
CREATE POLICY "Users can manage their own SWOT analysis" ON public.swot_analysis
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create RLS policies for brand identity
CREATE POLICY "Users can manage their own brand identity" ON public.brand_identity
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create RLS policies for metrics
CREATE POLICY "Users can manage their own metrics" ON public.metrics
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON public.personas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at
  BEFORE UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_key_results_updated_at
  BEFORE UPDATE ON public.key_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON public.competitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_swot_analysis_updated_at
  BEFORE UPDATE ON public.swot_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_identity_updated_at
  BEFORE UPDATE ON public.brand_identity
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();