import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Apple, CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">(
    token ? "loading" : "pending"
  );
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-email", {
        body: { token },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        setStatus("error");
        setMessage(data.error);
      } else {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
        toast({
          title: "Email verified!",
          description: "You can now sign in to your account.",
        });
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage(error.message || "Failed to verify email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="container py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <Apple className="w-7 h-7 text-foreground" />
          <span className="text-xl font-semibold tracking-tight">NutriMind</span>
        </motion.div>
      </header>

      <main className="flex-1 container flex items-center justify-center py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm text-center"
        >
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 mx-auto text-muted-foreground animate-spin" />
              <h1 className="text-xl font-semibold">Verifying your email...</h1>
              <p className="text-muted-foreground text-sm">Please wait a moment.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-foreground" />
              <h1 className="text-xl font-semibold">Email Verified!</h1>
              <p className="text-muted-foreground text-sm">{message}</p>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full h-12 rounded-xl mt-6"
              >
                Sign in to your account
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 mx-auto text-destructive" />
              <h1 className="text-xl font-semibold">Verification Failed</h1>
              <p className="text-muted-foreground text-sm">{message}</p>
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="w-full h-12 rounded-xl mt-6"
              >
                Back to sign in
              </Button>
            </div>
          )}

          {status === "pending" && (
            <div className="space-y-4">
              <Mail className="w-16 h-16 mx-auto text-muted-foreground" />
              <h1 className="text-xl font-semibold">Check your email</h1>
              <p className="text-muted-foreground text-sm">
                We've sent you a verification link. Please check your inbox and click the link to verify your account.
              </p>
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="w-full h-12 rounded-xl mt-6"
              >
                Back to sign in
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
