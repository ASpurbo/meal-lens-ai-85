import { motion } from "framer-motion";
import { Flame, Trophy, TrendingUp, Zap } from "lucide-react";
import { MealAnalysis } from "@/hooks/useMealHistory";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/backendClient";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

interface QuickStatsProps {
  meals: MealAnalysis[];
}

export function QuickStats({ meals }: QuickStatsProps) {
  const { goals } = useNutritionGoals();
  const { user } = useAuth();
  const { t } = useTranslation();

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
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Zap,
      label: "Protein",
      value: `${proteinPercent}%`,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: Trophy,
      label: "Streak",
      value: `${currentStreak}`,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: TrendingUp,
      label: "Logged",
      value: `${todayMeals.length}`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bg-card rounded-xl border border-border p-3 text-center"
        >
          <div className={`w-8 h-8 rounded-full ${stat.bgColor} mx-auto mb-2 flex items-center justify-center`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <p className="text-lg font-bold">{stat.value}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}