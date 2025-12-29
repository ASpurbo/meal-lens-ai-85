import { motion } from "framer-motion";
import { Check, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MacroCircle } from "./MacroCircle";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Add to Today's Intake?
          </DialogTitle>
          <DialogDescription>
            We found {data.foods.length} food item(s). Would you like to add this to your daily tracking?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Foods list */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h4 className="text-sm font-medium mb-2">Detected Foods:</h4>
            <ul className="space-y-1">
              {data.foods.map((food, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {food}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Quick nutrition overview */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-calories/10 rounded-lg">
              <div className="text-lg font-bold text-calories">{data.calories}</div>
              <div className="text-xs text-muted-foreground">kcal</div>
            </div>
            <div className="text-center p-2 bg-protein/10 rounded-lg">
              <div className="text-lg font-bold text-protein">{data.protein}g</div>
              <div className="text-xs text-muted-foreground">protein</div>
            </div>
            <div className="text-center p-2 bg-carbs/10 rounded-lg">
              <div className="text-lg font-bold text-carbs">{data.carbs}g</div>
              <div className="text-xs text-muted-foreground">carbs</div>
            </div>
            <div className="text-center p-2 bg-fat/10 rounded-lg">
              <div className="text-lg font-bold text-fat">{data.fat}g</div>
              <div className="text-xs text-muted-foreground">fat</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Just View Info
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Add to Daily Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
