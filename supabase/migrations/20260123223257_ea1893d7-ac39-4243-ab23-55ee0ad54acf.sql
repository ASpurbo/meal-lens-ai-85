-- Add fiber, sugar, and sodium columns to meal_analyses
ALTER TABLE public.meal_analyses ADD COLUMN IF NOT EXISTS fiber NUMERIC DEFAULT 0;
ALTER TABLE public.meal_analyses ADD COLUMN IF NOT EXISTS sugar NUMERIC DEFAULT 0;
ALTER TABLE public.meal_analyses ADD COLUMN IF NOT EXISTS sodium NUMERIC DEFAULT 0;