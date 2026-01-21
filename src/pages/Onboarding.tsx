import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, ArrowRight, ArrowLeft, Loader2, Target, Sparkles, Scale, Activity, Calendar, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/backendClient";
import { differenceInYears, format, parse } from "date-fns";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { DIET_GOALS, getDietGoalModifier } from "@/lib/dietGoals";

interface OnboardingData {
  language: string;
  diet_goal: string;
  birthday: string;
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  gender: string;
  activity_level: string;
  meals_per_day: number;
}

const activityLevels = [
  { value: "sedentary", label: "Sedentary", description: "Little to no exercise", icon: "🪑" },
  { value: "light", label: "Lightly Active", description: "Light exercise 1-3 days/week", icon: "🚶" },
  { value: "moderate", label: "Moderately Active", description: "Moderate exercise 3-5 days/week", icon: "🏃" },
  { value: "active", label: "Very Active", description: "Hard exercise 6-7 days/week", icon: "💪" },
  { value: "athlete", label: "Athlete", description: "Professional/intense training", icon: "🏆" },
];

const mealsPerDayOptions = [
  { value: 2, label: "2 meals", description: "Intermittent fasting or time-restricted" },
  { value: 3, label: "3 meals", description: "Traditional breakfast, lunch, dinner" },
  { value: 4, label: "4 meals", description: "3 meals + 1 snack" },
  { value: 5, label: "5-6 meals", description: "Frequent smaller meals" },
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
    target_weight_kg: 70,
    gender: "male",
    activity_level: "moderate",
    meals_per_day: 3,
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps = [
    { title: "Welcome!", description: "Let's personalize your experience", icon: Sparkles },
    { title: "Language", description: "Choose your preferred language", icon: Globe },
    { title: "Your Goal", description: "What do you want to achieve?", icon: Target },
    { title: "About You", description: "Tell us about yourself", icon: User },
    { title: "Body Stats", description: "Your current measurements", icon: Scale },
    { title: "Target Weight", description: "Where do you want to be?", icon: Target },
    { title: "Activity", description: "How active are you?", icon: Activity },
    { title: "Eating Habits", description: "How often do you eat?", icon: Calendar },
  ];

  const calculatedAge = calculateAge(data.birthday);
  const weightDiff = data.target_weight_kg - data.weight_kg;
  const estimatedWeeks = Math.abs(weightDiff) > 0 ? Math.ceil(Math.abs(weightDiff) / 0.5) : 0;

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
        title: "You're all set! 🎉",
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
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center"
            >
              <Apple className="w-12 h-12 text-foreground" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Welcome to NutriMind</h2>
              <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                We'll ask you a few questions to create your personalized nutrition plan.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-left max-w-[280px] mx-auto">
              {[
                "📊 Personalized calorie & macro goals",
                "📷 AI-powered meal scanning",
                "📈 Track your progress over time",
                "💬 Get advice from AI coach",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-sm py-2 px-3 rounded-xl bg-muted/50"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 1:
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

      case 2:
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

      case 3:
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
                {[
                  { value: "male", label: "Male", emoji: "👨" },
                  { value: "female", label: "Female", emoji: "👩" },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setData({ ...data, gender: g.value })}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      data.gender === g.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{g.emoji}</span>
                    <span className="font-medium">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="height" className="text-sm font-medium">Height</Label>
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  value={data.height_cm}
                  onChange={(e) => setData({ ...data, height_cm: Number(e.target.value) })}
                  className="h-14 rounded-xl text-lg pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">cm</span>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="weight" className="text-sm font-medium">Current Weight</Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={data.weight_kg}
                  onChange={(e) => {
                    const newWeight = Number(e.target.value);
                    setData({ 
                      ...data, 
                      weight_kg: newWeight,
                      target_weight_kg: data.target_weight_kg === data.weight_kg ? newWeight : data.target_weight_kg
                    });
                  }}
                  className="h-14 rounded-xl text-lg pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">kg</span>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="target_weight" className="text-sm font-medium">Target Weight</Label>
              <div className="relative">
                <Input
                  id="target_weight"
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={data.target_weight_kg}
                  onChange={(e) => setData({ ...data, target_weight_kg: Number(e.target.value) })}
                  className="h-14 rounded-xl text-lg pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">kg</span>
              </div>
            </div>
            
            {/* Weight difference indicator */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="font-medium">{data.weight_kg} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Target</span>
                <span className="font-medium">{data.target_weight_kg} kg</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Difference</span>
                  <span className={`font-medium ${weightDiff < 0 ? "text-green-500" : weightDiff > 0 ? "text-blue-500" : ""}`}>
                    {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg
                  </span>
                </div>
                {estimatedWeeks > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Healthy pace: ~{estimatedWeeks} weeks at 0.5kg/week
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-3">
            {activityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setData({ ...data, activity_level: level.value })}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  data.activity_level === level.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                }`}
              >
                <span className="text-2xl">{level.icon}</span>
                <div>
                  <span className="font-medium">{level.label}</span>
                  <p className={`text-sm ${
                    data.activity_level === level.value 
                      ? "text-background/70" 
                      : "text-muted-foreground"
                  }`}>
                    {level.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        );

      case 7:
        return (
          <div className="space-y-3">
            {mealsPerDayOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setData({ ...data, meals_per_day: option.value })}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  data.meals_per_day === option.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                <p className={`text-sm mt-0.5 ${
                  data.meals_per_day === option.value 
                    ? "text-background/70" 
                    : "text-muted-foreground"
                }`}>
                  {option.description}
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
    <PageTransition>
      <div className="h-screen bg-background flex flex-col overflow-hidden pt-safe">
      <header className="flex-shrink-0 py-4 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <Apple className="w-6 h-6 text-foreground" />
          <span className="text-lg font-semibold tracking-tight">NutriMind</span>
        </motion.div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-none px-4 pb-6">
        <div className="max-w-sm mx-auto">
          {/* Progress */}
          <div className="flex justify-center gap-1.5 mb-6 sticky top-0 bg-background py-2 z-10">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-foreground" : i < step ? "w-3 bg-foreground/60" : "w-3 bg-border"
                }`}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Step header */}
            {step > 0 && (
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  {(() => {
                    const Icon = steps[step].icon;
                    return <Icon className="w-6 h-6 text-foreground" />;
                  })()}
                </div>
                <h1 className="text-xl font-semibold tracking-tight">{steps[step].title}</h1>
                <p className="text-muted-foreground text-sm mt-1">{steps[step].description}</p>
              </div>
            )}

            {/* Step content - now scrollable */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation - sticky at bottom */}
            <div className="flex gap-3 mt-8 pb-safe">
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
                  {step === 0 ? "Let's Go" : "Next"}
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
        </div>
      </main>
    </div>
    </PageTransition>
  );
}