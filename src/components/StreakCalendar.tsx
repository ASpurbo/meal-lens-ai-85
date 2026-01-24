import { useMemo } from "react";
import { motion } from "framer-motion";
import { subDays, startOfDay, format } from "date-fns";
import { MealAnalysis } from "@/hooks/useMealHistory";

interface StreakCalendarProps {
  meals: MealAnalysis[];
}

export function StreakCalendar({ meals }: StreakCalendarProps) {
  const { calendarDays, currentStreak, longestStreak } = useMemo(() => {
    const today = new Date();
    const days: { date: Date; hasLog: boolean; isToday: boolean }[] = [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = date.toDateString();
      const hasLog = meals.some(
        (meal) => new Date(meal.analyzed_at).toDateString() === dateString
      );
      days.push({
        date,
        hasLog,
        isToday: i === 0,
      });
    }

    // Calculate current streak
    let current = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].hasLog) {
        current++;
      } else {
        break;
      }
    }

    // Calculate longest streak in last 30 days
    let longest = 0;
    let tempStreak = 0;
    for (const day of days) {
      if (day.hasLog) {
        tempStreak++;
        longest = Math.max(longest, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { calendarDays: days, currentStreak: current, longestStreak: longest };
  }, [meals]);

  // Group days into weeks (5 rows of 6 days + 1 row of 6 days = 30 days, or 4 rows of 7 + 2)
  const weeks: typeof calendarDays[] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/30"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Activity</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Current</span>
            <span className="font-bold">{currentStreak}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Best</span>
            <span className="font-bold">{longestStreak}</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="space-y-1.5">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1.5 justify-between">
            {week.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: (weekIndex * 7 + dayIndex) * 0.01,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium
                  transition-colors
                  ${day.hasLog 
                    ? "bg-foreground text-background" 
                    : "bg-muted/50 text-muted-foreground"
                  }
                  ${day.isToday ? "ring-2 ring-foreground/20 ring-offset-2 ring-offset-background" : ""}
                `}
                title={format(day.date, "MMM d")}
              >
                {day.date.getDate()}
              </motion.div>
            ))}
            {/* Fill empty slots in last week */}
            {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted/50" />
          <span>No logs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-foreground" />
          <span>Logged</span>
        </div>
      </div>
    </motion.div>
  );
}
