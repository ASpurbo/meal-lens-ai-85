import { motion } from "framer-motion";
import { Flame, Drumstick, Wheat, Droplets } from "lucide-react";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface RecentlyUploadedProps {
  meals: MealAnalysis[];
}

export function RecentlyUploaded({ meals }: RecentlyUploadedProps) {
  const { t } = useTranslation();
  
  // Get only meals from today, limit to 5
  const today = new Date().toDateString();
  const recentMeals = meals
    .filter((meal) => new Date(meal.analyzed_at).toDateString() === today)
    .slice(0, 5);

  if (recentMeals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground px-1">
        Recently uploaded
      </h2>

      <div className="space-y-3">
        {recentMeals.map((meal, index) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl p-4 flex items-center gap-4 shadow-sm"
          >
            {/* Food image placeholder */}
            <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
              <div className="text-4xl">🍽️</div>
            </div>

            {/* Meal info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground truncate pr-2">
                  {meal.foods.length > 0 ? meal.foods[0] : "Unnamed Food"}
                  {meal.foods.length > 1 && "..."}
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                  {format(new Date(meal.analyzed_at), "h:mm a")}
                </span>
              </div>

              {/* Calories */}
              <div className="flex items-center gap-1.5 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-foreground">
                  {Math.round(meal.calories)} calories
                </span>
              </div>

              {/* Macros */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Drumstick className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-muted-foreground font-medium">
                    {Math.round(meal.protein)}g
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Wheat className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-muted-foreground font-medium">
                    {Math.round(meal.carbs)}g
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-muted-foreground font-medium">
                    {Math.round(meal.fat)}g
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
