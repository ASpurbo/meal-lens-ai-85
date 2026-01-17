import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backendClient";
import { useAuth } from "./useAuth";

export interface NutritionGoals {
  id?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
};

export function useNutritionGoals() {
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) {
      setGoals(DEFAULT_GOALS);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("nutrition_goals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setGoals({
          id: data.id,
          calories: data.calories,
          protein: Number(data.protein),
          carbs: Number(data.carbs),
          fat: Number(data.fat),
        });
      } else {
        setGoals(DEFAULT_GOALS);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setGoals(DEFAULT_GOALS);
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
      const { error } = await supabase
        .from("nutrition_goals")
        .upsert({
          user_id: user.id,
          calories: newGoals.calories,
          protein: newGoals.protein,
          carbs: newGoals.carbs,
          fat: newGoals.fat,
        }, { onConflict: "user_id" });

      if (error) throw error;
      
      setGoals(newGoals);
      return true;
    } catch (error) {
      console.error("Error saving goals:", error);
      return false;
    }
  };

  return {
    goals,
    hasCustomGoals: goals.id !== undefined,
    loading,
    saveGoals,
    refetch: fetchGoals,
  };
}
