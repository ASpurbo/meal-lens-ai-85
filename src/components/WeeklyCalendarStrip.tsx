import { useMemo, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 2),
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

  const goToPreviousWeek = () => setWeekOffset(prev => prev - 1);
  const goToNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(prev => prev + 1);
    }
  };

  // Format month/year for header
  const monthYear = useMemo(() => {
    const middleDay = weekDays[3]?.date;
    if (!middleDay) return "";
    return middleDay.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [weekDays]);

  return (
    <div className="py-2">
      {/* Month header with navigation */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button
          onClick={goToPreviousWeek}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <span className="text-sm font-semibold">{monthYear}</span>
        
        <button
          onClick={goToNextWeek}
          disabled={weekOffset >= 0}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            weekOffset >= 0 
              ? "text-muted-foreground/30 cursor-not-allowed" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days strip */}
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
            onClick={() => handleDayClick(day.date)}
            className="flex flex-col items-center gap-1.5 flex-1"
          >
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              {day.dayName}
            </span>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-all ${
                day.isSelected
                  ? "bg-foreground text-background"
                  : day.isToday
                  ? "ring-1 ring-foreground/20"
                  : ""
              }`}
            >
              <span className={`text-sm font-semibold ${
                day.isSelected ? "" : "text-foreground"
              }`}>
                {day.dayNumber}
              </span>
            </div>
            {/* Meal indicator dot */}
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
              day.hasMeals ? "bg-foreground" : "bg-transparent"
            }`} />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
