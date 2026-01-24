-- COMPREHENSIVE SECURITY HARDENING MIGRATION

-- 1. Add missing UPDATE policy for meal_analyses
CREATE POLICY "Users can update their own meal analyses"
ON public.meal_analyses
FOR UPDATE
USING (auth.uid() = user_id);

-- 2. Add missing DELETE policy for profiles (GDPR compliance)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Add missing DELETE policy for user_streaks
CREATE POLICY "Users can delete their own streaks"
ON public.user_streaks
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Add missing UPDATE and DELETE policies for user_badges
CREATE POLICY "Users can update their own badges"
ON public.user_badges
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own badges"
ON public.user_badges
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Add missing DELETE policy for user_challenge_progress
CREATE POLICY "Users can delete their own challenge progress"
ON public.user_challenge_progress
FOR DELETE
USING (auth.uid() = user_id);

-- 6. Add SELECT policy for shared_meals to allow owners to see their own private posts
CREATE POLICY "Users can view their own shared meals"
ON public.shared_meals
FOR SELECT
USING (auth.uid() = user_id);