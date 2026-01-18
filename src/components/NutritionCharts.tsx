import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { format, subDays, startOfDay, isWithinInterval } from "date-fns";
import { TrendingUp } from "lucide-react";

interface NutritionChartsProps {
  meals: MealAnalysis[];
}

export function NutritionCharts({ meals }: NutritionChartsProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayMeals = meals.filter((meal) =>
      isWithinInterval(new Date(meal.analyzed_at), { start: dayStart, end: dayEnd })
    );
    
    return {
      date: format(date, "EEE"),
      calories: dayMeals.reduce((sum, m) => sum + m.calories, 0),
      protein: dayMeals.reduce((sum, m) => sum + Number(m.protein), 0),
      carbs: dayMeals.reduce((sum, m) => sum + Number(m.carbs), 0),
      fat: dayMeals.reduce((sum, m) => sum + Number(m.fat), 0),
    };
  });

  const weeklyTotals = {
    calories: last7Days.reduce((sum, d) => sum + d.calories, 0),
    protein: Math.round(last7Days.reduce((sum, d) => sum + d.protein, 0)),
    carbs: Math.round(last7Days.reduce((sum, d) => sum + d.carbs, 0)),
    fat: Math.round(last7Days.reduce((sum, d) => sum + d.fat, 0)),
  };

  const avgCalories = Math.round(weeklyTotals.calories / 7);

  if (meals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No data yet</h3>
        <p className="text-muted-foreground text-sm">Start logging meals to see trends</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly average - Cal AI style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <p className="text-sm text-muted-foreground mb-2">Weekly Average</p>
        <p className="text-5xl font-bold tracking-tight">{avgCalories}</p>
        <p className="text-sm text-muted-foreground mt-1">calories/day</p>
      </motion.div>

      {/* Bar chart - Cal AI style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Calories</h3>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <Bar 
                dataKey="calories" 
                fill="hsl(var(--foreground))"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Macro summary - Cal AI style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Weekly Macros</h3>
        <div className="flex justify-between">
          <div className="text-center flex-1">
            <p className="text-2xl font-bold">{weeklyTotals.protein}g</p>
            <p className="text-xs text-muted-foreground mt-1">Protein</p>
          </div>
          <div className="text-center flex-1 border-x border-border">
            <p className="text-2xl font-bold">{weeklyTotals.carbs}g</p>
            <p className="text-xs text-muted-foreground mt-1">Carbs</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-2xl font-bold">{weeklyTotals.fat}g</p>
            <p className="text-xs text-muted-foreground mt-1">Fat</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
