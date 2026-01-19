import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { format, isToday } from "date-fns";

interface DailyProgressProps {
  meals: MealAnalysis[];
  selectedDate?: Date;
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

export function DailyProgress({ meals, selectedDate = new Date() }: DailyProgressProps) {
  const { goals, loading } = useNutritionGoals();

  const { totals, dateLabel, isViewingToday } = useMemo(() => {
    const targetDate = selectedDate.toDateString();
    const filteredMeals = meals.filter(
      (meal) => new Date(meal.analyzed_at).toDateString() === targetDate
    );

    return {
      totals: {
        calories: filteredMeals.reduce((sum, meal) => sum + meal.calories, 0),
        protein: filteredMeals.reduce((sum, meal) => sum + meal.protein, 0),
        carbs: filteredMeals.reduce((sum, meal) => sum + meal.carbs, 0),
        fat: filteredMeals.reduce((sum, meal) => sum + meal.fat, 0),
      },
      dateLabel: isToday(selectedDate) ? "Today" : format(selectedDate, "MMM d"),
      isViewingToday: isToday(selectedDate),
    };
  }, [meals, selectedDate]);

  if (loading) return null;

  const caloriesRemaining = Math.max(0, goals.calories - totals.calories);
  const caloriePercentage = Math.min((totals.calories / goals.calories) * 100, 100);
  const radius = 70;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={selectedDate.toDateString()}
      className="py-6"
    >
      {/* Date indicator when not today */}
      {!isViewingToday && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
            {dateLabel}
          </span>
        </motion.div>
      )}

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
              {isViewingToday ? Math.round(caloriesRemaining) : Math.round(totals.calories)}
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
              {isViewingToday ? "remaining" : "consumed"}
            </span>
          </div>
        </div>
        
        {/* Eaten / Goal subtitle */}
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>{Math.round(totals.calories)} eaten</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{goals.calories} goal</span>
        </div>
      </div>

      {/* Macro rings - Cal AI style */}
      <div className="flex justify-center gap-8">
        <MacroRing
          value={totals.protein}
          max={goals.protein}
          size={64}
          strokeWidth={5}
          color="hsl(var(--ring-protein))"
          label="Protein"
          unit="g"
        />
        <MacroRing
          value={totals.carbs}
          max={goals.carbs}
          size={64}
          strokeWidth={5}
          color="hsl(var(--ring-carbs))"
          label="Carbs"
          unit="g"
        />
        <MacroRing
          value={totals.fat}
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
