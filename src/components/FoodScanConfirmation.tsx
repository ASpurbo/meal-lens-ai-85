import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw } from "lucide-react";

interface NutritionData {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "low" | "medium" | "high";
  notes: string;
}

interface FoodScanConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: NutritionData;
  onConfirm: () => void;
  onDecline: () => void;
}

export function FoodScanConfirmation({
  open,
  onOpenChange,
  data,
  onConfirm,
  onDecline,
}: FoodScanConfirmationProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-background"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 pt-safe">
          <div className="w-10" />
          <span className="text-foreground text-lg font-semibold">Nutrition Info</span>
          <button 
            onClick={() => onOpenChange(false)} 
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Foods list */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {data.foods.map((food, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-sm text-foreground bg-muted px-3 py-1.5 rounded-full"
              >
                {food}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Large Calories Circle */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="8"
                className="stroke-muted"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className="stroke-calories"
                strokeDasharray={2 * Math.PI * 45}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - Math.min(data.calories / 800, 1)) }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground">{data.calories}</span>
              <span className="text-sm text-muted-foreground">kcal</span>
            </div>
          </motion.div>
        </div>

        {/* Macro Circles Row */}
        <div className="flex justify-center gap-6 px-6 mb-6">
          {/* Protein */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                  className="stroke-protein"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - Math.min(data.protein / 50, 1)) }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground">{data.protein}g</span>
              </div>
            </div>
            <span className="mt-2 text-xs font-medium text-muted-foreground">Protein</span>
          </motion.div>

          {/* Carbs */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                  className="stroke-carbs"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - Math.min(data.carbs / 100, 1)) }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground">{data.carbs}g</span>
              </div>
            </div>
            <span className="mt-2 text-xs font-medium text-muted-foreground">Carbs</span>
          </motion.div>

          {/* Fat */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                  className="stroke-fat"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - Math.min(data.fat / 50, 1)) }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground">{data.fat}g</span>
              </div>
            </div>
            <span className="mt-2 text-xs font-medium text-muted-foreground">Fat</span>
          </motion.div>
        </div>

        {/* Confidence indicator */}
        {data.confidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-muted-foreground px-6 mb-4"
          >
            {data.confidence === 'high' && '✓ High confidence'}
            {data.confidence === 'medium' && '○ Medium confidence'}
            {data.confidence === 'low' && '⚠ Low confidence'}
          </motion.div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="px-6 pb-8 pb-safe space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-base"
          >
            <Check className="w-5 h-5" />
            Add to Daily Goal
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            onClick={onDecline}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-border text-foreground font-medium text-sm"
          >
            Just View Info
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
