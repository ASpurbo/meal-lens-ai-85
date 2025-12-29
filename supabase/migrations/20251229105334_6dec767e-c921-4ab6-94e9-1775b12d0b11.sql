-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS height_cm numeric,
ADD COLUMN IF NOT EXISTS weight_kg numeric,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS activity_level text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add meal_period to meal_analyses for timeline view
ALTER TABLE public.meal_analyses
ADD COLUMN IF NOT EXISTS meal_period text DEFAULT 'other';

-- Create user_streaks table for gamification
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON public.user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create mood_logs table
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id uuid REFERENCES public.meal_analyses(id) ON DELETE CASCADE,
  mood text NOT NULL,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  notes text,
  logged_at timestamptz DEFAULT now()
);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mood logs" ON public.mood_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood logs" ON public.mood_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood logs" ON public.mood_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood logs" ON public.mood_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create shared_meals table for community feed (view-only)
CREATE TABLE IF NOT EXISTS public.shared_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id uuid REFERENCES public.meal_analyses(id) ON DELETE CASCADE,
  caption text,
  is_public boolean DEFAULT true,
  shared_at timestamptz DEFAULT now()
);

ALTER TABLE public.shared_meals ENABLE ROW LEVEL SECURITY;

-- Everyone can view public shared meals
CREATE POLICY "Anyone can view public shared meals" ON public.shared_meals
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own shared meals" ON public.shared_meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared meals" ON public.shared_meals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared meals" ON public.shared_meals
  FOR DELETE USING (auth.uid() = user_id);

-- Create weekly_challenges table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL,
  target_value numeric,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges" ON public.weekly_challenges
  FOR SELECT USING (is_active = true);

-- Create user_challenge_progress table
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  current_value numeric DEFAULT 0,
  completed boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge progress" ON public.user_challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress" ON public.user_challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress" ON public.user_challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert some default weekly challenges
INSERT INTO public.weekly_challenges (title, description, challenge_type, target_value, start_date, end_date)
VALUES 
  ('Protein Pro', 'Hit your protein goal for 5 days', 'protein_days', 5, CURRENT_DATE, CURRENT_DATE + 7),
  ('Hydration Hero', 'Log meals consistently for 7 days', 'streak_days', 7, CURRENT_DATE, CURRENT_DATE + 7),
  ('Balanced Week', 'Stay within calorie goals for 5 days', 'calorie_days', 5, CURRENT_DATE, CURRENT_DATE + 7)
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();