import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Target, Star, Award, Zap, Check, Medal } from "lucide-react";
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
        const { data: streakData } = await supabase
          .from("user_streaks")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (streakData) setStreak(streakData);

        const { data: badgesData } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", user.id);
        
        if (badgesData) setBadges(badgesData);

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
          <div key={i} className="bg-card rounded-2xl border border-border/60 p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-4" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-card rounded-2xl border border-border/60 p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-red-500/15 opacity-60" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Current Streak</p>
            <div className="flex items-baseline gap-1.5">
              <motion.span 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-5xl font-extrabold tracking-tighter cal-number"
              >
                {streak?.current_streak || 0}
              </motion.span>
              <span className="text-muted-foreground font-medium">days</span>
            </div>
          </div>
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center"
          >
            <Flame className="w-8 h-8 text-orange-500" />
          </motion.div>
        </div>
        
        {streak && streak.longest_streak > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 mt-4 pt-4 border-t border-border/50"
          >
            <p className="text-sm text-muted-foreground">
              Best streak: <span className="text-foreground font-bold">{streak.longest_streak} days</span>
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Badges */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border/60 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Achievements</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => {
              const Icon = badgeIcons[badge.badge_type] || Trophy;
              return (
                <motion.div
                  key={badge.badge_type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 border border-border/50"
                >
                  <Icon className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-semibold">{badge.badge_name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Challenges */}
      {challenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border/60 p-5"
        >
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">Weekly Challenges</p>
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
                    <div className="flex items-center gap-3">
                      {challenge.completed ? (
                        <div className="w-6 h-6 rounded-lg bg-foreground flex items-center justify-center">
                          <Check className="w-4 h-4 text-background" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg border-2 border-muted-foreground/30" />
                      )}
                      <span className={`font-semibold ${challenge.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {challenge.title}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">
                      {challenge.progress || 0}/{challenge.target_value}
                    </span>
                  </div>
                  
                  {!challenge.completed && (
                    <div className="h-2 bg-muted rounded-full overflow-hidden ml-9">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
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
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center"
          >
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </motion.div>
          <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
            Log meals daily to earn badges and build streaks
          </p>
        </motion.div>
      )}
    </div>
  );
}
