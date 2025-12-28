import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { format, subDays, startOfDay, isWithinInterval } from "date-fns";
import { TrendingUp, Flame, Beef, Wheat, Droplet } from "lucide-react";

interface NutritionChartsProps {
  meals: MealAnalysis[];
}

export function NutritionCharts({ meals }: NutritionChartsProps) {
  // Get last 7 days of data
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
      fullDate: format(date, "MMM d"),
      calories: dayMeals.reduce((sum, m) => sum + m.calories, 0),
      protein: dayMeals.reduce((sum, m) => sum + Number(m.protein), 0),
      carbs: dayMeals.reduce((sum, m) => sum + Number(m.carbs), 0),
      fat: dayMeals.reduce((sum, m) => sum + Number(m.fat), 0),
    };
  });

  // Calculate totals for the week
  const weeklyTotals = {
    calories: last7Days.reduce((sum, d) => sum + d.calories, 0),
    protein: Math.round(last7Days.reduce((sum, d) => sum + d.protein, 0)),
    carbs: Math.round(last7Days.reduce((sum, d) => sum + d.carbs, 0)),
    fat: Math.round(last7Days.reduce((sum, d) => sum + d.fat, 0)),
  };

  // Macro breakdown for pie chart
  const macroData = [
    { name: "Protein", value: weeklyTotals.protein, color: "hsl(var(--protein))" },
    { name: "Carbs", value: weeklyTotals.carbs, color: "hsl(var(--carbs))" },
    { name: "Fat", value: weeklyTotals.fat, color: "hsl(var(--fat))" },
  ];

  const totalMacros = weeklyTotals.protein + weeklyTotals.carbs + weeklyTotals.fat;

  if (meals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No data yet</h3>
        <p className="text-muted-foreground">
          Start logging meals to see your nutrition trends
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-card rounded-2xl p-4 border border-border shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Calories</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{weeklyTotals.calories.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
        
        <div className="bg-card rounded-2xl p-4 border border-border shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Beef className="w-5 h-5 text-protein" />
            <span className="text-sm text-muted-foreground">Protein</span>
          </div>
          <p className="text-2xl font-bold text-protein">{weeklyTotals.protein}g</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
        
        <div className="bg-card rounded-2xl p-4 border border-border shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Wheat className="w-5 h-5 text-carbs" />
            <span className="text-sm text-muted-foreground">Carbs</span>
          </div>
          <p className="text-2xl font-bold text-carbs">{weeklyTotals.carbs}g</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
        
        <div className="bg-card rounded-2xl p-4 border border-border shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-5 h-5 text-fat" />
            <span className="text-sm text-muted-foreground">Fat</span>
          </div>
          <p className="text-2xl font-bold text-fat">{weeklyTotals.fat}g</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Calories Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-soft"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Calories</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground">{data.fullDate}</p>
                          <p className="text-primary">{data.calories} calories</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="calories" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Macro Breakdown Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-soft"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Macro Breakdown</h3>
          <div className="h-[200px] flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {macroData.map((macro) => (
                <div key={macro.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: macro.color }}
                  />
                  <span className="text-sm text-muted-foreground flex-1">{macro.name}</span>
                  <span className="text-sm font-medium text-foreground">
                    {totalMacros > 0 ? Math.round((macro.value / totalMacros) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
