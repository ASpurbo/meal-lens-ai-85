-- Add language and diet_goal columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS diet_goal text DEFAULT NULL;

-- Add comment for diet_goal options: lose_weight, gain_muscle, maintain, bulk, cut, recomp
COMMENT ON COLUMN public.profiles.diet_goal IS 'User diet goal: lose_weight, gain_muscle, maintain, bulk, cut, recomp';