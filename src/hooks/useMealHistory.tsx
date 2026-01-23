import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backendClient";
import { useAuth } from "./useAuth";

export interface MealAnalysis {
  id: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence: string;
  notes: string | null;
  analyzed_at: string;
  image_url?: string | null;
  health_score?: number | null;
}

const CACHE_KEY = "meallens_meal_history";

function getCachedMeals(userId: string): MealAnalysis[] {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error("Error reading from cache:", error);
  }
  return [];
}

function setCachedMeals(userId: string, meals: MealAnalysis[]): void {
  try {
    localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(meals));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

export function useMealHistory() {
  const [meals, setMeals] = useState<MealAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { user } = useAuth();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchMeals = async () => {
    if (!user) {
      setMeals([]);
      setLoading(false);
      return;
    }

    // Load from cache first for instant display
    const cachedMeals = getCachedMeals(user.id);
    if (cachedMeals.length > 0) {
      setMeals(cachedMeals);
    }

    // If offline, just use cache
    if (!navigator.onLine) {
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
      
      const fetchedMeals = data || [];
      setMeals(fetchedMeals);
      
      // Update cache with fresh data
      setCachedMeals(user.id, fetchedMeals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      // Keep showing cached data on error
    } finally {
      setLoading(false);
    }
  };

  // Refetch when coming back online
  useEffect(() => {
    if (!isOffline && user) {
      fetchMeals();
    }
  }, [isOffline]);

  useEffect(() => {
    fetchMeals();
  }, [user]);

  const saveMeal = async (mealData: {
    foods: string[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    confidence: string;
    notes: string;
    image_url?: string;
    health_score?: number;
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
          fiber: mealData.fiber || 0,
          sugar: mealData.sugar || 0,
          sodium: mealData.sodium || 0,
          confidence: mealData.confidence,
          notes: mealData.notes,
          image_url: mealData.image_url || null,
          health_score: mealData.health_score || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the list and update cache
      fetchMeals();
      return data;
    } catch (error) {
      console.error("Error saving meal:", error);
      return null;
    }
  };

  const deleteMeal = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("meal_analyses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Update local state and cache immediately
      const updatedMeals = meals.filter(m => m.id !== id);
      setMeals(updatedMeals);
      setCachedMeals(user.id, updatedMeals);
      
      return true;
    } catch (error) {
      console.error("Error deleting meal:", error);
      return false;
    }
  };

  return { meals, loading, isOffline, saveMeal, deleteMeal, refetch: fetchMeals };
}
