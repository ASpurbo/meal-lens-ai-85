import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, LogOut, History, BarChart3, Camera, Loader2, Target, Trophy, Clock, Lightbulb, Smile, Users } from "lucide-react";
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
import { CommunityFeed } from "@/components/CommunityFeed";
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
  const [activeTab, setActiveTab] = useState("analyze");
  
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

      // Show confirmation dialog instead of auto-saving
      setPendingResults(data);
      setShowConfirmation(true);

      toast({
        title: "Analysis complete!",
        description: `Found ${data.foods.length} food item(s)`,
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
      // Update streak
      if (user) {
        await supabase.from("user_streaks").upsert({
          user_id: user.id,
          last_activity_date: new Date().toISOString().split('T')[0],
        }, { onConflict: "user_id" });
      }
      toast({
        title: "Added to daily goal!",
        description: "Your meal has been saved to your history.",
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
    toast({
      title: "View only",
      description: "Meal info shown but not added to your daily intake.",
    });
  };

  const handleDeleteMeal = async (id: string) => {
    const success = await deleteMeal(id);
    if (success) {
      toast({
        title: "Meal deleted",
        description: "The meal has been removed from your history",
      });
    } else {
      toast({
        title: "Delete failed",
        description: "Could not delete the meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Confirmation Dialog */}
      {pendingResults && (
        <FoodScanConfirmation
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          data={pendingResults}
          onConfirm={handleConfirmAdd}
          onDecline={handleDeclineAdd}
        />
      )}

      {/* Header */}
      <header className="container py-4">
        <nav className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">NutriMind</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-muted-foreground hidden md:block">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">Track your meals and nutrition trends</p>
        </motion.div>

        {/* Daily Progress Card */}
        <div className="mb-6">
          <DailyProgress meals={meals} />
        </div>

        {/* Smart Recommendations */}
        <div className="mb-6">
          <SmartRecommendations meals={meals} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-8 bg-muted/50">
            <TabsTrigger value="analyze" className="flex items-center gap-1">
              <Camera className="w-4 h-4" />
              <span className="hidden lg:inline">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="hidden lg:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="w-4 h-4" />
              <span className="hidden lg:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span className="hidden lg:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span className="hidden lg:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-1">
              <Smile className="w-4 h-4" />
              <span className="hidden lg:inline">Mood</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Feed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <ImageUpload onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />
            </motion.div>
            
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <NutritionResults data={results} />
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <MealTimeline meals={meals} />
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <MealHistory
                meals={meals}
                loading={mealsLoading}
                onDelete={handleDeleteMeal}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="charts">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <NutritionCharts meals={meals} />
            </motion.div>
          </TabsContent>

          <TabsContent value="goals">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <NutritionGoals />
            </motion.div>
          </TabsContent>

          <TabsContent value="achievements">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <GamificationPanel />
            </motion.div>
          </TabsContent>

          <TabsContent value="mood">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <MoodTracker meals={meals} />
            </motion.div>
          </TabsContent>

          <TabsContent value="community">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <CommunityFeed />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
