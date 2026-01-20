import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Plus, Minus } from "lucide-react";

const WATER_GOAL = 8; // 8 glasses per day

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
      className="bg-card rounded-2xl border border-border p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium">Water</p>
            <p className="text-xs text-muted-foreground">{glasses}/{WATER_GOAL} glasses</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={removeGlass}
            disabled={glasses === 0}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-40 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={addGlass}
            disabled={glasses >= WATER_GOAL}
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      {/* Glass indicators */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: WATER_GOAL }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
              i < glasses 
                ? "bg-blue-500 text-white" 
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Droplets className="w-3 h-3" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}