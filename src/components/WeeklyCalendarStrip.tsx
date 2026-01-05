import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { MealAnalysis } from "@/hooks/useMealHistory";

interface WeeklyCalendarStripProps {
  meals: MealAnalysis[];
}

export function WeeklyCalendarStrip({ meals }: WeeklyCalendarStripProps) {
  const weekDays = useMemo(() => {
    const today = new Date();
    const days = [];
    
    // Get the start of the current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayMeals = meals.filter(
        (m) => new Date(m.analyzed_at).toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
        dayNumber: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        hasMeals: dayMeals.length > 0,
        mealCount: dayMeals.length,
      });
    }
    
    return days;
  }, [meals]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-2 py-3"
    >
      {weekDays.map((day, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-xs text-muted-foreground font-medium">
            {day.dayName}
          </span>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
              day.isToday
                ? "bg-foreground text-background"
                : day.hasMeals
                ? "bg-muted"
                : "bg-transparent"
            }`}
          >
            <span className={`text-sm font-semibold ${
              day.isToday ? "" : day.hasMeals ? "text-foreground" : "text-muted-foreground"
            }`}>
              {day.dayNumber}
            </span>
            {day.hasMeals && !day.isToday && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2 h-2 text-primary-foreground" />
              </div>
            )}
            {day.hasMeals && day.isToday && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2 h-2 text-primary-foreground" />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}