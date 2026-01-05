import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Loader2, Edit3, X, Camera, Barcode, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

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
  onSwitchToCamera?: () => void;
  onSwitchToBarcode?: () => void;
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

export function ManualMealEntry({ open, onOpenChange, onSubmit, onSwitchToCamera, onSwitchToBarcode }: ManualMealEntryProps) {
  const [foodDescription, setFoodDescription] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<EstimatedNutrition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useTranslation();
  
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
        body: { 
          foodDescription: foodDescription.trim()
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setEstimation(data);
      setCalories(String(Math.round(data.calories)));
      setProtein(String(Math.round(data.protein * 10) / 10));
      setCarbs(String(Math.round(data.carbs * 10) / 10));
      setFat(String(Math.round(data.fat * 10) / 10));
    } catch (error: unknown) {
      console.error("Estimation error:", error);
      const message = error instanceof Error ? error.message : "Failed to estimate nutrition";
      toast.error(message);
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

    resetForm();
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

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSwitchCamera = () => {
    resetForm();
    onOpenChange(false);
    onSwitchToCamera?.();
  };

  const handleSwitchBarcode = () => {
    resetForm();
    onOpenChange(false);
    onSwitchToBarcode?.();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 pt-safe border-b border-border">
          <div className="w-10" />
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-foreground text-lg font-semibold">{t.scan.manualEntry}</span>
          </div>
          
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Food Description Input */}
          <div className="space-y-2">
            <Label htmlFor="foodDescription" className="text-foreground text-base">
              Describe your meal
            </Label>
            <Textarea
              id="foodDescription"
              placeholder="e.g., Bowl of oatmeal with protein powder and banana, or Chicken salad with olive oil dressing..."
              value={foodDescription}
              onChange={(e) => setFoodDescription(e.target.value)}
              className="bg-muted border-border min-h-[120px] resize-none text-base"
              disabled={isEstimating}
            />
            <p className="text-sm text-muted-foreground">
              Be specific about ingredients for better estimates
            </p>
          </div>

          {/* Estimate Button */}
          <Button
            onClick={handleEstimate}
            disabled={!foodDescription.trim() || isEstimating}
            className="w-full h-12"
            variant="secondary"
          >
            {isEstimating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Estimating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Estimate Nutrition
              </>
            )}
          </Button>

          {/* Estimation Results */}
          <AnimatePresence mode="wait">
            {estimation && (
              <motion.div
                key="estimation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Detected Foods */}
                <div className="bg-primary/10 rounded-xl p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Detected Foods:</p>
                  <p className="text-sm text-muted-foreground">
                    {estimation.foods.join(", ")}
                  </p>
                </div>

                {/* Nutrition Values - Editable */}
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-foreground">Estimated Values:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    {isEditing ? "Done" : "Adjust"}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Calories</Label>
                      <Input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        className="bg-muted border-border h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Protein (g)</Label>
                      <Input
                        type="number"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        className="bg-muted border-border h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Carbs (g)</Label>
                      <Input
                        type="number"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        className="bg-muted border-border h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Fat (g)</Label>
                      <Input
                        type="number"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        className="bg-muted border-border h-12"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-calories">{calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-protein">{protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-carbs">{carbs}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-fat">{fat}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                )}

                {/* Confidence & Notes */}
                {estimation.notes && (
                  <div className="bg-muted rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        estimation.confidence === "high" 
                          ? "bg-green-500/20 text-green-500"
                          : estimation.confidence === "medium"
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-red-500/20 text-red-500"
                      }`}>
                        {estimation.confidence} confidence
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{estimation.notes}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-3 border-t border-border">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleSwitchCamera}
              className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {t.scan.takePhoto}
            </button>
            <button
              className="px-4 py-2 rounded-full text-sm font-medium bg-foreground text-background flex items-center gap-2"
            >
              <PenLine className="w-4 h-4" />
              {t.scan.manualEntry}
            </button>
            <button
              onClick={handleSwitchBarcode}
              className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Barcode className="w-4 h-4" />
              {t.scan.scanBarcode}
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 pb-safe border-t border-border flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 h-12"
            disabled={!estimation && !calories}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Meal
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}