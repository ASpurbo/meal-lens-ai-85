import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Sunset, Moon, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { MealAnalysis } from "@/hooks/useMealHistory";

interface MealTimelineProps {
  meals: MealAnalysis[];
}

type MealPeriod = "morning" | "afternoon" | "evening" | "night";

const periodConfig: Record<MealPeriod, { icon: typeof Sun; label: string; color: string; range: string }> = {
  morning: { icon: Sun, label: "Morning", color: "from-yellow-500/20 to-orange-500/20", range: "6am - 12pm" },
  afternoon: { icon: Coffee, label: "Afternoon", color: "from-orange-500/20 to-amber-500/20", range: "12pm - 5pm" },
  evening: { icon: Sunset, label: "Evening", color: "from-purple-500/20 to-pink-500/20", range: "5pm - 9pm" },
  night: { icon: Moon, label: "Night", color: "from-indigo-500/20 to-blue-500/20", range: "9pm - 6am" },
};

const getMealPeriod = (dateString: string): MealPeriod => {
  const date = parseISO(dateString);
  const hour = date.getHours();
  
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

const getDateLabel = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d");
};

export function MealTimeline({ meals }: MealTimelineProps) {
  const groupedMeals = useMemo(() => {
    // Group by date first, then by period
    const byDate: Record<string, Record<MealPeriod, MealAnalysis[]>> = {};
    
    meals.forEach((meal) => {
      const dateKey = format(parseISO(meal.analyzed_at), "yyyy-MM-dd");
      const period = getMealPeriod(meal.analyzed_at);
      
      if (!byDate[dateKey]) {
        byDate[dateKey] = { morning: [], afternoon: [], evening: [], night: [] };
      }
      byDate[dateKey][period].push(meal);
    });
    
    return byDate;
  }, [meals]);

  const dates = Object.keys(groupedMeals).sort().reverse().slice(0, 7); // Last 7 days

  if (meals.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <Sun className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No meals logged yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start scanning your meals to see them here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {dates.map((date, dateIndex) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dateIndex * 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {getDateLabel(groupedMeals[date].morning[0]?.analyzed_at || 
                          groupedMeals[date].afternoon[0]?.analyzed_at ||
                          groupedMeals[date].evening[0]?.analyzed_at ||
                          groupedMeals[date].night[0]?.analyzed_at ||
                          date)}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(periodConfig) as MealPeriod[]).map((period) => {
              const config = periodConfig[period];
              const periodMeals = groupedMeals[date][period] || [];
              const Icon = config.icon;
              
              const totalCalories = periodMeals.reduce((sum, m) => sum + m.calories, 0);
              const totalProtein = periodMeals.reduce((sum, m) => sum + m.protein, 0);
              
              return (
                <Card
                  key={period}
                  className={`border-border/50 backdrop-blur-sm overflow-hidden ${
                    periodMeals.length > 0 ? "bg-card/70" : "bg-muted/30"
                  }`}
                >
                  <div className={`h-2 bg-gradient-to-r ${config.color}`} />
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-5 h-5 ${periodMeals.length > 0 ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <h4 className="font-medium text-sm">{config.label}</h4>
                        <p className="text-xs text-muted-foreground">{config.range}</p>
                      </div>
                    </div>
                    
                    {periodMeals.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-calories">
                          {totalCalories}
                          <span className="text-sm font-normal text-muted-foreground ml-1">kcal</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {periodMeals.length} meal{periodMeals.length > 1 ? "s" : ""}
                          {" · "}{Math.round(totalProtein)}g protein
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {periodMeals.flatMap(m => m.foods).slice(0, 2).join(", ")}
                          {periodMeals.flatMap(m => m.foods).length > 2 && "..."}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No meals</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
