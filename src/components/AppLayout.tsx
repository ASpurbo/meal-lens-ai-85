import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Apple, Settings, Camera, History, BarChart3, Target, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
  hideMainScroll?: boolean;
}

export function AppLayout({ children, hideMainScroll = false }: AppLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading } = useOnboarding();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/scan", icon: Camera, label: t.nav.scan },
    { path: "/history", icon: History, label: t.nav.history },
    { path: "/charts", icon: BarChart3, label: t.nav.charts },
    { path: "/goals", icon: Target, label: t.nav.goals },
  ];

  const isCoachPage = location.pathname === "/coach";

  const handleCoachClick = () => {
    if (isCoachPage) {
      navigate("/scan");
    } else {
      navigate("/coach");
    }
  };

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
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-background/80 backdrop-blur-lg border-b border-border/50 pt-safe sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/scan" className="flex items-center gap-2.5">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center shadow-sm"
            >
              <Apple className="w-5 h-5 text-background" />
            </motion.div>
          </Link>
          
          <div className="flex items-center gap-1">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleCoachClick}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                isCoachPage 
                  ? "bg-foreground text-background shadow-sm" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-5 h-5" />
            </motion.button>
            <Link to="/settings">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  location.pathname === "/settings"
                    ? "bg-foreground text-background shadow-sm"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
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
          "px-4",
          hideMainScroll ? "h-full py-4" : "py-4 pb-28"
        )}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe">
        <div className="px-3">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center gap-1 py-2 px-4 min-w-[64px]"
                >
                  <motion.div 
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                      isActive 
                        ? "bg-foreground shadow-md" 
                        : "hover:bg-muted"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-background" : "text-muted-foreground"
                    )} />
                  </motion.div>
                  <span className={cn(
                    "text-[10px] font-semibold transition-colors",
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
