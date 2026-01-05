import { useMemo, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
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
    
    // Get the start of the current week (Sunday) with offset
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
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
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
      // Swipe right - go to previous week
      setWeekOffset(prev => prev - 1);
    } else if (info.offset.x < -50) {
      // Swipe left - go to next week (but not beyond current week)
      if (weekOffset < 0) {
        setWeekOffset(prev => prev + 1);
      }
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const goToPreviousWeek = () => setWeekOffset(prev => prev - 1);
  const goToNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(prev => prev + 1);
    }
  };

  return (
    <div className="relative">
      {/* Navigation arrows */}
      <button
        onClick={goToPreviousWeek}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={goToNextWeek}
        disabled={weekOffset >= 0}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 transition-colors ${
          weekOffset >= 0 ? "text-muted-foreground/30" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipe}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-3 cursor-grab active:cursor-grabbing"
      >
        {weekDays.map((day, index) => (
          <motion.button
            key={`${weekOffset}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => handleDayClick(day.date)}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-xs text-muted-foreground font-medium">
              {day.dayName}
            </span>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-colors ${
                day.isSelected
                  ? "bg-foreground text-background"
                  : day.isToday
                  ? "ring-2 ring-foreground/30"
                  : day.hasMeals
                  ? "bg-muted"
                  : "bg-transparent hover:bg-muted/50"
              }`}
            >
              <span className={`text-sm font-semibold ${
                day.isSelected ? "" : day.hasMeals ? "text-foreground" : "text-muted-foreground"
              }`}>
                {day.dayNumber}
              </span>
              {day.hasMeals && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2 h-2 text-primary-foreground" />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}