import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Utensils, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";

interface SmartRecommendationsProps {
  meals: MealAnalysis[];
}

interface Recommendation {
  title: string;
  description: string;
  macro: "protein" | "carbs" | "fat" | "calories";
  suggestions: string[];
}

const proteinSuggestions = [
  "Greek yogurt (15g protein)",
  "Grilled chicken breast (31g protein)",
  "Eggs - 2 whole (12g protein)",
  "Tofu stir-fry (20g protein)",
  "Cottage cheese (14g protein)",
  "Salmon fillet (25g protein)",
  "Lentil soup (18g protein)",
  "Protein shake (25g protein)",
];

const carbSuggestions = [
  "Brown rice bowl (45g carbs)",
  "Sweet potato (26g carbs)",
  "Oatmeal with berries (40g carbs)",
  "Whole grain pasta (43g carbs)",
  "Quinoa salad (34g carbs)",
  "Banana (27g carbs)",
  "Whole wheat bread (25g carbs)",
];

const fatSuggestions = [
  "Avocado (21g healthy fats)",
  "Mixed nuts (20g fats)",
  "Olive oil dressing (14g fats)",
  "Nut butter (16g fats)",
  "Cheese (9g fats)",
  "Dark chocolate (12g fats)",
];

const calorieSuggestions = [
  "Light salad with grilled protein",
  "Vegetable soup",
  "Fresh fruit bowl",
  "Steamed vegetables",
  "Lean protein with veggies",
];

export function SmartRecommendations({ meals }: SmartRecommendationsProps) {
  const { goals } = useNutritionGoals();

  const recommendations = useMemo<Recommendation[]>(() => {
    // Calculate today's totals
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

    // Protein recommendation
    if (remaining.protein > 15) {
      recs.push({
        title: `Need ${Math.round(remaining.protein)}g more protein`,
        description: "Here are some protein-rich options:",
        macro: "protein",
        suggestions: proteinSuggestions.slice(0, 3),
      });
    }

    // Carbs recommendation
    if (remaining.carbs > 30) {
      recs.push({
        title: `${Math.round(remaining.carbs)}g carbs remaining`,
        description: "Healthy carb sources to consider:",
        macro: "carbs",
        suggestions: carbSuggestions.slice(0, 3),
      });
    }

    // Fat recommendation
    if (remaining.fat > 10) {
      recs.push({
        title: `Add ${Math.round(remaining.fat)}g healthy fats`,
        description: "Good sources of healthy fats:",
        macro: "fat",
        suggestions: fatSuggestions.slice(0, 3),
      });
    }

    // If over calories, suggest light options
    if (totals.calories > goals.calories * 0.9 && remaining.calories < 200) {
      recs.unshift({
        title: "Almost at calorie goal!",
        description: "If you're still hungry, try these light options:",
        macro: "calories",
        suggestions: calorieSuggestions.slice(0, 3),
      });
    }

    // If no meals today
    if (todayMeals.length === 0) {
      recs.push({
        title: "Start your day right!",
        description: "No meals logged yet. Here are some balanced options:",
        macro: "protein",
        suggestions: [
          "Eggs with whole grain toast",
          "Overnight oats with nuts",
          "Smoothie with protein powder",
        ],
      });
    }

    return recs.slice(0, 3); // Max 3 recommendations
  }, [meals, goals]);

  const macroColors: Record<string, string> = {
    protein: "text-protein",
    carbs: "text-carbs",
    fat: "text-fat",
    calories: "text-calories",
  };

  if (recommendations.length === 0) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Great job!</h3>
          <p className="text-muted-foreground">
            You're on track with your nutrition goals today.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Smart Recommendations</h2>
      </div>

      {recommendations.map((rec, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-4">
              <h3 className={`font-semibold mb-1 ${macroColors[rec.macro]}`}>
                {rec.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
              <div className="space-y-2">
                {rec.suggestions.map((suggestion, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Utensils className="w-4 h-4 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
