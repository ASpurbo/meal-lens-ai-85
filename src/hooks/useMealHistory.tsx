import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MealAnalysis {
  id: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: string;
  notes: string | null;
  analyzed_at: string;
}

export function useMealHistory() {
  const [meals, setMeals] = useState<MealAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMeals = async () => {
    if (!user) {
      setMeals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("meal_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("analyzed_at", { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [user]);

  const saveMeal = async (mealData: {
    foods: string[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: string;
    notes: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("meal_analyses")
        .insert({
          user_id: user.id,
          foods: mealData.foods,
          calories: mealData.calories,
          protein: mealData.protein,
          carbs: mealData.carbs,
          fat: mealData.fat,
          confidence: mealData.confidence,
          notes: mealData.notes,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the list
      fetchMeals();
      return data;
    } catch (error) {
      console.error("Error saving meal:", error);
      return null;
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("meal_analyses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Refresh the list
      fetchMeals();
      return true;
    } catch (error) {
      console.error("Error deleting meal:", error);
      return false;
    }
  };

  return { meals, loading, saveMeal, deleteMeal, refetch: fetchMeals };
}
