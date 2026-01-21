import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Loader2, Edit3, X, Camera, Barcode, PenLine, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/backendClient";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface NutritionData {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "low" | "medium" | "high";
  notes: string;
}

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
  onConfirmMeal?: (data: NutritionData) => void;
  onDeclineMeal?: (data: NutritionData) => void;
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

type ViewState = "input" | "results";

export function ManualMealEntry({ open, onOpenChange, onSubmit, onConfirmMeal, onDeclineMeal, onSwitchToCamera, onSwitchToBarcode }: ManualMealEntryProps) {
  const [viewState, setViewState] = useState<ViewState>("input");
  const [foodDescription, setFoodDescription] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<EstimatedNutrition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [finalData, setFinalData] = useState<NutritionData | null>(null);
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
    const data: NutritionData = {
      foods,
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      confidence: (estimation?.confidence as "low" | "medium" | "high") || "high",
      notes: estimation?.notes || "Manually entered",
    };

    // If we have direct confirm handlers, show results view like camera/barcode
    if (onConfirmMeal) {
      setFinalData(data);
      setViewState("results");
    } else {
      // Fallback to old behavior
      onSubmit(data);
      resetForm();
      onOpenChange(false);
    }
  };

  const handleConfirm = () => {
    if (finalData && onConfirmMeal) {
      onConfirmMeal(finalData);
    }
    resetForm();
    onOpenChange(false);
  };

  const handleDecline = () => {
    if (finalData && onDeclineMeal) {
      onDeclineMeal(finalData);
    }
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setViewState("input");
    setFoodDescription("");
    setEstimation(null);
    setFinalData(null);
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

  // Results View (similar to barcode/camera results)
  if (viewState === "results" && finalData) {
    return (
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
            onClick={handleClose} 
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Foods list */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {finalData.foods.map((food, i) => (
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
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - Math.min(finalData.calories / 800, 1)) }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground">{finalData.calories}</span>
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
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - Math.min(finalData.protein / 50, 1)) }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground">{finalData.protein}g</span>
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
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - Math.min(finalData.carbs / 100, 1)) }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground">{finalData.carbs}g</span>
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
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - Math.min(finalData.fat / 50, 1)) }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground">{finalData.fat}g</span>
              </div>
            </div>
            <span className="mt-2 text-xs font-medium text-muted-foreground">Fat</span>
          </motion.div>
        </div>

        {/* Confidence indicator */}
        {finalData.confidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-muted-foreground px-6 mb-4"
          >
            {finalData.confidence === 'high' && '✓ High confidence'}
            {finalData.confidence === 'medium' && '○ Medium confidence'}
            {finalData.confidence === 'low' && '⚠ Low confidence'}
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
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-base"
          >
            <Check className="w-5 h-5" />
            Add to Daily Goal
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            onClick={handleDecline}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-border text-foreground font-medium text-sm"
          >
            Just View Info
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Input View
  return (
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
  );
}