import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Target, Star, Award, Zap, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/backendClient";

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
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-4" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Streak Card - Cal AI Style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">
                {streak?.current_streak || 0}
              </span>
              <span className="text-muted-foreground text-sm">days</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-7 h-7 text-orange-500" />
          </div>
        </div>
        
        {streak && streak.longest_streak > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Longest streak: <span className="text-foreground font-medium">{streak.longest_streak} days</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Badges - Cal AI Style */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <p className="text-sm text-muted-foreground mb-4">Achievements</p>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge, index) => {
              const Icon = badgeIcons[badge.badge_type] || Trophy;
              return (
                <motion.div
                  key={badge.badge_type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50"
                >
                  <Icon className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-medium">{badge.badge_name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Challenges - Cal AI Style */}
      {challenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <p className="text-sm text-muted-foreground mb-4">Weekly Challenges</p>
          <div className="space-y-4">
            {challenges.map((challenge, index) => {
              const progressPercent = challenge.target_value 
                ? Math.min(100, ((challenge.progress || 0) / challenge.target_value) * 100)
                : 0;
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {challenge.completed ? (
                        <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                          <Check className="w-3 h-3 text-background" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={`text-sm font-medium ${challenge.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {challenge.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {challenge.progress || 0}/{challenge.target_value}
                    </span>
                  </div>
                  
                  {!challenge.completed && (
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden ml-7">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-foreground rounded-full"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {badges.length === 0 && challenges.length === 0 && !streak?.current_streak && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            Log meals daily to earn badges and build streaks
          </p>
        </motion.div>
      )}
    </div>
  );
}
