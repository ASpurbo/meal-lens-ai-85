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
  delay?: number;
}

function MacroRing({ value, max, size, strokeWidth, color, label, delay = 0 }: MacroRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
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
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold cal-number">{Math.round(value)}</span>
          <span className="text-[9px] text-muted-foreground font-medium">/ {max}g</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
    </motion.div>
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
  const radius = 72;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={selectedDate.toDateString()}
      className="py-4"
    >
      {/* Date indicator when not today */}
      {!isViewingToday && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <span className="px-4 py-1.5 rounded-full bg-muted text-sm font-semibold">
            {dateLabel}
          </span>
        </motion.div>
      )}

      {/* Main calorie ring */}
      <div className="flex flex-col items-center mb-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-48 h-48"
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
            {/* Outer glow effect */}
            <circle
              cx="96"
              cy="96"
              r={radius + 8}
              fill="none"
              stroke="hsl(var(--ring-calories) / 0.1)"
              strokeWidth="2"
            />
            {/* Background ring */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            {/* Progress ring */}
            <motion.circle
              cx="96"
              cy="96"
              r={radius}
              fill="none"
              stroke="hsl(var(--ring-calories))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-extrabold cal-number tracking-tighter"
            >
              {isViewingToday ? Math.round(caloriesRemaining) : Math.round(totals.calories)}
            </motion.span>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1"
            >
              {isViewingToday ? "remaining" : "consumed"}
            </motion.span>
          </div>
        </motion.div>
        
        {/* Progress summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 mt-5"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-foreground/20" />
            <span className="text-sm text-muted-foreground font-medium">{Math.round(totals.calories)} eaten</span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full macro-dot-calories" />
            <span className="text-sm text-muted-foreground font-medium">{goals.calories} goal</span>
          </div>
        </motion.div>
      </div>

      {/* Macro rings */}
      <div className="flex justify-center gap-6">
        <MacroRing
          value={totals.protein}
          max={goals.protein}
          size={72}
          strokeWidth={6}
          color="hsl(var(--ring-protein))"
          label="Protein"
          delay={0.1}
        />
        <MacroRing
          value={totals.carbs}
          max={goals.carbs}
          size={72}
          strokeWidth={6}
          color="hsl(var(--ring-carbs))"
          label="Carbs"
          delay={0.2}
        />
        <MacroRing
          value={totals.fat}
          max={goals.fat}
          size={72}
          strokeWidth={6}
          color="hsl(var(--ring-fat))"
          label="Fat"
          delay={0.3}
        />
      </div>
    </motion.div>
  );
}
