import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Plus, Minus } from "lucide-react";

const WATER_GOAL = 8;

export function WaterIntake() {
  const [glasses, setGlasses] = useState(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("water_date");
    const savedGlasses = localStorage.getItem("water_glasses");
    
    if (savedDate === today && savedGlasses) {
      return parseInt(savedGlasses);
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem("water_date", new Date().toDateString());
    localStorage.setItem("water_glasses", String(glasses));
  }, [glasses]);

  const addGlass = () => {
    if (glasses < WATER_GOAL) {
      setGlasses(g => g + 1);
    }
  };

  const removeGlass = () => {
    if (glasses > 0) {
      setGlasses(g => g - 1);
    }
  };

  const percentage = Math.round((glasses / WATER_GOAL) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border/60 p-4 bg-card"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-60" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold">Hydration</p>
              <p className="text-xs text-muted-foreground">{glasses} of {WATER_GOAL} glasses</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={removeGlass}
              disabled={glasses === 0}
              className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all shadow-sm"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addGlass}
              disabled={glasses >= WATER_GOAL}
              className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2.5 bg-muted/80 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        
        {/* Glass indicators */}
        <div className="flex justify-between mt-3 gap-1">
          {Array.from({ length: WATER_GOAL }).map((_, i) => (
            <motion.button
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setGlasses(i + 1)}
              className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${
                i < glasses 
                  ? "bg-blue-500 text-white shadow-sm" 
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
