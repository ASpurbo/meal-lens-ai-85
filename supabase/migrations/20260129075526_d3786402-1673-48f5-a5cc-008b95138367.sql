-- Create feedback table for user suggestions and bug reports
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('suggestion', 'bug', 'other')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved'))
);

-- Enable Row Level Security
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
ON public.user_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.user_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Create dashboard_settings table for widget customization
CREATE TABLE public.dashboard_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  widget_order TEXT[] DEFAULT ARRAY['daily_tip', 'calendar', 'dashboard_cards', 'recently_uploaded', 'recommendations'],
  hidden_widgets TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own dashboard settings
CREATE POLICY "Users can view their own dashboard settings"
ON public.dashboard_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard settings"
ON public.dashboard_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard settings"
ON public.dashboard_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updating timestamp
CREATE TRIGGER update_dashboard_settings_updated_at
BEFORE UPDATE ON public.dashboard_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();