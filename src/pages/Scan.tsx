import { useState } from "react";
import { motion } from "framer-motion";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionResults } from "@/components/NutritionResults";
import { DailyProgress } from "@/components/DailyProgress";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { FoodScanConfirmation } from "@/components/FoodScanConfirmation";
import { AppLayout } from "@/components/AppLayout";
import { useMealHistory } from "@/hooks/useMealHistory";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { user } = useAuth();
  const { meals, saveMeal, refetch } = useMealHistory();
  const { toast } = useToast();

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
        title: "Analysis complete!",
        description: `Found ${data.foods.length} food item(s)`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
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
      if (user) {
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
      }
      toast({
        title: "Meal added",
        description: "Your meal has been saved",
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
      {pendingResults && (
        <FoodScanConfirmation
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          data={pendingResults}
          onConfirm={handleConfirmAdd}
          onDecline={handleDeclineAdd}
        />
      )}

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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ImageUpload onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />
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
    </AppLayout>
  );
}
