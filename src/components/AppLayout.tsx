import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Apple, Settings, Camera, History, BarChart3, Target, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

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
        <Loader2 className="w-6 h-6 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header - Enhanced */}
      <header className="flex-shrink-0 bg-background/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/scan" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center group-hover:scale-105 transition-transform">
              <Apple className="w-4 h-4 text-background" />
            </div>
          </Link>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleCoachClick}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isCoachPage 
                  ? "bg-foreground text-background" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <Link to="/settings">
              <button className={cn(
                "p-2.5 rounded-xl transition-all",
                location.pathname === "/settings"
                  ? "bg-foreground text-background"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}>
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        hideMainScroll ? "overflow-hidden" : "overflow-y-auto overscroll-none"
      )}>
        <div className={cn(
          "container",
          hideMainScroll ? "h-full py-4" : "py-6 pb-24"
        )}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Enhanced */}
      <nav className="flex-shrink-0 bg-background/80 backdrop-blur-lg border-t border-border/50">
        <div className="container">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all",
                    isActive 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive && "bg-foreground"
                  )}>
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-background" : ""
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    isActive && "font-semibold"
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