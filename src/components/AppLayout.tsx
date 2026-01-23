import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Apple, Home, BarChart3, Settings, Loader2, Flame, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/backendClient";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
  hideMainScroll?: boolean;
}

export function AppLayout({ children, hideMainScroll = false }: AppLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user streak
  const { data: streakData } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const navItems = [
    { path: "/scan", icon: Home, label: "Home" },
    { path: "/charts", icon: BarChart3, label: "Progress" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!onboardingLoading && needsOnboarding && user) {
      navigate("/onboarding");
    }
  }, [needsOnboarding, onboardingLoading, user, navigate]);

  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <header className="flex-shrink-0 pt-safe sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
        <div className="px-5 py-4 flex items-center justify-between">
          {/* Logo and Streak */}
          <div className="flex items-center gap-3">
            <Link to="/scan" className="flex items-center gap-2">
              <Apple className="w-6 h-6 text-foreground" />
              <span className="text-xl font-bold tracking-tight">Cal AI</span>
            </Link>
            
            {/* Streak badge */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-semibold text-xs text-orange-600 dark:text-orange-400">
                {streakData?.current_streak || 0}
              </span>
            </motion.div>
          </div>
          
          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {/* AI Coach Button */}
            <Link
              to="/coach"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
            >
              <Sparkles className="w-5 h-5 text-foreground" />
            </Link>
            
            {/* Settings Button */}
            <Link
              to="/settings"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
            >
              <Settings className="w-5 h-5 text-foreground" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        hideMainScroll ? "overflow-hidden" : "overflow-y-auto overscroll-none hide-scrollbar"
      )}>
        <div className={cn(
          "px-5",
          hideMainScroll ? "h-full py-4" : "py-2 pb-28"
        )}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Cal AI Style */}
      <nav className="flex-shrink-0 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe relative">
        <div className="px-6">
          <div className="flex items-center justify-around py-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center gap-1 py-1 px-6"
                >
                  <item.icon className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
