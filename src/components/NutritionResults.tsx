import { motion } from "framer-motion";
import { MacroCircle } from "./MacroCircle";
import { Utensils, AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionData {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "low" | "medium" | "high";
  notes: string;
}

interface NutritionResultsProps {
  data: NutritionData;
}

const confidenceConfig = {
  low: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Low Confidence",
  },
  medium: {
    icon: Info,
    color: "text-carbs",
    bg: "bg-carbs/10",
    label: "Medium Confidence",
  },
  high: {
    icon: CheckCircle,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "High Confidence",
  },
};

export function NutritionResults({ data }: NutritionResultsProps) {
  const confidence = confidenceConfig[data.confidence] || confidenceConfig.medium;
  const ConfidenceIcon = confidence.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      {/* Identified Foods */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 shadow-card"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Utensils className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Identified Foods</h3>
            <div className={cn("flex items-center gap-1 text-xs", confidence.color)}>
              <ConfidenceIcon className="w-3 h-3" />
              <span>{confidence.label}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.foods.map((food, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-sm font-medium"
            >
              {food}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Macro Circles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-6 shadow-card"
      >
        <h3 className="font-semibold text-foreground text-center mb-6">Nutrition Breakdown</h3>
        <div className="grid grid-cols-4 gap-2">
          <MacroCircle
            label="Calories"
            value={data.calories}
            unit="kcal"
            color="calories"
            delay={0.3}
          />
          <MacroCircle
            label="Protein"
            value={data.protein}
            unit="g"
            color="protein"
            delay={0.4}
          />
          <MacroCircle
            label="Carbs"
            value={data.carbs}
            unit="g"
            color="carbs"
            delay={0.5}
          />
          <MacroCircle
            label="Fat"
            value={data.fat}
            unit="g"
            color="fat"
            delay={0.6}
          />
        </div>
      </motion.div>

      {/* Notes */}
      {data.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={cn("rounded-2xl p-4", confidence.bg)}
        >
          <p className={cn("text-sm leading-relaxed", confidence.color)}>
            {data.notes}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
