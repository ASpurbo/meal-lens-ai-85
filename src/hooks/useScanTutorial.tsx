import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backendClient";
import { useAuth } from "./useAuth";

const CACHE_KEY = "meallens_scan_tutorial_seen";

export function useScanTutorial() {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (!user) {
        setShowTutorial(false);
        setLoading(false);
        return;
      }

      // Check localStorage first for quick response
      const cached = localStorage.getItem(`${CACHE_KEY}_${user.id}`);
      if (cached === "true") {
        setShowTutorial(false);
        setLoading(false);
        return;
      }

      // Check database
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("has_seen_tour")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        // If they haven't seen the tour, show the tutorial
        const hasSeen = Boolean(data?.has_seen_tour);
        setShowTutorial(!hasSeen);
        
        if (hasSeen) {
          localStorage.setItem(`${CACHE_KEY}_${user.id}`, "true");
        }
      } catch (error) {
        console.error("Error checking tutorial status:", error);
        setShowTutorial(false);
      } finally {
        setLoading(false);
      }
    };

    checkTutorialStatus();
  }, [user]);

  const completeTutorial = async () => {
    if (!user) return;

    setShowTutorial(false);
    localStorage.setItem(`${CACHE_KEY}_${user.id}`, "true");

    try {
      await supabase
        .from("profiles")
        .update({ has_seen_tour: true })
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error saving tutorial status:", error);
    }
  };

  return { showTutorial, loading, completeTutorial };
}
