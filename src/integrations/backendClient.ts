import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// NOTE: This wrapper exists to prevent a hard crash (blank screen) when Vite env
// variables are not injected (e.g. after external tooling changes).
// Prefer the VITE_* env vars; fall back to the known Lovable Cloud project values.

export const BACKEND_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://vaxjjcdbhoejcmvuyunv.supabase.co";

export const BACKEND_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheGpqY2RiaG9lamNtdnV5dW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzY5MzMsImV4cCI6MjA4MjUxMjkzM30.Rq-QET9OaPCbg-yO8iyASeIidIcBvhWZlYnZcCAcahE";

export const backendEnvOk = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

if (!backendEnvOk) {
  // eslint-disable-next-line no-console
  console.warn(
    "Backend env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). Using fallback values.",
  );
}

export const supabase = createClient<Database>(BACKEND_URL, BACKEND_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
