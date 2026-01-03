import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const CACHE_KEY = "meallens_onboarding_completed";

function getCachedOnboarding(userId: string): boolean | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (raw === null) return null;
    return raw === "true";
  } catch {
    return null;
  }
}

function setCachedOnboarding(userId: string, completed: boolean) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${userId}`, String(completed));
  } catch {
    // ignore cache write failures
  }
}

export function useOnboarding() {
  const { user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const isOffline = useMemo(() => !navigator.onLine, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setNeedsOnboarding(null);
        setLoading(false);
        return;
      }

      // If we're offline, rely on cached onboarding state (and avoid forcing onboarding).
      if (!navigator.onLine) {
        const cached = getCachedOnboarding(user.id);
        setNeedsOnboarding(cached === null ? null : !cached);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (error) {
          // If profile doesn't exist yet, they need onboarding.
          setNeedsOnboarding(true);
          setCachedOnboarding(user.id, false);
          return;
        }

        const completed = Boolean(data?.onboarding_completed);
        setNeedsOnboarding(!completed);
        setCachedOnboarding(user.id, completed);
      } catch {
        // If something fails (including network flakiness), don't force onboarding.
        const cached = getCachedOnboarding(user.id);
        setNeedsOnboarding(cached === null ? null : !cached);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user, isOffline]);

  return { needsOnboarding, loading };
}

