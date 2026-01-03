import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ManualMealEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    foods: string[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence?: string;
    notes?: string;
  }) => void;
}

interface EstimatedNutrition {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: string;
  notes: string;
}

export function ManualMealEntry({ open, onOpenChange, onSubmit }: ManualMealEntryProps) {
  const [foodDescription, setFoodDescription] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<EstimatedNutrition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable values
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const handleEstimate = async () => {
    if (!foodDescription.trim()) {
      toast.error("Please describe your meal");
      return;
    }

    setIsEstimating(true);
    setEstimation(null);

    try {
      const { data, error } = await supabase.functions.invoke("estimate-nutrition", {
        body: { foodDescription: foodDescription.trim() },
      });

      if (error) throw error;

      setEstimation(data);
      setCalories(String(data.calories));
      setProtein(String(data.protein));
      setCarbs(String(data.carbs));
      setFat(String(data.fat));
    } catch (error: any) {
      console.error("Estimation error:", error);
      toast.error(error.message || "Failed to estimate nutrition");
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = () => {
    if (!estimation && !calories) {
      toast.error("Please estimate or enter nutrition values");
      return;
    }

    const foods = estimation?.foods || [foodDescription.trim()];

    onSubmit({
      foods,
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      confidence: estimation?.confidence,
      notes: estimation?.notes,
    });

    // Reset form
    setFoodDescription("");
    setEstimation(null);
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setIsEditing(false);
    onOpenChange(false);
  };

  const resetForm = () => {
    setFoodDescription("");
    setEstimation(null);
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Meal Estimation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Food Description Input */}
          <div className="space-y-2">
            <Label htmlFor="foodDescription" className="text-foreground">
              Describe your meal
            </Label>
            <Textarea
              id="foodDescription"
              placeholder="e.g., Bowl of oatmeal with protein powder and banana, or Chicken salad with olive oil dressing..."
              value={foodDescription}
              onChange={(e) => setFoodDescription(e.target.value)}
              className="bg-background border-border min-h-[80px] resize-none"
              disabled={isEstimating}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about ingredients and portions for better estimates
            </p>
          </div>

          {/* Estimate Button */}
          <Button
            onClick={handleEstimate}
            disabled={!foodDescription.trim() || isEstimating}
            className="w-full"
            variant="secondary"
          >
            {isEstimating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Estimating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Estimate Nutrition
              </>
            )}
          </Button>

          {/* Estimation Results */}
          <AnimatePresence>
            {estimation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {/* Detected Foods */}
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground mb-1">Detected Foods:</p>
                  <p className="text-sm text-muted-foreground">
                    {estimation.foods.join(", ")}
                  </p>
                </div>

                {/* Nutrition Values - Editable */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Estimated Values:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    {isEditing ? "Done" : "Adjust"}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Calories</Label>
                      <Input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        className="bg-background border-border h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Protein (g)</Label>
                      <Input
                        type="number"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        className="bg-background border-border h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Carbs (g)</Label>
                      <Input
                        type="number"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        className="bg-background border-border h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fat (g)</Label>
                      <Input
                        type="number"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        className="bg-background border-border h-9"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-primary">{calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-blue-500">{protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-amber-500">{carbs}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-rose-500">{fat}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                )}

                {/* Confidence & Notes */}
                {estimation.notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        estimation.confidence === "high" 
                          ? "bg-green-500/20 text-green-500"
                          : estimation.confidence === "medium"
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-red-500/20 text-red-500"
                      }`}>
                        {estimation.confidence} confidence
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{estimation.notes}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!estimation && !calories}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
