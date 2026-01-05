import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Camera, Barcode, Pencil, X } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionResults } from "@/components/NutritionResults";
import { FoodScanConfirmation } from "@/components/FoodScanConfirmation";
import { ManualMealEntry } from "@/components/ManualMealEntry";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { TourGuide } from "@/components/TourGuide";
import { useMealHistory } from "@/hooks/useMealHistory";
import { useAuth } from "@/hooks/useAuth";
import { useTour } from "@/hooks/useTour";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

interface NutritionData {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "low" | "medium" | "high";
  notes: string;
}

export default function ScanPage() {
  const [results, setResults] = useState<NutritionData | null>(null);
  const [pendingResults, setPendingResults] = useState<NutritionData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFab, setShowFab] = useState(false);
  
  const { user } = useAuth();
  const { meals, saveMeal, refetch } = useMealHistory();
  const { showTour, completeTour } = useTour();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleImageSelect = async (base64: string) => {
    setIsAnalyzing(true);
    setResults(null);
    setPendingResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-meal", {
        body: { imageBase64: base64 },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setPendingResults(data);
      setShowConfirmation(true);

      toast({
        title: t.scan.mealAnalyzed,
        description: `Found ${data.foods.length} food item(s)`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: t.scan.analysisError,
        description: error instanceof Error ? error.message : t.common.error,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSubmit = (data: { foods: string[]; calories: number; protein: number; carbs: number; fat: number }) => {
    const nutritionData: NutritionData = {
      ...data,
      confidence: "high",
      notes: "Manually entered",
    };
    setPendingResults(nutritionData);
    setShowConfirmation(true);
  };

  const handleBarcodeProduct = (data: NutritionData) => {
    setPendingResults(data);
    setShowConfirmation(true);
  };

  const updateStreak = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingStreak } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (existingStreak) {
      const lastActivity = existingStreak.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = existingStreak.current_streak || 0;
      
      if (lastActivity === today) {
        // Already logged today
      } else if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      
      const longestStreak = Math.max(existingStreak.longest_streak || 0, newStreak);
      
      await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
        })
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("user_streaks")
        .insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
        });
    }
  };

  const handleConfirmAdd = async () => {
    if (!pendingResults) return;

    const saved = await saveMeal({
      foods: pendingResults.foods,
      calories: pendingResults.calories,
      protein: pendingResults.protein,
      carbs: pendingResults.carbs,
      fat: pendingResults.fat,
      confidence: pendingResults.confidence,
      notes: pendingResults.notes,
    });

    if (saved) {
      refetch();
      await updateStreak();
      toast({
        title: t.scan.addedToHistory,
        description: t.scan.mealAnalyzed,
        duration: 3000,
      });
    }

    setResults(pendingResults);
    setPendingResults(null);
    setShowConfirmation(false);
  };

  const handleDeclineAdd = () => {
    setResults(pendingResults);
    setPendingResults(null);
    setShowConfirmation(false);
  };

  const handleFabAction = (action: "camera" | "barcode" | "manual") => {
    setShowFab(false);
    if (action === "barcode") {
      setShowBarcodeScanner(true);
    } else if (action === "manual") {
      setShowManualEntry(true);
    }
    // Camera is handled by ImageUpload component
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {showTour && <TourGuide onComplete={completeTour} />}
      
      {pendingResults && (
        <FoodScanConfirmation
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          data={pendingResults}
          onConfirm={handleConfirmAdd}
          onDecline={handleDeclineAdd}
        />
      )}

      <ManualMealEntry
        open={showManualEntry}
        onOpenChange={setShowManualEntry}
        onSubmit={handleManualSubmit}
      />

      <BarcodeScanner
        open={showBarcodeScanner}
        onOpenChange={setShowBarcodeScanner}
        onProductFound={handleBarcodeProduct}
      />

      <div className="max-w-md mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold">{t.scan.title}</h1>
          <p className="text-muted-foreground mt-1">{t.scan.subtitle}</p>
        </motion.div>

        <ImageUpload
          onImageSelect={handleImageSelect}
          isAnalyzing={isAnalyzing}
        />

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NutritionResults data={results} />
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <AnimatePresence>
          {showFab && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 flex flex-col gap-3 items-end"
            >
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleFabAction("barcode")}
                className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full shadow-lg hover:bg-foreground/90 transition-colors"
              >
                <span className="text-sm font-medium">{t.scan.barcode}</span>
                <Barcode className="w-5 h-5" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => handleFabAction("manual")}
                className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full shadow-lg hover:bg-foreground/90 transition-colors"
              >
                <span className="text-sm font-medium">{t.scan.manualEntry}</span>
                <Pencil className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFab(!showFab)}
          className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:bg-foreground/90 transition-colors"
        >
          <motion.div
            animate={{ rotate: showFab ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Plus className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
