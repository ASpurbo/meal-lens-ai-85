import { useMemo, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { MealAnalysis } from "@/hooks/useMealHistory";

interface WeeklyCalendarStripProps {
  meals: MealAnalysis[];
  onDateSelect?: (date: Date) => void;
}

export function WeeklyCalendarStrip({ meals, onDateSelect }: WeeklyCalendarStripProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const weekDays = useMemo(() => {
    const today = new Date();
    const days = [];
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayMeals = meals.filter(
        (m) => new Date(m.analyzed_at).toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 1),
        dayNumber: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        hasMeals: dayMeals.length > 0,
        mealCount: dayMeals.length,
      });
    }
    
    return days;
  }, [meals, weekOffset, selectedDate]);

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 50) {
      setWeekOffset(prev => prev - 1);
    } else if (info.offset.x < -50) {
      if (weekOffset < 0) {
        setWeekOffset(prev => prev + 1);
      }
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleSwipe}
      className="flex items-center justify-between cursor-grab active:cursor-grabbing"
    >
      {weekDays.map((day, index) => (
        <motion.button
          key={`${weekOffset}-${index}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDayClick(day.date)}
          className="flex flex-col items-center gap-1 flex-1 py-2"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            {day.dayName}
          </span>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center relative transition-all ${
              day.isSelected
                ? "bg-foreground text-background"
                : day.hasMeals
                ? "border-2 border-foreground/30"
                : "border border-dashed border-muted-foreground/30"
            }`}
          >
            <span className={`text-sm font-semibold ${
              day.isSelected ? "" : "text-foreground"
            }`}>
              {day.dayNumber}
            </span>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
