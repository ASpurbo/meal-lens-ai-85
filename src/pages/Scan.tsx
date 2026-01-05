import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Barcode, PenLine } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionResults } from "@/components/NutritionResults";
import { DailyProgress } from "@/components/DailyProgress";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { FoodScanConfirmation } from "@/components/FoodScanConfirmation";
import { ManualMealEntry } from "@/components/ManualMealEntry";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { TourGuide } from "@/components/TourGuide";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
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
  const [activeMethod, setActiveMethod] = useState<"camera" | "barcode" | "manual">("camera");
  
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

  return (
    <AppLayout>
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

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DailyProgress meals={meals} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SmartRecommendations meals={meals} />
        </motion.div>

        {/* Input Method Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          <Button
            variant={activeMethod === "camera" ? "default" : "outline"}
            onClick={() => setActiveMethod("camera")}
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            {t.scan.takePhoto}
          </Button>
          <Button
            variant={activeMethod === "barcode" ? "default" : "outline"}
            onClick={() => {
              setActiveMethod("barcode");
              setShowBarcodeScanner(true);
            }}
            className="w-full"
          >
            <Barcode className="w-4 h-4 mr-2" />
            {t.scan.scanBarcode}
          </Button>
          <Button
            variant={activeMethod === "manual" ? "default" : "outline"}
            onClick={() => {
              setActiveMethod("manual");
              setShowManualEntry(true);
            }}
            className="w-full"
          >
            <PenLine className="w-4 h-4 mr-2" />
            {t.scan.manualEntry}
          </Button>
        </motion.div>

        {activeMethod === "camera" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ImageUpload onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />
          </motion.div>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NutritionResults data={results} />
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
