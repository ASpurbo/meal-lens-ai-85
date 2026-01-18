import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { MealAnalysis } from "@/hooks/useMealHistory";

interface DailyProgressProps {
  meals: MealAnalysis[];
}

interface MacroRingProps {
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
  unit: string;
}

function MacroRing({ value, max, size, strokeWidth, color, label, unit }: MacroRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="ring-progress"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold cal-number">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-[11px] font-medium text-muted-foreground mt-2 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
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

  if (loading) return null;

  const caloriesRemaining = Math.max(0, goals.calories - todaysTotals.calories);
  const caloriePercentage = Math.min((todaysTotals.calories / goals.calories) * 100, 100);
  const radius = 70;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-6"
    >
      {/* Main calorie ring - Cal AI style */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 176 176">
            {/* Background ring */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            {/* Progress ring */}
            <motion.circle
              cx="88"
              cy="88"
              r={radius}
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="ring-progress"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold cal-number tracking-tight">
              {Math.round(caloriesRemaining)}
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
              remaining
            </span>
          </div>
        </div>
        
        {/* Eaten / Goal subtitle */}
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>{Math.round(todaysTotals.calories)} eaten</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{goals.calories} goal</span>
        </div>
      </div>

      {/* Macro rings - Cal AI style */}
      <div className="flex justify-center gap-8">
        <MacroRing
          value={todaysTotals.protein}
          max={goals.protein}
          size={64}
          strokeWidth={5}
          color="hsl(var(--ring-protein))"
          label="Protein"
          unit="g"
        />
        <MacroRing
          value={todaysTotals.carbs}
          max={goals.carbs}
          size={64}
          strokeWidth={5}
          color="hsl(var(--ring-carbs))"
          label="Carbs"
          unit="g"
        />
        <MacroRing
          value={todaysTotals.fat}
          max={goals.fat}
          size={64}
          strokeWidth={5}
          color="hsl(var(--ring-fat))"
          label="Fat"
          unit="g"
        />
      </div>
    </motion.div>
  );
}
