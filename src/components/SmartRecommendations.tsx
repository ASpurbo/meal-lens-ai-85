import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { RecipeModal, Recipe } from "./RecipeModal";

interface SmartRecommendationsProps {
  meals: MealAnalysis[];
}

// Recipe database
const recipes: Recipe[] = [
  {
    id: "1",
    name: "Greek Yogurt Power Bowl",
    description: "High-protein breakfast packed with nutrients",
    prepTime: "5 mins",
    servings: 1,
    calories: 320,
    protein: 25,
    carbs: 35,
    fat: 8,
    difficulty: "Easy",
    ingredients: [
      "1 cup Greek yogurt (plain, 2%)",
      "1/2 cup mixed berries",
      "2 tbsp honey",
      "1/4 cup granola",
      "1 tbsp chia seeds",
    ],
    instructions: [
      "Add Greek yogurt to a bowl.",
      "Top with mixed berries and granola.",
      "Drizzle with honey.",
      "Sprinkle chia seeds on top and serve.",
    ],
  },
  {
    id: "2",
    name: "Grilled Chicken Salad",
    description: "Lean protein with fresh vegetables",
    prepTime: "20 mins",
    servings: 1,
    calories: 380,
    protein: 35,
    carbs: 15,
    fat: 18,
    difficulty: "Easy",
    ingredients: [
      "150g chicken breast",
      "2 cups mixed greens",
      "1/2 cucumber, sliced",
      "10 cherry tomatoes",
      "1/4 avocado",
      "2 tbsp olive oil dressing",
    ],
    instructions: [
      "Season chicken breast with salt and pepper.",
      "Grill chicken for 6-7 minutes each side until cooked through.",
      "Let rest for 3 minutes, then slice.",
      "Arrange greens on a plate with vegetables.",
      "Top with sliced chicken and avocado.",
      "Drizzle with olive oil dressing.",
    ],
  },
  {
    id: "3",
    name: "Overnight Oats",
    description: "Prepare the night before for an easy morning",
    prepTime: "5 mins + overnight",
    servings: 1,
    calories: 350,
    protein: 12,
    carbs: 55,
    fat: 10,
    difficulty: "Easy",
    ingredients: [
      "1/2 cup rolled oats",
      "1/2 cup milk of choice",
      "1/4 cup Greek yogurt",
      "1 tbsp maple syrup",
      "1/2 banana, sliced",
      "1 tbsp almond butter",
    ],
    instructions: [
      "Combine oats, milk, yogurt, and maple syrup in a jar.",
      "Stir well, cover, and refrigerate overnight.",
      "In the morning, top with banana and almond butter.",
      "Enjoy cold or microwave for 1-2 minutes.",
    ],
  },
  {
    id: "4",
    name: "Salmon & Quinoa Bowl",
    description: "Omega-3 rich dinner with complete protein",
    prepTime: "25 mins",
    servings: 1,
    calories: 520,
    protein: 38,
    carbs: 40,
    fat: 22,
    difficulty: "Medium",
    ingredients: [
      "150g salmon fillet",
      "1/2 cup cooked quinoa",
      "1 cup steamed broccoli",
      "1/4 avocado",
      "1 tbsp soy sauce",
      "1 tsp sesame oil",
      "Sesame seeds for garnish",
    ],
    instructions: [
      "Season salmon with salt and pepper.",
      "Pan-sear salmon 4-5 minutes per side.",
      "Cook quinoa according to package directions.",
      "Steam broccoli until tender-crisp.",
      "Assemble bowl with quinoa, salmon, broccoli, and avocado.",
      "Drizzle with soy sauce and sesame oil, garnish with seeds.",
    ],
  },
  {
    id: "5",
    name: "Avocado Toast with Eggs",
    description: "Classic healthy fats breakfast",
    prepTime: "10 mins",
    servings: 1,
    calories: 420,
    protein: 18,
    carbs: 30,
    fat: 26,
    difficulty: "Easy",
    ingredients: [
      "2 slices whole grain bread",
      "1 ripe avocado",
      "2 eggs",
      "Salt, pepper, red pepper flakes",
      "Cherry tomatoes for garnish",
    ],
    instructions: [
      "Toast bread until golden.",
      "Mash avocado with salt and pepper.",
      "Fry or poach eggs to your preference.",
      "Spread avocado on toast.",
      "Top with eggs and season with red pepper flakes.",
    ],
  },
  {
    id: "6",
    name: "Lentil Vegetable Soup",
    description: "Fiber-rich, warming comfort food",
    prepTime: "35 mins",
    servings: 4,
    calories: 280,
    protein: 16,
    carbs: 42,
    fat: 4,
    difficulty: "Easy",
    ingredients: [
      "1 cup dried lentils",
      "2 carrots, diced",
      "2 celery stalks, diced",
      "1 onion, diced",
      "3 cloves garlic",
      "4 cups vegetable broth",
      "1 can diced tomatoes",
      "Cumin, paprika, salt to taste",
    ],
    instructions: [
      "Sauté onion, carrots, and celery until soft.",
      "Add garlic and spices, cook 1 minute.",
      "Add lentils, broth, and tomatoes.",
      "Bring to boil, then simmer 25-30 minutes.",
      "Season to taste and serve.",
    ],
  },
  {
    id: "7",
    name: "Mixed Nuts & Dark Chocolate",
    description: "Healthy fats snack for energy",
    prepTime: "2 mins",
    servings: 1,
    calories: 280,
    protein: 7,
    carbs: 18,
    fat: 22,
    difficulty: "Easy",
    ingredients: [
      "1/4 cup mixed nuts (almonds, walnuts, cashews)",
      "1 oz dark chocolate (70%+)",
    ],
    instructions: [
      "Portion nuts into a small bowl.",
      "Break chocolate into pieces.",
      "Enjoy as an afternoon snack.",
    ],
  },
  {
    id: "8",
    name: "Veggie Stir-Fry with Tofu",
    description: "Light, plant-based dinner option",
    prepTime: "20 mins",
    servings: 2,
    calories: 320,
    protein: 18,
    carbs: 28,
    fat: 16,
    difficulty: "Easy",
    ingredients: [
      "200g firm tofu, cubed",
      "2 cups mixed vegetables",
      "2 tbsp soy sauce",
      "1 tbsp sesame oil",
      "1 tbsp ginger, minced",
      "2 cloves garlic",
    ],
    instructions: [
      "Press tofu and cut into cubes.",
      "Heat sesame oil, cook tofu until golden.",
      "Add garlic and ginger, stir 30 seconds.",
      "Add vegetables, stir-fry 5-7 minutes.",
      "Add soy sauce, toss to coat, serve.",
    ],
  },
];

interface Recommendation {
  title: string;
  description: string;
  macro: "protein" | "carbs" | "fat" | "calories";
  recipes: Recipe[];
}

export function SmartRecommendations({ meals }: SmartRecommendationsProps) {
  const { goals } = useNutritionGoals();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const recommendations = useMemo<Recommendation[]>(() => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(
      (m) => new Date(m.analyzed_at).toDateString() === today
    );

    const totals = todayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const remaining = {
      calories: Math.max(0, goals.calories - totals.calories),
      protein: Math.max(0, goals.protein - totals.protein),
      carbs: Math.max(0, goals.carbs - totals.carbs),
      fat: Math.max(0, goals.fat - totals.fat),
    };

    const recs: Recommendation[] = [];

    if (remaining.protein > 15) {
      const proteinRecipes = recipes.filter((r) => r.protein >= 15).slice(0, 3);
      recs.push({
        title: `${Math.round(remaining.protein)}g protein to go`,
        description: "Try these high-protein recipes",
        macro: "protein",
        recipes: proteinRecipes,
      });
    }

    if (remaining.carbs > 30) {
      const carbRecipes = recipes.filter((r) => r.carbs >= 25).slice(0, 3);
      recs.push({
        title: `${Math.round(remaining.carbs)}g carbs remaining`,
        description: "Healthy carb options for you",
        macro: "carbs",
        recipes: carbRecipes,
      });
    }

    if (remaining.fat > 15) {
      const fatRecipes = recipes.filter((r) => r.fat >= 15).slice(0, 3);
      recs.push({
        title: `Add ${Math.round(remaining.fat)}g healthy fats`,
        description: "Good fat sources",
        macro: "fat",
        recipes: fatRecipes,
      });
    }

    if (todayMeals.length === 0) {
      recs.push({
        title: "Start your day right",
        description: "No meals logged — here are some ideas",
        macro: "protein",
        recipes: recipes.filter((r) => r.calories < 400).slice(0, 3),
      });
    }

    return recs.slice(0, 2);
  }, [meals, goals]);

  const macroColors: Record<string, string> = {
    protein: "text-protein",
    carbs: "text-carbs",
    fat: "text-fat",
    calories: "text-calories",
  };

  if (recommendations.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-primary/5 to-accent/30">
        <CardContent className="py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="font-medium">You're on track today!</p>
          <p className="text-sm text-muted-foreground">Keep up the great work</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <RecipeModal
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onOpenChange={(open) => !open && setSelectedRecipe(null)}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Recommendations</h2>
        </div>

        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
              <CardContent className="py-4">
                <h3 className={`font-medium text-sm ${macroColors[rec.macro]}`}>
                  {rec.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                <div className="space-y-2">
                  {rec.recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{recipe.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{recipe.calories} cal</span>
                          <span>{recipe.protein}g protein</span>
                          <span>{recipe.prepTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}
