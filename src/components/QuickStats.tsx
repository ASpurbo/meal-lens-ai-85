import { motion } from "framer-motion";
import { Flame, Trophy, TrendingUp, Zap } from "lucide-react";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/backendClient";
import { useAuth } from "@/hooks/useAuth";

interface QuickStatsProps {
  meals: MealAnalysis[];
}

export function QuickStats({ meals }: QuickStatsProps) {
  const { goals } = useNutritionGoals();
  const { user } = useAuth();

  const { data: streakData } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const today = new Date().toDateString();
  const todayMeals = meals.filter(m => new Date(m.analyzed_at).toDateString() === today);
  
  const totals = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
    }),
    { calories: 0, protein: 0 }
  );

  const caloriePercent = Math.min(100, Math.round((totals.calories / goals.calories) * 100));
  const proteinPercent = Math.min(100, Math.round((totals.protein / goals.protein) * 100));
  const currentStreak = streakData?.current_streak || 0;

  const stats = [
    {
      icon: Flame,
      label: "Calories",
      value: `${caloriePercent}%`,
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500",
    },
    {
      icon: Zap,
      label: "Protein",
      value: `${proteinPercent}%`,
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-500",
    },
    {
      icon: Trophy,
      label: "Streak",
      value: `${currentStreak}`,
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconColor: "text-amber-500",
    },
    {
      icon: TrendingUp,
      label: "Logged",
      value: `${todayMeals.length}`,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-4 gap-2"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-border/60 p-3 text-center bg-card"
        >
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60`} />
          
          <div className="relative z-10">
            <div className="w-9 h-9 rounded-xl bg-background/80 mx-auto mb-2 flex items-center justify-center shadow-sm">
              <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
            </div>
            <p className="text-lg font-bold cal-number">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
