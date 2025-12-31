import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, ArrowRight, ArrowLeft, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears, format, parse } from "date-fns";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { DIET_GOALS, getDietGoalModifier } from "@/lib/dietGoals";

interface OnboardingData {
  language: string;
  diet_goal: string;
  birthday: string;
  height_cm: number;
  weight_kg: number;
  gender: string;
  activity_level: string;
}

const activityLevels = [
  { value: "sedentary", label: "Sedentary", description: "Little to no exercise" },
  { value: "light", label: "Lightly Active", description: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderately Active", description: "Moderate exercise 3-5 days/week" },
  { value: "active", label: "Very Active", description: "Hard exercise 6-7 days/week" },
  { value: "athlete", label: "Athlete", description: "Professional/intense training" },
];

const calculateAge = (birthday: string): number => {
  try {
    const birthDate = parse(birthday, "yyyy-MM-dd", new Date());
    return differenceInYears(new Date(), birthDate);
  } catch {
    return 25;
  }
};

const calculateNutritionGoals = (data: OnboardingData) => {
  const age = calculateAge(data.birthday);
  
  let bmr: number;
  if (data.gender === "male") {
    bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * age + 5;
  } else {
    bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * age - 161;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };

  const tdee = Math.round(bmr * (activityMultipliers[data.activity_level] || 1.55));
  
  // Apply diet goal modifier
  const goalModifier = getDietGoalModifier(data.diet_goal);
  const targetCalories = Math.max(1200, tdee + goalModifier);
  
  // Adjust macros based on goal
  let proteinRatio = 0.30;
  let carbsRatio = 0.40;
  let fatRatio = 0.30;

  if (data.diet_goal === "gain_muscle" || data.diet_goal === "bulk") {
    proteinRatio = 0.35;
    carbsRatio = 0.45;
    fatRatio = 0.20;
  } else if (data.diet_goal === "cut" || data.diet_goal === "lose_weight") {
    proteinRatio = 0.40;
    carbsRatio = 0.30;
    fatRatio = 0.30;
  }

  const protein = Math.round((targetCalories * proteinRatio) / 4);
  const carbs = Math.round((targetCalories * carbsRatio) / 4);
  const fat = Math.round((targetCalories * fatRatio) / 9);

  return { calories: targetCalories, protein, carbs, fat };
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    language: "en",
    diet_goal: "maintain",
    birthday: "2000-01-01",
    height_cm: 170,
    weight_kg: 70,
    gender: "male",
    activity_level: "moderate",
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps = [
    { title: "Language", description: "Choose your preferred language" },
    { title: "Your Goal", description: "What do you want to achieve?" },
    { title: "About You", description: "Tell us about yourself" },
    { title: "Body Stats", description: "Your measurements" },
    { title: "Activity", description: "How active are you?" },
  ];

  const calculatedAge = calculateAge(data.birthday);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const goals = calculateNutritionGoals(data);
      const age = calculateAge(data.birthday);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          language: data.language,
          diet_goal: data.diet_goal,
          birthday: data.birthday,
          age: age,
          height_cm: data.height_cm,
          weight_kg: data.weight_kg,
          gender: data.gender,
          activity_level: data.activity_level,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      const { error: goalsError } = await supabase
        .from("nutrition_goals")
        .upsert({
          user_id: user.id,
          calories: goals.calories,
          protein: goals.protein,
          carbs: goals.carbs,
          fat: goals.fat,
        }, { onConflict: "user_id" });

      if (goalsError) throw goalsError;

      await supabase
        .from("user_streaks")
        .upsert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
        }, { onConflict: "user_id" });

      toast({
        title: "Welcome to NutriMind!",
        description: `Your daily goal is ${goals.calories} calories.`,
      });

      navigate("/scan");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Setup failed",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setData({ ...data, language: lang.code })}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  data.language === lang.code
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        );

      case 1:
        return (
          <div className="space-y-3">
            {DIET_GOALS.map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => setData({ ...data, diet_goal: goal.value })}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  data.diet_goal === goal.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                }`}
              >
                <span className="font-medium">{goal.label}</span>
                <p className={`text-sm mt-0.5 ${
                  data.diet_goal === goal.value 
                    ? "text-background/70" 
                    : "text-muted-foreground"
                }`}>
                  {goal.description}
                </p>
              </button>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="birthday" className="text-sm font-medium">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={data.birthday}
                onChange={(e) => setData({ ...data, birthday: e.target.value })}
                max={format(new Date(), "yyyy-MM-dd")}
                className="h-12 rounded-xl"
              />
              {data.birthday && (
                <p className="text-sm text-muted-foreground">
                  {calculatedAge} years old
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Gender</Label>
              <div className="grid grid-cols-2 gap-3">
                {["male", "female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setData({ ...data, gender: g })}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      data.gender === g
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <span className="font-medium capitalize">{g}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="height" className="text-sm font-medium">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                min="100"
                max="250"
                value={data.height_cm}
                onChange={(e) => setData({ ...data, height_cm: Number(e.target.value) })}
                className="h-12 rounded-xl text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={data.weight_kg}
                onChange={(e) => setData({ ...data, weight_kg: Number(e.target.value) })}
                className="h-12 rounded-xl text-lg"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            {activityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setData({ ...data, activity_level: level.value })}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  data.activity_level === level.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                }`}
              >
                <span className="font-medium">{level.label}</span>
                <p className={`text-sm mt-0.5 ${
                  data.activity_level === level.value 
                    ? "text-background/70" 
                    : "text-muted-foreground"
                }`}>
                  {level.description}
                </p>
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="container py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <Apple className="w-7 h-7 text-foreground" />
          <span className="text-xl font-semibold tracking-tight">NutriMind</span>
        </motion.div>
      </header>

      <main className="flex-1 container flex flex-col justify-center py-8 max-w-sm mx-auto">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i <= step ? "w-8 bg-foreground" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Step header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">{steps[step].title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{steps[step].description}</p>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-h-[50vh] overflow-y-auto"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-10">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 h-12 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1 h-12 rounded-xl"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 h-12 rounded-xl"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
