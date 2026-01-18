import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronRight, Utensils } from "lucide-react";
import { useState } from "react";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { format } from "date-fns";

interface MealHistoryProps {
  meals: MealAnalysis[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export function MealHistory({ meals, loading, onDelete }: MealHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <Utensils className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No meals yet</h3>
        <p className="text-muted-foreground text-sm">
          Take a photo to start tracking
        </p>
      </motion.div>
    );
  }

  // Group meals by date
  const groupedMeals = meals.reduce((acc, meal) => {
    const date = format(new Date(meal.analyzed_at), "EEEE, MMMM d");
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, MealAnalysis[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedMeals).map(([date, dayMeals]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">{date}</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {dayMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer active:bg-muted/50 transition-colors"
                    onClick={() => setExpandedId(expandedId === meal.id ? null : meal.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {meal.foods.slice(0, 2).join(", ")}
                          {meal.foods.length > 2 && ` +${meal.foods.length - 2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(meal.analyzed_at), "h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">{meal.calories}</span>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedId === meal.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === meal.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-border">
                          <div className="flex justify-between py-3">
                            <div className="text-center flex-1">
                              <p className="text-xl font-bold">{meal.protein}g</p>
                              <p className="text-xs text-muted-foreground">Protein</p>
                            </div>
                            <div className="text-center flex-1 border-x border-border">
                              <p className="text-xl font-bold">{meal.carbs}g</p>
                              <p className="text-xs text-muted-foreground">Carbs</p>
                            </div>
                            <div className="text-center flex-1">
                              <p className="text-xl font-bold">{meal.fat}g</p>
                              <p className="text-xs text-muted-foreground">Fat</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(meal.id);
                            }}
                            className="w-full mt-2 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
