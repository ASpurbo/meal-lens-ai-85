import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronRight, Utensils, Clock } from "lucide-react";
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
        className="text-center py-20"
      >
        <motion.div 
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center"
        >
          <Utensils className="w-10 h-10 text-muted-foreground" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">No meals yet</h3>
        <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
          Take a photo of your food to start tracking your nutrition
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
        <motion.div 
          key={date}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-sm font-bold text-muted-foreground mb-3 px-1 uppercase tracking-wide">{date}</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {dayMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm"
                >
                  <motion.div
                    whileTap={{ scale: 0.99 }}
                    className="p-4 cursor-pointer active:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(expandedId === meal.id ? null : meal.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {meal.foods.slice(0, 2).join(", ")}
                          {meal.foods.length > 2 && ` +${meal.foods.length - 2}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(meal.analyzed_at), "h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xl font-bold cal-number">{meal.calories}</span>
                          <span className="text-xs text-muted-foreground ml-1">kcal</span>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedId === meal.id ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {expandedId === meal.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-border/50">
                          <div className="flex justify-between py-3">
                            <div className="text-center flex-1">
                              <div className="flex items-center justify-center gap-1.5 mb-1">
                                <div className="w-2 h-2 rounded-full macro-dot-protein" />
                                <p className="text-xl font-bold cal-number">{meal.protein}g</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Protein</p>
                            </div>
                            <div className="text-center flex-1 border-x border-border/50">
                              <div className="flex items-center justify-center gap-1.5 mb-1">
                                <div className="w-2 h-2 rounded-full macro-dot-carbs" />
                                <p className="text-xl font-bold cal-number">{meal.carbs}g</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Carbs</p>
                            </div>
                            <div className="text-center flex-1">
                              <div className="flex items-center justify-center gap-1.5 mb-1">
                                <div className="w-2 h-2 rounded-full macro-dot-fat" />
                                <p className="text-xl font-bold cal-number">{meal.fat}g</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Fat</p>
                            </div>
                          </div>
                          
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(meal.id);
                            }}
                            className="w-full mt-3 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete meal
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
