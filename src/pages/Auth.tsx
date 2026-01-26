import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = "login" | "signup" | "forgot" | "email-form";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as AuthMode) || "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { toast } = useToast();
  const { user, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const urlMode = searchParams.get("mode") as AuthMode;
    if (urlMode && ["login", "signup", "forgot"].includes(urlMode)) {
      setMode(urlMode);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    if (mode !== "forgot") {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Reset failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link.",
          });
          setMode("login");
        }
      } else if (mode === "email-form") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              title: "Email not verified",
              description: "Please check your inbox and verify your email before signing in.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          navigate("/verify");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/landing");
  };

  // Show the modal-style login view
  if (mode === "login") {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Background with app preview effect */}
          <div className="flex-1 bg-muted/30" />
          
          {/* Bottom sheet modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-background rounded-t-3xl shadow-2xl border-t border-border/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
              <div className="w-10" />
              <h1 className="text-xl font-semibold">Sign In</h1>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-8 space-y-4 pb-safe">
              {/* Google Sign In */}
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 rounded-2xl border-2 border-border text-base font-medium gap-3"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>

              {/* Continue with Email */}
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 rounded-2xl border-2 border-border text-base font-medium gap-3"
                onClick={() => setMode("email-form")}
                disabled={loading}
              >
                <Mail className="w-5 h-5" />
                Continue with email
              </Button>

              {/* Terms */}
              <p className="text-center text-sm text-muted-foreground pt-4">
                By continuing you agree to NutriMind's{" "}
                <Link to="/datenschutz" className="underline underline-offset-2 hover:text-foreground">
                  Privacy Policy
                </Link>
                {" "}and{" "}
                <Link to="/impressum" className="underline underline-offset-2 hover:text-foreground">
                  Terms of Service
                </Link>
              </p>

              {/* Switch to signup */}
              <p className="text-center text-sm text-muted-foreground pt-2">
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-foreground font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // Email form view (for login with email)
  if (mode === "email-form") {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <div className="flex-1 bg-muted/30" />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-background rounded-t-3xl shadow-2xl border-t border-border/50"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
              <button
                onClick={() => setMode("login")}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h1 className="text-xl font-semibold">Sign In with Email</h1>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-8 space-y-5 pb-safe">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-border bg-background"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border bg-background"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
              </Button>
            </form>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // Signup and forgot password views (keep existing full-page style)
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 bg-muted/30" />
        
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-background rounded-t-3xl shadow-2xl border-t border-border/50"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
            <button
              onClick={() => setMode("login")}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-xl font-semibold">
              {mode === "signup" ? "Create Account" : "Reset Password"}
            </h1>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-5 pb-safe">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-border bg-background"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border bg-background"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === "signup" ? (
                "Create account"
              ) : (
                "Send reset link"
              )}
            </Button>

            {mode === "signup" && (
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-foreground font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
