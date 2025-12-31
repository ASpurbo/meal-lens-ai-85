import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useTour() {
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTourStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("has_seen_tour, onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        // Show tour if onboarding is complete but tour hasn't been seen
        if (data?.onboarding_completed && !data?.has_seen_tour) {
          setShowTour(true);
        }
      } catch (error) {
        console.error("Error checking tour status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkTourStatus();
  }, [user]);

  const completeTour = async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ has_seen_tour: true })
        .eq("user_id", user.id);

      setShowTour(false);
    } catch (error) {
      console.error("Error completing tour:", error);
    }
  };

  const resetTour = async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ has_seen_tour: false })
        .eq("user_id", user.id);

      setShowTour(true);
    } catch (error) {
      console.error("Error resetting tour:", error);
    }
  };

  return { showTour, loading, completeTour, resetTour };
}
