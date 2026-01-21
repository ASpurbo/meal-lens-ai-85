import { useState, useRef, useEffect } from "react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, User, Sparkles, Brain, Utensils, Target, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { supabase, BACKEND_URL } from "@/integrations/backendClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getDietGoalLabel } from "@/lib/dietGoals";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${BACKEND_URL}/functions/v1/ai-coach`;

const STARTER_PROMPTS = [
  { icon: Target, text: "What should my daily calories be?", color: "from-orange-500 to-amber-500" },
  { icon: Utensils, text: "Suggest a high-protein breakfast", color: "from-pink-500 to-rose-500" },
  { icon: Brain, text: "How do I hit my macro goals?", color: "from-blue-500 to-cyan-500" },
  { icon: Lightbulb, text: "Tips for meal prepping", color: "from-emerald-500 to-teal-500" },
];

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isOffline = useOfflineStatus();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    if (isOffline) {
      toast({
        title: "You're offline",
        description: "AI Coach requires an internet connection",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: "user", content: messageText.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userProfile: profile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith(":") || line === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Chat error",
        description: error instanceof Error ? error.message : "Could not send message",
        variant: "destructive",
      });
      // Remove the empty assistant message if error
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <PageTransition>
      <AppLayout hideMainScroll>
        <div className="flex flex-col h-full">
          {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-none px-1">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full min-h-[60vh]"
              >
                {/* Hero Section */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                  {/* Animated Bot Avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="relative mb-6"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                        <Sparkles className="w-8 h-8 text-primary-foreground" />
                      </div>
                    </div>
                    {/* Decorative rings */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-primary/20"
                    />
                  </motion.div>

                  {/* Welcome Text */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                  >
                    <h1 className="text-2xl font-bold mb-2">{t.coach.title}</h1>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      {profile?.diet_goal
                        ? `Personalized for ${getDietGoalLabel(profile.diet_goal).toLowerCase()}`
                        : t.coach.askAnything}
                    </p>
                  </motion.div>

                  {/* Starter Prompts */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-sm space-y-3"
                  >
                    <p className="text-xs text-muted-foreground text-center mb-4">
                      Try asking...
                    </p>
                    {STARTER_PROMPTS.map((prompt, index) => (
                      <motion.button
                        key={prompt.text}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        onClick={() => sendMessage(prompt.text)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-accent/50 hover:bg-accent border border-border/50 transition-all group"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center flex-shrink-0`}>
                          <prompt.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm text-left flex-1">{prompt.text}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 py-4"
              >
                {messages.map((message, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                        message.role === "user"
                          ? "bg-foreground text-background rounded-br-md"
                          : "bg-accent border border-border/50 rounded-bl-md"
                      }`}
                    >
                      {message.content || (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-muted-foreground">Thinking...</span>
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-background" />
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Input Area */}
        <div className="flex-shrink-0 bg-background border-t border-border/50 p-4 pb-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.coach.placeholder}
              className="flex-1 h-12 rounded-xl bg-accent/50 border-border/50 focus:border-primary/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 rounded-xl bg-foreground hover:bg-foreground/90"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
      </AppLayout>
    </PageTransition>
  );
}
