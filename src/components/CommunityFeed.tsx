import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Share2, Clock, ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface SharedMeal {
  id: string;
  user_id: string;
  caption: string | null;
  shared_at: string;
  meal: {
    foods: string[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  profile: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export function CommunityFeed() {
  const [sharedMeals, setSharedMeals] = useState<SharedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSharedMeals();
  }, []);

  const fetchSharedMeals = async () => {
    try {
      const { data, error } = await supabase
        .from("shared_meals")
        .select(`
          id,
          user_id,
          caption,
          shared_at,
          meal:meal_id (
            foods,
            calories,
            protein,
            carbs,
            fat
          )
        `)
        .eq("is_public", true)
        .order("shared_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map((d) => d.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      const mealsWithProfiles = (data || []).map((meal) => ({
        ...meal,
        profile: profileMap.get(meal.user_id) || null,
      }));

      setSharedMeals(mealsWithProfiles);
    } catch (error) {
      console.error("Error fetching shared meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareMeal = async (mealId: string, caption: string = "") => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("shared_meals")
        .insert({
          user_id: user.id,
          meal_id: mealId,
          caption,
          is_public: true,
        });

      if (error) throw error;

      toast({
        title: "Meal shared!",
        description: "Your meal is now visible in the community feed.",
      });

      fetchSharedMeals();
    } catch (error) {
      console.error("Error sharing meal:", error);
      toast({
        title: "Failed to share",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (profile: SharedMeal["profile"]) => {
    if (profile?.display_name) {
      return profile.display_name.slice(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.slice(0, 2).toUpperCase();
    }
    return "NM";
  };

  const getDisplayName = (profile: SharedMeal["profile"]) => {
    if (profile?.display_name) return profile.display_name;
    if (profile?.email) return profile.email.split("@")[0];
    return "NutriMind User";
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <div className="animate-pulse">Loading community feed...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Community Feed</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {sharedMeals.length} shared meals
        </span>
      </div>

      {sharedMeals.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">No shared meals yet</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to share a meal with the community!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sharedMeals.map((sharedMeal, i) => (
            <motion.div
              key={sharedMeal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
                <CardContent className="pt-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(sharedMeal.profile)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {getDisplayName(sharedMeal.profile)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(sharedMeal.shared_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Meal info */}
                  {sharedMeal.meal && (
                    <div className="space-y-3">
                      {/* All foods */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Foods:</p>
                        <div className="flex flex-wrap gap-2">
                          {sharedMeal.meal.foods.map((food, j) => (
                            <span
                              key={j}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {food}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-calories/10">
                          <div className="text-sm font-bold text-calories">
                            {sharedMeal.meal.calories}
                          </div>
                          <div className="text-xs text-muted-foreground">kcal</div>
                        </div>
                        <div className="p-2 rounded-lg bg-protein/10">
                          <div className="text-sm font-bold text-protein">
                            {Math.round(sharedMeal.meal.protein)}g
                          </div>
                          <div className="text-xs text-muted-foreground">protein</div>
                        </div>
                        <div className="p-2 rounded-lg bg-carbs/10">
                          <div className="text-sm font-bold text-carbs">
                            {Math.round(sharedMeal.meal.carbs)}g
                          </div>
                          <div className="text-xs text-muted-foreground">carbs</div>
                        </div>
                        <div className="p-2 rounded-lg bg-fat/10">
                          <div className="text-sm font-bold text-fat">
                            {Math.round(sharedMeal.meal.fat)}g
                          </div>
                          <div className="text-xs text-muted-foreground">fat</div>
                        </div>
                      </div>

                      {sharedMeal.caption && (
                        <p className="text-sm text-muted-foreground">
                          "{sharedMeal.caption}"
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
