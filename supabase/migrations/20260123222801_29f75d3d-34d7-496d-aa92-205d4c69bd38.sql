-- Add image_url column to meal_analyses for storing food photos
ALTER TABLE public.meal_analyses ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add health_score column to meal_analyses
ALTER TABLE public.meal_analyses ADD COLUMN IF NOT EXISTS health_score INTEGER;

-- Create meal-images storage bucket for food photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own meal images
CREATE POLICY "Users can upload meal images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'meal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to meal images
CREATE POLICY "Meal images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'meal-images');

-- Allow users to update their own meal images
CREATE POLICY "Users can update their own meal images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'meal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own meal images
CREATE POLICY "Users can delete their own meal images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'meal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);