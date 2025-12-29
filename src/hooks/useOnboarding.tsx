import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setNeedsOnboarding(null);
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
          // Profile doesn't exist yet, needs onboarding
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(!data?.onboarding_completed);
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
        setNeedsOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user]);

  return { needsOnboarding, loading };
}
