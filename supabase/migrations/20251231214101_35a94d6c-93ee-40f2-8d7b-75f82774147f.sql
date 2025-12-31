-- Add column to track if user has seen the onboarding tour
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_tour boolean DEFAULT false;