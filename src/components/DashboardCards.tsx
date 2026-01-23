import { useState, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Flame, Drumstick, Wheat, Droplets, Apple, Candy, Salad, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { format, isToday, subDays, startOfDay, endOfDay } from "date-fns";
import { calculateHealthScore } from "@/lib/healthScore";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
interface DashboardCardsProps {
  meals: MealAnalysis[];
  selectedDate?: Date;
}

interface MacroCardProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  color: string;
  icon: React.ReactNode;
  delay?: number;
}

function MacroCard({ value, max, label, unit = "g", color, icon, delay = 0 }: MacroCardProps) {
  const remaining = Math.max(0, max - value);
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 32;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-4 flex flex-col justify-between min-h-[140px] shadow-sm border border-border/30"
    >
      <div>
        <span className="text-2xl font-bold tracking-tight">
          {Math.round(remaining)}{unit}
        </span>
        <p className="text-sm text-muted-foreground font-medium">
          {label} <span className="font-semibold">left</span>
        </p>
      </div>

      <div className="flex justify-center mt-2">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            {/* Progress ring */}
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
            />
          </svg>
          {/* Icon in center */}
          <div 
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}15` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CalorieCard({ consumed, goal, delay = 0 }: { consumed: number; goal: number; delay?: number }) {
  const remaining = Math.max(0, goal - consumed);
  const percentage = Math.min((consumed / goal) * 100, 100);
  const radius = 50;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-3xl p-6 flex items-center justify-between shadow-sm border border-border/30"
    >
      <div>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-5xl font-bold tracking-tight"
        >
          {Math.round(remaining)}
        </motion.span>
        <p className="text-base text-muted-foreground font-medium mt-1">
          Calories left
        </p>
      </div>

      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>
        {/* Icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Flame className="w-8 h-8 text-foreground" />
        </div>
      </div>
    </motion.div>
  );
}

function HealthScoreCard({ score, mealCount }: { score: number; mealCount: number }) {
  const showScore = mealCount >= 3 && score > 0;
  
  // Get gradient position based on score
  const getGradientPosition = () => {
    if (!showScore) return "0%";
    return `${score}%`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/30"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Health Score</h3>
        <span className="text-xl font-bold">
          {showScore ? score : "N/A"}
        </span>
      </div>
      
      {/* Gradient progress bar */}
      <div className="relative w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
        {/* Full gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-500 to-green-500 opacity-20" />
        
        {/* Active gradient fill */}
        {showScore && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: getGradientPosition() }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 via-amber-500 to-green-500 rounded-full"
          />
        )}
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {showScore 
          ? "Your score reflects nutritional content and how processed your food choices are."
          : "Track a few foods to generate your health score for today. Your score reflects nutritional content and how processed your..."}
      </p>
    </motion.div>
  );
}

export function DashboardCards({ meals, selectedDate = new Date() }: DashboardCardsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const { goals, loading } = useNutritionGoals();

  const { totals, mealCount, healthScore, filteredMeals, weeklyAverage } = useMemo(() => {
    const targetDate = selectedDate.toDateString();
    const filtered = meals.filter(
      (meal) => new Date(meal.analyzed_at).toDateString() === targetDate
    );

    const calculatedTotals = {
      calories: filtered.reduce((sum, meal) => sum + meal.calories, 0),
      protein: filtered.reduce((sum, meal) => sum + meal.protein, 0),
      carbs: filtered.reduce((sum, meal) => sum + meal.carbs, 0),
      fat: filtered.reduce((sum, meal) => sum + meal.fat, 0),
      fiber: filtered.reduce((sum, meal) => sum + (meal.fiber || 0), 0),
      sugar: filtered.reduce((sum, meal) => sum + (meal.sugar || 0), 0),
      sodium: filtered.reduce((sum, meal) => sum + (meal.sodium || 0), 0),
    };

    // Calculate 7-day average (excluding selected date)
    const sevenDaysAgo = subDays(selectedDate, 7);
    const weekMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.analyzed_at);
      return mealDate >= startOfDay(sevenDaysAgo) && 
             mealDate < startOfDay(selectedDate);
    });

    // Group by day to get daily totals, then average
    const dailyTotals: Record<string, { calories: number; protein: number }> = {};
    weekMeals.forEach((meal) => {
      const day = new Date(meal.analyzed_at).toDateString();
      if (!dailyTotals[day]) {
        dailyTotals[day] = { calories: 0, protein: 0 };
      }
      dailyTotals[day].calories += meal.calories;
      dailyTotals[day].protein += meal.protein;
    });

    const daysWithData = Object.keys(dailyTotals).length;
    const avgCalories = daysWithData > 0 
      ? Object.values(dailyTotals).reduce((sum, d) => sum + d.calories, 0) / daysWithData 
      : 0;
    const avgProtein = daysWithData > 0 
      ? Object.values(dailyTotals).reduce((sum, d) => sum + d.protein, 0) / daysWithData 
      : 0;

    // Calculate health score using the utility function
    const score = calculateHealthScore(filtered, goals);

    return {
      totals: calculatedTotals,
      mealCount: filtered.length,
      healthScore: score,
      filteredMeals: filtered,
      weeklyAverage: { calories: avgCalories, protein: avgProtein, daysWithData },
    };
  }, [meals, selectedDate, goals]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && currentPage < 2) {
      setCurrentPage(prev => prev + 1);
    } else if (info.offset.x > threshold && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (loading) return null;

  const pages = [
    // Page 1: Calories + Protein/Carbs/Fat
    <div key="page1" className="space-y-3">
      <CalorieCard consumed={totals.calories} goal={goals.calories} />
      <div className="grid grid-cols-3 gap-3">
        <MacroCard
          value={totals.protein}
          max={goals.protein}
          label="Protein"
          color="hsl(var(--ring-protein))"
          icon={<Drumstick className="w-5 h-5" />}
          delay={0.1}
        />
        <MacroCard
          value={totals.carbs}
          max={goals.carbs}
          label="Carbs"
          color="hsl(var(--ring-carbs))"
          icon={<Wheat className="w-5 h-5" />}
          delay={0.15}
        />
        <MacroCard
          value={totals.fat}
          max={goals.fat}
          label="Fat"
          color="hsl(var(--ring-fat))"
          icon={<Droplets className="w-5 h-5" />}
          delay={0.2}
        />
      </div>
    </div>,

    // Page 2: Fiber/Sugar/Sodium + Health Score
    <div key="page2" className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <MacroCard
          value={totals.fiber}
          max={38}
          label="Fiber"
          color="hsl(270, 60%, 65%)"
          icon={<Apple className="w-5 h-5" />}
          delay={0}
        />
        <MacroCard
          value={totals.sugar}
          max={50}
          label="Sugar"
          color="hsl(340, 70%, 65%)"
          icon={<Candy className="w-5 h-5" />}
          delay={0.05}
        />
        <MacroCard
          value={totals.sodium}
          max={2300}
          label="Sodium"
          unit="mg"
          color="hsl(30, 70%, 65%)"
          icon={<Salad className="w-5 h-5" />}
          delay={0.1}
        />
      </div>
      <HealthScoreCard score={healthScore} mealCount={mealCount} />
    </div>,

    // Page 3: Detailed Analytics with Pie Chart & Weekly Comparison
    <div key="page3" className="space-y-3">
      {/* Macro Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 shadow-sm border border-border/30"
      >
        <h3 className="font-semibold text-lg mb-3">Macro Distribution</h3>
        {totals.protein + totals.carbs + totals.fat > 0 ? (
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Protein", value: Math.round(totals.protein * 4), color: "hsl(var(--ring-protein))" },
                      { name: "Carbs", value: Math.round(totals.carbs * 4), color: "hsl(var(--ring-carbs))" },
                      { name: "Fat", value: Math.round(totals.fat * 9), color: "hsl(var(--ring-fat))" },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {[
                      { color: "hsl(var(--ring-protein))" },
                      { color: "hsl(var(--ring-carbs))" },
                      { color: "hsl(var(--ring-fat))" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--ring-protein))" }} />
                <span className="text-sm text-muted-foreground">Protein</span>
                <span className="ml-auto font-semibold">
                  {totals.calories > 0 ? Math.round((totals.protein * 4 / totals.calories) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--ring-carbs))" }} />
                <span className="text-sm text-muted-foreground">Carbs</span>
                <span className="ml-auto font-semibold">
                  {totals.calories > 0 ? Math.round((totals.carbs * 4 / totals.calories) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--ring-fat))" }} />
                <span className="text-sm text-muted-foreground">Fat</span>
                <span className="ml-auto font-semibold">
                  {totals.calories > 0 ? Math.round((totals.fat * 9 / totals.calories) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Log meals to see your macro distribution
          </p>
        )}
      </motion.div>

      {/* Weekly Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 shadow-sm border border-border/30"
      >
        <h3 className="font-semibold text-lg mb-3">vs 7-Day Average</h3>
        {weeklyAverage.daysWithData > 0 ? (
          <div className="space-y-4">
            {/* Calories comparison */}
            {(() => {
              const diff = totals.calories - weeklyAverage.calories;
              const percentDiff = weeklyAverage.calories > 0 ? Math.round((diff / weeklyAverage.calories) * 100) : 0;
              const isUp = diff > 0;
              const isFlat = Math.abs(percentDiff) < 5;
              return (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isFlat ? 'bg-muted' : isUp ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                      {isFlat ? (
                        <Minus className="w-4 h-4 text-muted-foreground" />
                      ) : isUp ? (
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Calories</p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {Math.round(weeklyAverage.calories)} kcal
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${isFlat ? 'text-muted-foreground' : isUp ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {isUp ? '+' : ''}{Math.round(diff)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {isFlat ? 'on track' : isUp ? `${percentDiff}% more` : `${Math.abs(percentDiff)}% less`}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Protein comparison */}
            {(() => {
              const diff = totals.protein - weeklyAverage.protein;
              const percentDiff = weeklyAverage.protein > 0 ? Math.round((diff / weeklyAverage.protein) * 100) : 0;
              const isUp = diff > 0;
              const isFlat = Math.abs(percentDiff) < 5;
              return (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isFlat ? 'bg-muted' : isUp ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                      {isFlat ? (
                        <Minus className="w-4 h-4 text-muted-foreground" />
                      ) : isUp ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Protein</p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {Math.round(weeklyAverage.protein)}g
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${isFlat ? 'text-muted-foreground' : isUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {isUp ? '+' : ''}{Math.round(diff)}g
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {isFlat ? 'on track' : isUp ? `${percentDiff}% more` : `${Math.abs(percentDiff)}% less`}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Track for a few days to see your weekly trends
          </p>
        )}
      </motion.div>
    </div>,
  ];

  return (
    <div className="space-y-4">
      {/* Swipeable cards container */}
      <motion.div
        key={selectedDate.toDateString()}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="cursor-grab active:cursor-grabbing"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {pages[currentPage]}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentPage === index
                ? "bg-foreground"
                : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
