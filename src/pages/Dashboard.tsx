import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, LogOut, History, BarChart3, Camera, Loader2, Target, Trophy, Clock, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionResults } from "@/components/NutritionResults";
import { MealHistory } from "@/components/MealHistory";
import { NutritionCharts } from "@/components/NutritionCharts";
import { NutritionGoals } from "@/components/NutritionGoals";
import { DailyProgress } from "@/components/DailyProgress";
import { FoodScanConfirmation } from "@/components/FoodScanConfirmation";
import { GamificationPanel } from "@/components/GamificationPanel";
import { MealTimeline } from "@/components/MealTimeline";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { MoodTracker } from "@/components/MoodTracker";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useMealHistory } from "@/hooks/useMealHistory";
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

export default function Dashboard() {
  const [results, setResults] = useState<NutritionData | null>(null);
  const [pendingResults, setPendingResults] = useState<NutritionData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("scan");
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { needsOnboarding, loading: onboardingLoading } = useOnboarding();
  const { meals, loading: mealsLoading, saveMeal, deleteMeal, refetch } = useMealHistory();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!onboardingLoading && needsOnboarding && user) {
      navigate("/onboarding");
    }
  }, [needsOnboarding, onboardingLoading, user, navigate]);

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

  const handleDeleteMeal = async (id: string) => {
    const success = await deleteMeal(id);
    if (success) {
      toast({
        title: "Meal deleted",
        description: "Removed from your history",
        duration: 3000,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {pendingResults && (
        <FoodScanConfirmation
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          data={pendingResults}
          onConfirm={handleConfirmAdd}
          onDecline={handleDeclineAdd}
        />
      )}

      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">NutriMind</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Daily Progress - Always visible */}
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

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted/30 p-1 rounded-2xl grid grid-cols-7 gap-1">
            <TabsTrigger 
              value="scan" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Scan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Today</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Charts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="goals" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger 
              value="badges" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mood" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs"
            >
              <Smile className="w-4 h-4" />
              <span className="hidden sm:inline">Mood</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="scan" className="m-0 space-y-4">
              <ImageUpload onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />
              {results && <NutritionResults data={results} />}
            </TabsContent>

            <TabsContent value="timeline" className="m-0">
              <MealTimeline meals={meals} />
            </TabsContent>

            <TabsContent value="history" className="m-0">
              <MealHistory
                meals={meals}
                loading={mealsLoading}
                onDelete={handleDeleteMeal}
              />
            </TabsContent>

            <TabsContent value="charts" className="m-0">
              <NutritionCharts meals={meals} />
            </TabsContent>

            <TabsContent value="goals" className="m-0">
              <NutritionGoals />
            </TabsContent>

            <TabsContent value="badges" className="m-0">
              <GamificationPanel />
            </TabsContent>

            <TabsContent value="mood" className="m-0">
              <MoodTracker meals={meals} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
