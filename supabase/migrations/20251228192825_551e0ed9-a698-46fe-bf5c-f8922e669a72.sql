-- Add DELETE policy for nutrition_goals table
CREATE POLICY "Users can delete their own goals"
ON public.nutrition_goals
FOR DELETE
USING (auth.uid() = user_id);