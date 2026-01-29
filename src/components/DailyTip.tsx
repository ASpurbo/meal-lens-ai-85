import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X, ChevronRight } from "lucide-react";

const NUTRITION_TIPS = [
  {
    title: "Stay Hydrated",
    tip: "Drink a glass of water before each meal. It helps with digestion and can prevent overeating.",
    emoji: "💧",
  },
  {
    title: "Protein First",
    tip: "Start your meal with protein. It keeps you fuller longer and stabilizes blood sugar.",
    emoji: "🥩",
  },
  {
    title: "Colorful Plates",
    tip: "Aim for 3+ colors on your plate. Different colored foods provide different nutrients.",
    emoji: "🌈",
  },
  {
    title: "Mindful Eating",
    tip: "Put your fork down between bites. Eating slowly improves digestion and satisfaction.",
    emoji: "🧘",
  },
  {
    title: "Fiber is Key",
    tip: "Include fiber at every meal. It aids digestion and helps you feel full.",
    emoji: "🥦",
  },
  {
    title: "Plan Ahead",
    tip: "Prep healthy snacks on Sunday. Having good options ready prevents poor choices.",
    emoji: "📅",
  },
  {
    title: "Read Labels",
    tip: "Check serving sizes on packaging. Many products contain multiple servings.",
    emoji: "🏷️",
  },
  {
    title: "Sleep & Nutrition",
    tip: "Poor sleep increases hunger hormones. Aim for 7-9 hours for better food choices.",
    emoji: "😴",
  },
  {
    title: "Healthy Fats",
    tip: "Include healthy fats like avocado, nuts, and olive oil. They help absorb vitamins.",
    emoji: "🥑",
  },
  {
    title: "Progress Not Perfection",
    tip: "One bad meal won't ruin your goals. Focus on consistency over perfection.",
    emoji: "💪",
  },
];

const MOTIVATIONAL_QUOTES = [
  "Every healthy choice is a step toward your goals.",
  "Your body is your most priceless possession. Take care of it.",
  "Small changes lead to remarkable results.",
  "You don't have to be perfect, just consistent.",
  "Fuel your body like you love it.",
  "Progress is progress, no matter how small.",
  "Today's choices shape tomorrow's health.",
  "You're stronger than your cravings.",
];

interface DailyTipProps {
  showMotivation?: boolean;
}

export function DailyTip({ showMotivation = false }: DailyTipProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [dailyTip, setDailyTip] = useState(NUTRITION_TIPS[0]);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  useEffect(() => {
    // Get a consistent tip for the day based on the date
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    
    const tipIndex = dayOfYear % NUTRITION_TIPS.length;
    const quoteIndex = dayOfYear % MOTIVATIONAL_QUOTES.length;
    
    setDailyTip(NUTRITION_TIPS[tipIndex]);
    setQuote(MOTIVATIONAL_QUOTES[quoteIndex]);

    // Check if user dismissed today's tip
    const dismissedDate = localStorage.getItem("nutrimind_tip_dismissed");
    const todayStr = today.toISOString().split("T")[0];
    if (dismissedDate === todayStr) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("nutrimind_tip_dismissed", today);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-2xl" />
        
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <span className="text-lg">{dailyTip.emoji}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Daily Tip
              </span>
            </div>
            <h3 className="font-semibold text-sm mb-1">{dailyTip.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{dailyTip.tip}</p>
          </div>
        </div>

        {/* Motivational quote (optional) */}
        {showMotivation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 pt-3 border-t border-amber-500/20"
          >
            <p className="text-xs text-muted-foreground italic text-center">"{quote}"</p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
