import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Apple, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const navigate = useNavigate();

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
          <div className="space-y-4">
            <Mail className="w-16 h-16 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-semibold">Check your email</h1>
            <p className="text-muted-foreground text-sm">
              We've sent you a confirmation link. Please check your inbox and click the link to verify your account.
            </p>
            <p className="text-muted-foreground text-xs">
              Don't see it? Check your spam folder.
            </p>
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              className="w-full h-12 rounded-xl mt-6"
            >
              Back to sign in
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
