import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Target, Star, Award, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserStreak {
  current_streak: number;
  longest_streak: number;
}

interface UserBadge {
  badge_type: string;
  badge_name: string;
  earned_at: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  progress?: number;
  completed?: boolean;
}

const badgeIcons: Record<string, typeof Trophy> = {
  streak_3: Flame,
  streak_7: Flame,
  streak_30: Flame,
  protein_pro: Target,
  calorie_master: Star,
  first_scan: Zap,
  week_warrior: Award,
};

const badgeColors: Record<string, string> = {
  streak_3: "bg-orange-500/10 text-orange-500",
  streak_7: "bg-red-500/10 text-red-500",
  streak_30: "bg-purple-500/10 text-purple-500",
  protein_pro: "bg-protein/10 text-protein",
  calorie_master: "bg-calories/10 text-calories",
  first_scan: "bg-primary/10 text-primary",
  week_warrior: "bg-yellow-500/10 text-yellow-500",
};

export function GamificationPanel() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        // Fetch streak
        const { data: streakData } = await supabase
          .from("user_streaks")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (streakData) setStreak(streakData);

        // Fetch badges
        const { data: badgesData } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", user.id);
        
        if (badgesData) setBadges(badgesData);

        // Fetch active challenges with progress
        const { data: challengesData } = await supabase
          .from("weekly_challenges")
          .select("*")
          .eq("is_active", true);

        if (challengesData) {
          const { data: progressData } = await supabase
            .from("user_challenge_progress")
            .select("*")
            .eq("user_id", user.id);

          const challengesWithProgress = challengesData.map((c) => {
            const progress = progressData?.find((p) => p.challenge_id === c.id);
            return {
              ...c,
              progress: progress?.current_value || 0,
              completed: progress?.completed || false,
            };
          });
          setChallenges(challengesWithProgress);
        }
      } catch (error) {
        console.error("Error fetching gamification data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading achievements...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  {(streak?.current_streak || 0) > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground"
                    >
                      {streak?.current_streak}
                    </motion.div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{streak?.current_streak || 0} Day Streak</h3>
                  <p className="text-muted-foreground">
                    Best: {streak?.longest_streak || 0} days
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Keep it up!</div>
                <div className="text-xs text-muted-foreground">
                  Log meals daily to maintain your streak
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {badges.map((badge, i) => {
                  const Icon = badgeIcons[badge.badge_type] || Award;
                  const colorClass = badgeColors[badge.badge_type] || "bg-primary/10 text-primary";
                  return (
                    <motion.div
                      key={badge.badge_type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${colorClass}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{badge.badge_name}</span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Start logging meals to earn badges! 🏆
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Weekly Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenges.length > 0 ? (
              challenges.map((challenge, i) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    challenge.completed
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {challenge.title}
                        {challenge.completed && (
                          <Badge variant="default" className="text-xs">Completed!</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">
                        {challenge.progress || 0}/{challenge.target_value}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={((challenge.progress || 0) / challenge.target_value) * 100}
                    className="h-2"
                  />
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No active challenges right now
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
