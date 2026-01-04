-- Remove the RLS policy that allows users to view tokens from client
-- Token validation should ONLY happen server-side via edge functions using service role
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.email_verification_tokens;

-- Ensure RLS is still enabled (it blocks all client access since there are no permissive policies)
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;