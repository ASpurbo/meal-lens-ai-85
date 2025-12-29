-- Add unique constraint on user_id for nutrition_goals to allow upsert
ALTER TABLE public.nutrition_goals 
DROP CONSTRAINT IF EXISTS nutrition_goals_user_id_key;

ALTER TABLE public.nutrition_goals 
ADD CONSTRAINT nutrition_goals_user_id_key UNIQUE (user_id);