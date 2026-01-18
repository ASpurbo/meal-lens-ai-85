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
        <Loader2 className="w-5 h-5 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header - Cal AI style: minimal, clean */}
      <header className="flex-shrink-0 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/scan" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center">
              <Apple className="w-4 h-4 text-background" />
            </div>
          </Link>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleCoachClick}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isCoachPage 
                  ? "bg-foreground text-background" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <Link to="/settings">
              <button className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                location.pathname === "/settings"
                  ? "bg-foreground text-background"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
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
        hideMainScroll ? "overflow-hidden" : "overflow-y-auto overscroll-none hide-scrollbar"
      )}>
        <div className={cn(
          "px-4",
          hideMainScroll ? "h-full py-4" : "py-4 pb-28"
        )}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Cal AI style: clean pill indicators */}
      <nav className="flex-shrink-0 bg-background border-t border-border pb-safe">
        <div className="px-2">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all min-w-[64px]",
                    isActive 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isActive && "bg-foreground"
                  )}>
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-background" : ""
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium",
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
