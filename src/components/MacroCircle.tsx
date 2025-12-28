import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MacroCircleProps {
  label: string;
  value: number;
  unit: string;
  color: "protein" | "carbs" | "fat" | "calories";
  delay?: number;
}

const colorClasses = {
  protein: {
    bg: "bg-protein/10",
    text: "text-protein",
    stroke: "stroke-protein",
  },
  carbs: {
    bg: "bg-carbs/10",
    text: "text-carbs",
    stroke: "stroke-carbs",
  },
  fat: {
    bg: "bg-fat/10",
    text: "text-fat",
    stroke: "stroke-fat",
  },
  calories: {
    bg: "bg-calories/10",
    text: "text-calories",
    stroke: "stroke-calories",
  },
};

export function MacroCircle({ label, value, unit, color, delay = 0 }: MacroCircleProps) {
  const classes = colorClasses[color];
  
  // Calculate a percentage for the circle animation (max out at 100%)
  const maxValues = { protein: 100, carbs: 200, fat: 80, calories: 800 };
  const percentage = Math.min((value / maxValues[color]) * 100, 100);
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center"
    >
      <div className={cn("relative w-24 h-24 rounded-full flex items-center justify-center", classes.bg)}>
        {/* Background circle */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            strokeWidth="6"
            className="stroke-border"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className={classes.stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          />
        </svg>
        
        {/* Value display */}
        <div className="relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.5 }}
            className={cn("text-xl font-bold", classes.text)}
          >
            {value}
          </motion.span>
          <span className={cn("text-xs block", classes.text)}>{unit}</span>
        </div>
      </div>
      
      <span className="mt-2 text-sm font-medium text-foreground">{label}</span>
    </motion.div>
  );
}
