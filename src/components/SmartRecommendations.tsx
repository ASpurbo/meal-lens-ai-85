import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ChevronRight, Sparkles } from "lucide-react";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { useTranslation } from "@/hooks/useTranslation";
import { RecipeModal, Recipe } from "./RecipeModal";

interface SmartRecommendationsProps {
  meals: MealAnalysis[];
}

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
      return { title: "Start your day right", subtitle: "Log your first meal", recipes: recipes.slice(0, 2) };
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
        className="relative overflow-hidden bg-card rounded-2xl border border-border/60 p-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-60" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-sm">{recommendation.title}</p>
              <p className="text-xs text-muted-foreground">{recommendation.subtitle}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {recommendation.recipes.map((recipe, index) => (
              <motion.button
                key={recipe.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRecipe(recipe)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-background/70 hover:bg-background transition-colors text-left border border-border/30"
              >
                <div>
                  <p className="font-semibold text-sm">{recipe.name}</p>
                  <p className="text-xs text-muted-foreground">{recipe.calories} cal • {recipe.protein}g protein</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
