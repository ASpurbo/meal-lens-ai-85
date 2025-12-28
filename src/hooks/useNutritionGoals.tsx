import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface NutritionGoals {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DEFAULT_GOALS: Omit<NutritionGoals, "id"> = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
};

export function useNutritionGoals() {
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) {
      setGoals(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("nutrition_goals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching goals:", error);
        return;
      }

      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const saveGoals = async (newGoals: Omit<NutritionGoals, "id">) => {
    if (!user) return false;

    try {
      if (goals) {
        // Update existing goals
        const { error } = await supabase
          .from("nutrition_goals")
          .update({
            calories: newGoals.calories,
            protein: newGoals.protein,
            carbs: newGoals.carbs,
            fat: newGoals.fat,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new goals
        const { error } = await supabase
          .from("nutrition_goals")
          .insert({
            user_id: user.id,
            calories: newGoals.calories,
            protein: newGoals.protein,
            carbs: newGoals.carbs,
            fat: newGoals.fat,
          });

        if (error) throw error;
      }

      await fetchGoals();
      return true;
    } catch (error) {
      console.error("Error saving goals:", error);
      return false;
    }
  };

  return {
    goals: goals || { id: "", ...DEFAULT_GOALS },
    hasCustomGoals: !!goals,
    loading,
    saveGoals,
    refetch: fetchGoals,
  };
}
