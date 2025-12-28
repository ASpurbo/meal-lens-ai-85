import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
    {
      label: "Calories",
      current: todaysTotals.calories,
      goal: goals.calories,
      color: "bg-primary",
      textColor: "text-primary",
    },
    {
      label: "Protein",
      current: todaysTotals.protein,
      goal: goals.protein,
      unit: "g",
      color: "bg-protein",
      textColor: "text-protein",
    },
    {
      label: "Carbs",
      current: todaysTotals.carbs,
      goal: goals.carbs,
      unit: "g",
      color: "bg-carbs",
      textColor: "text-carbs",
    },
    {
      label: "Fat",
      current: todaysTotals.fat,
      goal: goals.fat,
      unit: "g",
      color: "bg-fat",
      textColor: "text-fat",
    },
  ];

  if (loading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Today's Progress</CardTitle>
              <CardDescription>Your daily nutrition intake</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {progressData.map((item, index) => {
            const percentage = Math.min((item.current / item.goal) * 100, 100);
            const isOverGoal = item.current > item.goal;
            
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${item.textColor}`}>{item.label}</span>
                  <span className={`${isOverGoal ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {Math.round(item.current)}{item.unit || ""} / {item.goal}{item.unit || ""}
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`absolute inset-y-0 left-0 ${item.color} ${isOverGoal ? "opacity-80" : ""}`}
                    style={{ borderRadius: "inherit" }}
                  />
                </div>
                {isOverGoal && (
                  <p className="text-xs text-destructive">
                    Over goal by {Math.round(item.current - item.goal)}{item.unit || ""}
                  </p>
                )}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
