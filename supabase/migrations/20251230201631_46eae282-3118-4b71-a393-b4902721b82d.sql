-- Fix the email_verification_tokens RLS policy to properly scope service role access
-- Drop the overly permissive policy that applies to all users
DROP POLICY IF EXISTS "Service role can manage all tokens" ON public.email_verification_tokens;

-- Recreate with proper service role check
-- Note: Service role bypasses RLS by default, so we just need to ensure
-- the policy doesn't grant access to regular users
-- Instead, we'll create no "FOR ALL" policy - service role already bypasses RLS

-- The "Users can view their own tokens" policy is already correct
-- Users can only see their own tokens via: auth.uid() = user_id