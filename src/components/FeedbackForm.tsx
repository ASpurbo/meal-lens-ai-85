import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Loader2, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/backendClient";

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackForm({ open, onOpenChange }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"suggestion" | "bug" | "other">("suggestion");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim() || !user) return;

    setIsSubmitting(true);
    try {
      // Save feedback to database
      const { error } = await supabase
        .from("user_feedback")
        .insert({
          user_id: user.id,
          feedback_type: feedbackType,
          message: feedback.trim(),
        });

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => {
        setFeedback("");
        setFeedbackType("suggestion");
        setIsSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Failed to submit",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-2xl border-t sm:border border-border shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Send Feedback</h2>
              <p className="text-xs text-muted-foreground">Help us improve NutriMind</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
              <p className="text-muted-foreground text-sm">Your feedback helps us improve.</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-5 pb-safe"
            >
              {/* Feedback Type */}
              <div className="flex gap-2">
                {(["suggestion", "bug", "other"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFeedbackType(type)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                      feedbackType === type
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {type === "suggestion" && "💡 Idea"}
                    {type === "bug" && "🐛 Bug"}
                    {type === "other" && "💬 Other"}
                  </button>
                ))}
              </div>

              {/* Feedback Text */}
              <Textarea
                placeholder={
                  feedbackType === "suggestion"
                    ? "What feature would you like to see?"
                    : feedbackType === "bug"
                    ? "Describe the issue you encountered..."
                    : "Share your thoughts with us..."
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px] rounded-xl resize-none"
              />

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!feedback.trim() || isSubmitting}
                className="w-full h-12 rounded-xl"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
