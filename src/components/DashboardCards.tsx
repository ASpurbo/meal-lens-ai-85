import { useState, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Flame, Drumstick, Wheat, Droplets, Apple, Candy, Salad } from "lucide-react";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { format, isToday } from "date-fns";

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

function HealthScoreCard({ score, mealCount }: { score: number | null; mealCount: number }) {
  const showScore = mealCount >= 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/30"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Health Score</h3>
        <span className="text-xl font-bold">
          {showScore && score !== null ? score : "N/A"}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-4">
        {showScore && score !== null && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 to-green-400"
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

  const { totals, mealCount } = useMemo(() => {
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
      mealCount: filteredMeals.length,
    };
  }, [meals, selectedDate]);

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
          value={0}
          max={38}
          label="Fiber"
          color="hsl(270, 60%, 65%)"
          icon={<Apple className="w-5 h-5" />}
          delay={0}
        />
        <MacroCard
          value={0}
          max={96}
          label="Sugar"
          color="hsl(340, 70%, 65%)"
          icon={<Candy className="w-5 h-5" />}
          delay={0.05}
        />
        <MacroCard
          value={0}
          max={2300}
          label="Sodium"
          unit="mg"
          color="hsl(30, 70%, 65%)"
          icon={<Salad className="w-5 h-5" />}
          delay={0.1}
        />
      </div>
      <HealthScoreCard score={null} mealCount={mealCount} />
    </div>,

    // Page 3: Additional stats (Water, Exercise, etc.)
    <div key="page3" className="space-y-3">
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/30 text-center">
        <h3 className="font-semibold text-lg mb-2">More Coming Soon</h3>
        <p className="text-muted-foreground text-sm">
          Water intake, exercise tracking, and more detailed analytics will be available here.
        </p>
      </div>
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
