import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

const quotes = [
  { text: "Every meal is a chance to nourish your body.", author: "Focus on progress" },
  { text: "Small steps lead to big transformations.", author: "Stay consistent" },
  { text: "You don't have to be perfect, just consistent.", author: "Keep going" },
  { text: "Fuel your body, fuel your dreams.", author: "Eat well" },
  { text: "Today's choices shape tomorrow's results.", author: "Choose wisely" },
  { text: "Progress, not perfection.", author: "Be patient" },
  { text: "Your body achieves what your mind believes.", author: "Stay positive" },
  { text: "Healthy eating is a form of self-respect.", author: "Love yourself" },
  { text: "One meal at a time, one day at a time.", author: "Take it slow" },
  { text: "Discipline is choosing what you want most over what you want now.", author: "Stay focused" },
];

export function MotivationalQuote() {
  const [quote, setQuote] = useState(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("quote_date");
    const savedIndex = localStorage.getItem("quote_index");
    
    if (savedDate === today && savedIndex) {
      return quotes[parseInt(savedIndex)];
    }
    
    const newIndex = Math.floor(Math.random() * quotes.length);
    localStorage.setItem("quote_date", today);
    localStorage.setItem("quote_index", String(newIndex));
    return quotes[newIndex];
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const currentIndex = quotes.findIndex(q => q.text === quote.text);
      const newIndex = (currentIndex + 1) % quotes.length;
      setQuote(quotes[newIndex]);
      localStorage.setItem("quote_index", String(newIndex));
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-border p-4 relative overflow-hidden"
    >
      {/* Decorative sparkle */}
      <div className="absolute top-3 right-3">
        <Sparkles className="w-4 h-4 text-primary/40" />
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm font-medium leading-relaxed pr-8">
            "{quote.text}"
          </p>
          <p className="text-xs text-muted-foreground mt-2">— {quote.author}</p>
        </motion.div>
      </AnimatePresence>
      
      <button
        onClick={refreshQuote}
        disabled={isRefreshing}
        className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-background/50 flex items-center justify-center hover:bg-background transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
      </button>
    </motion.div>
  );
}