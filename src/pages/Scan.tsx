import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Camera } from "lucide-react";
import { NutritionResults } from "@/components/NutritionResults";
import { DailyProgress } from "@/components/DailyProgress";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { FoodScanConfirmation } from "@/components/FoodScanConfirmation";
import { ManualMealEntry } from "@/components/ManualMealEntry";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { CameraInterface } from "@/components/CameraInterface";
import { TourGuide } from "@/components/TourGuide";
import { WeeklyCalendarStrip } from "@/components/WeeklyCalendarStrip";
import { AppLayout } from "@/components/AppLayout";
import { QuickStats } from "@/components/QuickStats";
import { MotivationalQuote } from "@/components/MotivationalQuote";
import { WaterIntake } from "@/components/WaterIntake";
import { useMealHistory } from "@/hooks/useMealHistory";
import { useAuth } from "@/hooks/useAuth";
import { useTour } from "@/hooks/useTour";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { supabase } from "@/integrations/backendClient";

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
  const [showCameraInterface, setShowCameraInterface] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { user } = useAuth();
  const { meals, saveMeal, refetch } = useMealHistory();
  const { showTour, completeTour } = useTour();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isOffline = useOfflineStatus();

  // Show FAB after a delay (simulating splash screen completion)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFab(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleImageSelect = async (base64: string): Promise<NutritionData | null> => {
    if (isOffline) {
      toast({
        title: "You're offline",
        description: "Photo analysis requires an internet connection",
        variant: "destructive",
      });
      return null;
    }

    setIsAnalyzing(true);
    setResults(null);
    setPendingResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-meal", {
        body: { imageBase64: base64 },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      toast({
        title: t.scan.mealAnalyzed,
        description: `Found ${data.foods.length} food item(s)`,
        duration: 3000,
      });

      return data as NutritionData;
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: t.scan.analysisError,
        description: error instanceof Error ? error.message : t.common.error,
        variant: "destructive",
      });
      return null;
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

  const handleConfirmAdd = async (data?: NutritionData) => {
    const mealData = data || pendingResults;
    if (!mealData) return;

    const saved = await saveMeal({
      foods: mealData.foods,
      calories: mealData.calories,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fat: mealData.fat,
      confidence: mealData.confidence,
      notes: mealData.notes,
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

    setResults(mealData);
    setPendingResults(null);
    setShowConfirmation(false);
  };

  const handleDeclineAdd = (data?: NutritionData) => {
    const mealData = data || pendingResults;
    setResults(mealData || null);
    setPendingResults(null);
    setShowConfirmation(false);
  };

  // Handlers for switching modes from ManualMealEntry or BarcodeScanner
  const handleSwitchToCamera = () => {
    setShowManualEntry(false);
    setShowBarcodeScanner(false);
    // Small delay to allow previous modal to unmount
    setTimeout(() => setShowCameraInterface(true), 50);
  };

  const handleSwitchToBarcode = () => {
    setShowManualEntry(false);
    setShowCameraInterface(false);
    // Small delay to allow previous modal to unmount
    setTimeout(() => setShowBarcodeScanner(true), 50);
  };

  const handleSwitchToManual = () => {
    setShowCameraInterface(false);
    setShowBarcodeScanner(false);
    // Small delay to allow previous modal to unmount
    setTimeout(() => setShowManualEntry(true), 50);
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
        onSwitchToCamera={handleSwitchToCamera}
        onSwitchToBarcode={handleSwitchToBarcode}
      />

      <BarcodeScanner
        open={showBarcodeScanner}
        onOpenChange={setShowBarcodeScanner}
        onProductFound={handleBarcodeProduct}
        onSwitchToCamera={handleSwitchToCamera}
        onSwitchToManual={handleSwitchToManual}
      />

      <CameraInterface
        open={showCameraInterface}
        onClose={() => setShowCameraInterface(false)}
        onImageCapture={handleImageSelect}
        onBarcodeSelect={() => setShowBarcodeScanner(true)}
        onManualSelect={() => setShowManualEntry(true)}
        onConfirmMeal={handleConfirmAdd}
        onDeclineMeal={handleDeclineAdd}
      />

      <div className="space-y-4 pb-24">
        {/* Weekly Calendar Strip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WeeklyCalendarStrip 
            meals={meals} 
            onDateSelect={(date) => setSelectedDate(date)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DailyProgress meals={meals} selectedDate={selectedDate} />
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <QuickStats meals={meals} />
        </motion.div>

        {/* Water Intake Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WaterIntake />
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <MotivationalQuote />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SmartRecommendations meals={meals} />
        </motion.div>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NutritionResults data={results} />
          </motion.div>
        )}
      </div>

      {/* Floating Action Button with subtle animation */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setShowCameraInterface(true)}
            className="fixed bottom-24 right-6 z-50 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulse ring animation */}
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Camera className="w-7 h-7 relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
