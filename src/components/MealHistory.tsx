import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Trash2, ChevronDown, ChevronUp, Utensils, Share2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MealHistoryProps {
  meals: MealAnalysis[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export function MealHistory({ meals, loading, onDelete }: MealHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleShare = async (mealId: string) => {
    if (!user) return;
    
    setSharingId(mealId);
    try {
      const { error } = await supabase
        .from("shared_meals")
        .insert({
          user_id: user.id,
          meal_id: mealId,
          is_public: true,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already shared",
            description: "This meal is already in the community feed.",
            duration: 3000,
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Meal shared!",
          description: "Your meal is now visible in the community feed.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error sharing meal:", error);
      toast({
        title: "Failed to share",
        description: "Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setSharingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Utensils className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No meals yet</h3>
        <p className="text-muted-foreground">
          Upload a meal photo to start tracking your nutrition
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {meals.map((meal, index) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(expandedId === meal.id ? null : meal.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {meal.foods.slice(0, 2).join(", ")}
                      {meal.foods.length > 2 && ` +${meal.foods.length - 2} more`}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(meal.analyzed_at), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-primary">{meal.calories} cal</p>
                  </div>
                  {expandedId === meal.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
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
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 rounded-xl bg-protein/10">
                        <p className="text-lg font-bold text-protein">{meal.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-carbs/10">
                        <p className="text-lg font-bold text-carbs">{meal.carbs}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-fat/10">
                        <p className="text-lg font-bold text-fat">{meal.fat}g</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                    </div>
                    
                    {meal.notes && (
                      <p className="text-sm text-muted-foreground mb-4">{meal.notes}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground capitalize">
                        Confidence: {meal.confidence}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(meal.id);
                          }}
                          disabled={sharingId === meal.id}
                        >
                          {sharingId === meal.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Share2 className="w-4 h-4 mr-1" />
                          )}
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(meal.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
