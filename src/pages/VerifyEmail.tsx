import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-email", {
        body: { token },
      });

      if (error) throw error;

      if (data.success) {
        setStatus("success");
        setMessage("Your email has been verified! You can now log in.");
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage(error.message || "Failed to verify email. The link may have expired.");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <header className="container py-4">
        <nav className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">NutriMind</span>
          </motion.div>
        </nav>
      </header>

      <main className="flex-1 container flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-3xl shadow-card p-8 border border-border text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Verifying your email...
                </h1>
                <p className="text-muted-foreground">Please wait a moment.</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Email Verified!
                </h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  Go to Login
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Verification Failed
                </h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  Back to Login
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
