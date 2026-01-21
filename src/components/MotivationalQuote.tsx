import { useState } from "react";
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
      className="relative overflow-hidden rounded-2xl border border-border/60 p-5 bg-card"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-orange-500/10 opacity-70" />
      
      {/* Decorative elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-4 right-4"
      >
        <Sparkles className="w-5 h-5 text-purple-400/40" />
      </motion.div>
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-base font-medium leading-relaxed pr-10">
              "{quote.text}"
            </p>
            <p className="text-sm text-muted-foreground mt-3 font-medium">— {quote.author}</p>
          </motion.div>
        </AnimatePresence>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={refreshQuote}
          disabled={isRefreshing}
          className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-all shadow-sm border border-border/50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
        </motion.button>
      </div>
    </motion.div>
  );
}
