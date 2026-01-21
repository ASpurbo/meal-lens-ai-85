import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { format, subDays, startOfDay, isWithinInterval, isToday } from "date-fns";
import { TrendingUp, Activity } from "lucide-react";

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
      fullDate: date,
      calories: dayMeals.reduce((sum, m) => sum + m.calories, 0),
      protein: dayMeals.reduce((sum, m) => sum + Number(m.protein), 0),
      carbs: dayMeals.reduce((sum, m) => sum + Number(m.carbs), 0),
      fat: dayMeals.reduce((sum, m) => sum + Number(m.fat), 0),
      isToday: isToday(date),
    };
  });

  const weeklyTotals = {
    calories: last7Days.reduce((sum, d) => sum + d.calories, 0),
    protein: Math.round(last7Days.reduce((sum, d) => sum + d.protein, 0)),
    carbs: Math.round(last7Days.reduce((sum, d) => sum + d.carbs, 0)),
    fat: Math.round(last7Days.reduce((sum, d) => sum + d.fat, 0)),
  };

  const avgCalories = Math.round(weeklyTotals.calories / 7);
  const maxCalories = Math.max(...last7Days.map(d => d.calories), 1);

  if (meals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <motion.div 
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center"
        >
          <TrendingUp className="w-10 h-10 text-muted-foreground" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">No data yet</h3>
        <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
          Start logging meals to see your nutrition trends
        </p>
      </motion.div>
    );
  }

  const macros = [
    { label: "Protein", value: weeklyTotals.protein, unit: "g", color: "hsl(var(--ring-protein))", dotClass: "macro-dot-protein" },
    { label: "Carbs", value: weeklyTotals.carbs, unit: "g", color: "hsl(var(--ring-carbs))", dotClass: "macro-dot-carbs" },
    { label: "Fat", value: weeklyTotals.fat, unit: "g", color: "hsl(var(--ring-fat))", dotClass: "macro-dot-fat" },
  ];

  return (
    <div className="space-y-4">
      {/* Weekly average hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 p-6 bg-card text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10 opacity-60" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 mx-auto mb-4 flex items-center justify-center">
            <Activity className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Weekly Average</p>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-extrabold tracking-tighter cal-number"
          >
            {avgCalories}
          </motion.p>
          <p className="text-sm text-muted-foreground mt-1 font-medium">calories per day</p>
        </div>
      </motion.div>

      {/* Bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border/60 p-5"
      >
        <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">Daily Calories</h3>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days} barCategoryGap="20%">
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }}
              />
              <Bar 
                dataKey="calories" 
                radius={[8, 8, 0, 0]}
              >
                {last7Days.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? "hsl(var(--ring-calories))" : "hsl(var(--foreground) / 0.2)"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Macro summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border/60 p-5"
      >
        <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">Weekly Macros</h3>
        <div className="grid grid-cols-3 gap-4">
          {macros.map((macro, index) => (
            <motion.div
              key={macro.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className={`w-2 h-2 rounded-full ${macro.dotClass}`} />
                <p className="text-2xl font-bold cal-number">{macro.value}{macro.unit}</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{macro.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
