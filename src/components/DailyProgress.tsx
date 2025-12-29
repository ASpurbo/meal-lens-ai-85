import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { MealAnalysis } from "@/hooks/useMealHistory";

interface DailyProgressProps {
  meals: MealAnalysis[];
}

export function DailyProgress({ meals }: DailyProgressProps) {
  const { goals, loading } = useNutritionGoals();

  const todaysTotals = useMemo(() => {
    const today = new Date().toDateString();
    const todaysMeals = meals.filter(
      (meal) => new Date(meal.analyzed_at).toDateString() === today
    );

    return {
      calories: todaysMeals.reduce((sum, meal) => sum + meal.calories, 0),
      protein: todaysMeals.reduce((sum, meal) => sum + meal.protein, 0),
      carbs: todaysMeals.reduce((sum, meal) => sum + meal.carbs, 0),
      fat: todaysMeals.reduce((sum, meal) => sum + meal.fat, 0),
    };
  }, [meals]);

  const progressData = [
    { label: "Calories", current: todaysTotals.calories, goal: goals.calories, unit: "" },
    { label: "Protein", current: todaysTotals.protein, goal: goals.protein, unit: "g" },
    { label: "Carbs", current: todaysTotals.carbs, goal: goals.carbs, unit: "g" },
    { label: "Fat", current: todaysTotals.fat, goal: goals.fat, unit: "g" },
  ];

  if (loading) return null;

  const caloriePercentage = Math.min((todaysTotals.calories / goals.calories) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          {/* Main calorie circle */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${caloriePercentage * 2.64} 264`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold">{Math.round(todaysTotals.calories)}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">kcal</span>
              </div>
            </div>
          </div>

          {/* Macro bars */}
          <div className="grid grid-cols-3 gap-4">
            {progressData.slice(1).map((item, index) => {
              const percentage = Math.min((item.current / item.goal) * 100, 100);
              return (
                <div key={item.label} className="text-center">
                  <div className="h-2 bg-accent rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-foreground rounded-full"
                    />
                  </div>
                  <p className="text-lg font-semibold">{Math.round(item.current)}{item.unit}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}