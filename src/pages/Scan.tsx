import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Barcode, PenLine, Plus, ImageIcon, X, Loader2 } from "lucide-react";
import { NutritionResults } from "@/components/NutritionResults";
import { DailyProgress } from "@/components/DailyProgress";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { FoodScanConfirmation } from "@/components/FoodScanConfirmation";
import { ManualMealEntry } from "@/components/ManualMealEntry";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { TourGuide } from "@/components/TourGuide";
import { AppLayout } from "@/components/AppLayout";
import { ScanInputPopup } from "@/components/ScanInputPopup";
import { useMealHistory } from "@/hooks/useMealHistory";
import { useAuth } from "@/hooks/useAuth";
import { useTour } from "@/hooks/useTour";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

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
  const [showInputPopup, setShowInputPopup] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"photo" | "barcode" | "manual">("photo");
  const [preview, setPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { meals, saveMeal, refetch } = useMealHistory();
  const { showTour, completeTour } = useTour();
  const { toast } = useToast();
  const { t } = useTranslation();

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      handleImageAnalysis(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageAnalysis = async (base64: string) => {
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

  const handleCameraCapture = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
          saveToGallery: false,
          correctOrientation: true,
        });

        if (image.base64String) {
          const base64 = `data:image/${image.format};base64,${image.base64String}`;
          setPreview(base64);
          handleImageAnalysis(base64);
        }
      } catch (error) {
        console.log("Camera cancelled or error:", error);
      }
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) processFile(file);
      };
      input.click();
    }
  };

  const handleGallerySelect = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos,
          correctOrientation: true,
        });

        if (image.base64String) {
          const base64 = `data:image/${image.format};base64,${image.base64String}`;
          setPreview(base64);
          handleImageAnalysis(base64);
        }
      } catch (error) {
        console.log("Gallery selection cancelled or error:", error);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMethodSelect = (method: "camera" | "barcode" | "manual") => {
    if (method === "camera") {
      setActiveMethod("photo");
      handleCameraCapture();
    } else if (method === "barcode") {
      setActiveMethod("barcode");
      setShowBarcodeScanner(true);
    } else {
      setActiveMethod("manual");
      setShowManualEntry(true);
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

      <ScanInputPopup
        open={showInputPopup}
        onOpenChange={setShowInputPopup}
        onSelectMethod={handleMethodSelect}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="space-y-6">
        {/* Daily Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DailyProgress meals={meals} />
        </motion.div>

        {/* Smart Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SmartRecommendations meals={meals} />
        </motion.div>

        {/* Camera Viewfinder Area */}
        {activeMethod === "photo" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            <div className="relative w-full aspect-[3/4] max-h-[50vh] rounded-3xl overflow-hidden bg-gradient-to-b from-accent/30 to-accent/10 border border-border">
              {/* Corner brackets */}
              <div className="absolute inset-6 pointer-events-none">
                {/* Top Left */}
                <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-foreground/60 rounded-tl-lg" />
                {/* Top Right */}
                <div className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-foreground/60 rounded-tr-lg" />
                {/* Bottom Left */}
                <div className="absolute bottom-0 left-0 w-10 h-10 border-l-2 border-b-2 border-foreground/60 rounded-bl-lg" />
                {/* Bottom Right */}
                <div className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-foreground/60 rounded-br-lg" />
              </div>

              {/* Preview Image */}
              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={preview}
                      alt="Meal preview"
                      className="w-full h-full object-cover"
                    />
                    {!isAnalyzing && (
                      <button
                        onClick={clearPreview}
                        className="absolute top-4 right-4 p-2 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyzing overlay */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-foreground" />
                    <span className="text-base font-medium">{t.scan.analyzing}</span>
                  </div>
                </motion.div>
              )}

              {/* Bottom controls inside viewfinder */}
              {!preview && (
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
                  {/* Gallery button */}
                  <button
                    onClick={handleGallerySelect}
                    className="w-12 h-12 rounded-full bg-foreground/10 border border-foreground/30 flex items-center justify-center hover:bg-foreground/20 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-foreground/80" />
                  </button>

                  {/* Large capture button */}
                  <button
                    onClick={handleCameraCapture}
                    className="w-16 h-16 rounded-full bg-background border-4 border-foreground/80 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-foreground/10" />
                  </button>

                  {/* Spacer for symmetry */}
                  <div className="w-12 h-12" />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Method Tabs - Cal AI style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2"
        >
          <button
            onClick={() => {
              setActiveMethod("manual");
              setShowManualEntry(true);
            }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeMethod === "manual"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <PenLine className="w-4 h-4" />
              {t.scan.manualEntry}
            </span>
          </button>

          <button
            onClick={() => setActiveMethod("photo")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeMethod === "photo"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {t.scan.takePhoto}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveMethod("barcode");
              setShowBarcodeScanner(true);
            }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeMethod === "barcode"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Barcode className="w-4 h-4" />
              {t.scan.scanBarcode}
            </span>
          </button>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NutritionResults data={results} />
          </motion.div>
        )}
      </div>

      {/* Floating Plus Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        onClick={() => setShowInputPopup(!showInputPopup)}
        className={cn(
          "fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30 transition-all",
          showInputPopup 
            ? "bg-muted-foreground rotate-45" 
            : "bg-foreground"
        )}
      >
        <Plus className={cn(
          "w-6 h-6 transition-transform",
          showInputPopup ? "text-background" : "text-background"
        )} />
      </motion.button>
    </AppLayout>
  );
}
