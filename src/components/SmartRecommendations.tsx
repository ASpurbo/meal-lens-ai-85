import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ChevronRight } from "lucide-react";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { useTranslation } from "@/hooks/useTranslation";
import { RecipeModal, Recipe } from "./RecipeModal";

interface SmartRecommendationsProps {
  meals: MealAnalysis[];
}

// Recipe database (keeping existing recipes)
const recipes: Recipe[] = [
  { id: "1", name: "Greek Yogurt Power Bowl", description: "High-protein breakfast", prepTime: "5 mins", servings: 1, calories: 320, protein: 25, carbs: 35, fat: 8, difficulty: "Easy", ingredients: ["1 cup Greek yogurt", "1/2 cup berries", "2 tbsp honey", "1/4 cup granola"], instructions: ["Add yogurt to bowl", "Top with berries and granola", "Drizzle honey"] },
  { id: "2", name: "Grilled Chicken Salad", description: "Lean protein with greens", prepTime: "20 mins", servings: 1, calories: 380, protein: 35, carbs: 15, fat: 18, difficulty: "Easy", ingredients: ["150g chicken", "2 cups greens", "1/2 cucumber", "Olive oil"], instructions: ["Grill chicken", "Arrange salad", "Top and dress"] },
  { id: "3", name: "Overnight Oats", description: "Easy morning meal", prepTime: "5 mins", servings: 1, calories: 350, protein: 12, carbs: 55, fat: 10, difficulty: "Easy", ingredients: ["1/2 cup oats", "1/2 cup milk", "1 tbsp maple syrup"], instructions: ["Mix and refrigerate overnight"] },
];

export function SmartRecommendations({ meals }: SmartRecommendationsProps) {
  const { goals } = useNutritionGoals();
  const { t } = useTranslation();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const recommendation = useMemo(() => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(m => new Date(m.analyzed_at).toDateString() === today);
    const totals = todayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
      }),
      { calories: 0, protein: 0 }
    );

    const remaining = {
      calories: Math.max(0, goals.calories - totals.calories),
      protein: Math.max(0, goals.protein - totals.protein),
    };

    if (todayMeals.length === 0) {
      return { title: "Start your day", subtitle: "Log your first meal", recipes: recipes.slice(0, 2) };
    }
    if (remaining.protein > 15) {
      return { title: `${Math.round(remaining.protein)}g protein to go`, subtitle: "Try these high-protein options", recipes: recipes.filter(r => r.protein >= 15).slice(0, 2) };
    }
    return null;
  }, [meals, goals]);

  if (!recommendation) return null;

  return (
    <>
      <RecipeModal
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onOpenChange={(open) => !open && setSelectedRecipe(null)}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{recommendation.title}</span>
        </div>
        
        <div className="space-y-2">
          {recommendation.recipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <div>
                <p className="font-medium text-sm">{recipe.name}</p>
                <p className="text-xs text-muted-foreground">{recipe.calories} cal • {recipe.protein}g protein</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
