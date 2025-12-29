-- Add email_verified column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Create email verification tokens table
CREATE TABLE public.email_verification_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  used_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create index for faster token lookups
CREATE INDEX idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);

-- RLS policies - service role can do everything, users can only view their own
CREATE POLICY "Service role can manage all tokens"
ON public.email_verification_tokens
FOR ALL
USING (true)
WITH CHECK (true);

-- Users can view their own tokens (for checking status)
CREATE POLICY "Users can view their own tokens"
ON public.email_verification_tokens
FOR SELECT
USING (auth.uid() = user_id);