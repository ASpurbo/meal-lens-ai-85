import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { OnboardingCard } from "@/components/OnboardingCard";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { WheelPicker } from "@/components/WheelPicker";
import { supabase } from "@/integrations/backendClient";
import { differenceInYears, parse } from "date-fns";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";

interface OnboardingData {
  language: string;
  diet_goal: string;
  birthday_month: string;
  birthday_day: number;
  birthday_year: number;
  height_cm: number;
  height_ft: number;
  height_in: number;
  weight_kg: number;
  weight_lb: number;
  gender: string;
  activity_level: string;
  used_other_apps: boolean;
  use_metric: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 10 - i);

const HEIGHT_CM = Array.from({ length: 121 }, (_, i) => i + 120); // 120-240 cm
const HEIGHT_FT = [3, 4, 5, 6, 7, 8];
const HEIGHT_IN = Array.from({ length: 12 }, (_, i) => i);

const WEIGHT_KG = Array.from({ length: 151 }, (_, i) => i + 30); // 30-180 kg
const WEIGHT_LB = Array.from({ length: 351 }, (_, i) => i + 60); // 60-410 lb

const GOALS = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "maintain", label: "Maintain" },
  { value: "gain_weight", label: "Gain weight" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "0-2", description: "Workouts now and then", dots: 1 },
  { value: "moderate", label: "3-5", description: "A few workouts per week", dots: 4 },
  { value: "active", label: "6+", description: "Dedicated athlete", dots: 6 },
];

const calculateBirthday = (month: string, day: number, year: number): string => {
  const monthIndex = MONTHS.indexOf(month) + 1;
  return `${year}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const calculateAge = (birthday: string): number => {
  try {
    const birthDate = parse(birthday, "yyyy-MM-dd", new Date());
    return differenceInYears(new Date(), birthDate);
  } catch {
    return 25;
  }
};

const getDietGoalModifier = (goal: string): number => {
  switch (goal) {
    case "lose_weight": return -500;
    case "gain_weight": return 300;
    default: return 0;
  }
};

const calculateNutritionGoals = (data: OnboardingData) => {
  const birthday = calculateBirthday(data.birthday_month, data.birthday_day, data.birthday_year);
  const age = calculateAge(birthday);
  const weight = data.use_metric ? data.weight_kg : Math.round(data.weight_lb * 0.453592);
  const height = data.use_metric ? data.height_cm : Math.round((data.height_ft * 12 + data.height_in) * 2.54);
  
  let bmr: number;
  if (data.gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.725,
  };

  const tdee = Math.round(bmr * (activityMultipliers[data.activity_level] || 1.55));
  const goalModifier = getDietGoalModifier(data.diet_goal);
  const targetCalories = Math.max(1200, tdee + goalModifier);
  
  let proteinRatio = 0.30;
  let carbsRatio = 0.40;
  let fatRatio = 0.30;

  if (data.diet_goal === "gain_weight") {
    proteinRatio = 0.35;
    carbsRatio = 0.45;
    fatRatio = 0.20;
  } else if (data.diet_goal === "lose_weight") {
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
    diet_goal: "",
    birthday_month: "February",
    birthday_day: 18,
    birthday_year: 1995,
    height_cm: 170,
    height_ft: 5,
    height_in: 7,
    weight_kg: 70,
    weight_lb: 154,
    gender: "",
    activity_level: "",
    used_other_apps: false,
    use_metric: true,
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 7;

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return data.gender !== "";
      case 1: return true; // Birthday always has default
      case 2: return true; // Height/weight always has default
      case 3: return data.diet_goal !== "";
      case 4: return data.activity_level !== "";
      case 5: return true; // Used other apps is boolean
      case 6: return data.language !== "";
      default: return true;
    }
  }, [step, data]);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const birthday = calculateBirthday(data.birthday_month, data.birthday_day, data.birthday_year);
      const goals = calculateNutritionGoals(data);
      const age = calculateAge(birthday);
      const weight = data.use_metric ? data.weight_kg : Math.round(data.weight_lb * 0.453592);
      const height = data.use_metric ? data.height_cm : Math.round((data.height_ft * 12 + data.height_in) * 2.54);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          language: data.language,
          diet_goal: data.diet_goal,
          birthday: birthday,
          age: age,
          height_cm: height,
          weight_kg: weight,
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

  const renderDots = (count: number, selected: boolean) => {
    if (count === 1) {
      return <div className={`w-3 h-3 rounded-full ${selected ? "bg-background" : "bg-foreground"}`} />;
    }
    if (count === 4) {
      return (
        <div className="grid grid-cols-2 gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${selected ? "bg-background" : "bg-foreground"}`} />
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${selected ? "bg-background" : "bg-foreground"}`} />
        ))}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Gender
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Choose your Gender</h1>
              <p className="text-muted-foreground">This will be used to calibrate your custom plan.</p>
            </div>
            
            <div className="space-y-3 mt-12">
              {[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ].map((g) => (
                <OnboardingCard
                  key={g.value}
                  selected={data.gender === g.value}
                  onClick={() => setData({ ...data, gender: g.value })}
                >
                  <span className="font-medium text-lg">{g.label}</span>
                </OnboardingCard>
              ))}
            </div>
          </div>
        );

      case 1: // Birthday
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight">When were you born?</h1>
              <p className="text-muted-foreground">This will be used to calibrate your custom plan.</p>
            </div>
            
            <div className="flex justify-center gap-2 mt-8">
              <div className="flex-1 max-w-[120px]">
                <WheelPicker
                  items={MONTHS}
                  value={data.birthday_month}
                  onChange={(v) => setData({ ...data, birthday_month: v as string })}
                />
              </div>
              <div className="flex-1 max-w-[80px]">
                <WheelPicker
                  items={DAYS}
                  value={data.birthday_day}
                  onChange={(v) => setData({ ...data, birthday_day: v as number })}
                />
              </div>
              <div className="flex-1 max-w-[100px]">
                <WheelPicker
                  items={YEARS}
                  value={data.birthday_year}
                  onChange={(v) => setData({ ...data, birthday_year: v as number })}
                />
              </div>
            </div>
          </div>
        );

      case 2: // Height & Weight
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Height & weight</h1>
              <p className="text-muted-foreground">This will be used to calibrate your custom plan.</p>
            </div>
            
            {/* Unit toggle */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className={`font-semibold transition-colors ${!data.use_metric ? "text-foreground" : "text-muted-foreground"}`}>
                Imperial
              </span>
              <Switch
                checked={data.use_metric}
                onCheckedChange={(checked) => setData({ ...data, use_metric: checked })}
              />
              <span className={`font-semibold transition-colors ${data.use_metric ? "text-foreground" : "text-muted-foreground"}`}>
                Metric
              </span>
            </div>
            
            <div className="flex justify-center gap-8">
              {data.use_metric ? (
                <>
                  <WheelPicker
                    label="Height"
                    items={HEIGHT_CM.map(h => `${h} cm`)}
                    value={`${data.height_cm} cm`}
                    onChange={(v) => setData({ ...data, height_cm: parseInt(String(v)) })}
                  />
                  <WheelPicker
                    label="Weight"
                    items={WEIGHT_KG.map(w => `${w} kg`)}
                    value={`${data.weight_kg} kg`}
                    onChange={(v) => setData({ ...data, weight_kg: parseInt(String(v)) })}
                  />
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <WheelPicker
                      label="Height"
                      items={HEIGHT_FT.map(f => `${f} ft`)}
                      value={`${data.height_ft} ft`}
                      onChange={(v) => setData({ ...data, height_ft: parseInt(String(v)) })}
                    />
                    <WheelPicker
                      items={HEIGHT_IN.map(i => `${i} in`)}
                      value={`${data.height_in} in`}
                      onChange={(v) => setData({ ...data, height_in: parseInt(String(v)) })}
                    />
                  </div>
                  <WheelPicker
                    label="Weight"
                    items={WEIGHT_LB.map(w => `${w} lb`)}
                    value={`${data.weight_lb} lb`}
                    onChange={(v) => setData({ ...data, weight_lb: parseInt(String(v)) })}
                  />
                </>
              )}
            </div>
          </div>
        );

      case 3: // Goal
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight">What is your goal?</h1>
              <p className="text-muted-foreground">This helps us generate a plan for your calorie intake.</p>
            </div>
            
            <div className="space-y-3 mt-12">
              {GOALS.map((goal) => (
                <OnboardingCard
                  key={goal.value}
                  selected={data.diet_goal === goal.value}
                  onClick={() => setData({ ...data, diet_goal: goal.value })}
                >
                  <span className="font-medium text-lg">{goal.label}</span>
                </OnboardingCard>
              ))}
            </div>
          </div>
        );

      case 4: // Activity level
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight">How many workouts do you do per week?</h1>
              <p className="text-muted-foreground">This will be used to calibrate your custom plan.</p>
            </div>
            
            <div className="space-y-3 mt-8">
              {ACTIVITY_LEVELS.map((level) => (
                <OnboardingCard
                  key={level.value}
                  selected={data.activity_level === level.value}
                  onClick={() => setData({ ...data, activity_level: level.value })}
                  icon={
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                      {renderDots(level.dots, data.activity_level === level.value)}
                    </div>
                  }
                >
                  <div>
                    <span className="font-semibold text-lg">{level.label}</span>
                    <p className={`text-sm ${data.activity_level === level.value ? "text-background/70" : "text-muted-foreground"}`}>
                      {level.description}
                    </p>
                  </div>
                </OnboardingCard>
              ))}
            </div>
          </div>
        );

      case 5: // Used other apps
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Have you tried other calorie tracking apps?</h1>
            </div>
            
            <div className="space-y-3 mt-16">
              <OnboardingCard
                selected={data.used_other_apps === false}
                onClick={() => setData({ ...data, used_other_apps: false })}
                icon={
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    data.used_other_apps === false ? "bg-background/20" : "bg-secondary"
                  }`}>
                    <ThumbsDown className="w-5 h-5" />
                  </div>
                }
              >
                <span className="font-medium text-lg">No</span>
              </OnboardingCard>
              
              <OnboardingCard
                selected={data.used_other_apps === true}
                onClick={() => setData({ ...data, used_other_apps: true })}
                icon={
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    data.used_other_apps === true ? "bg-background/20" : "bg-secondary"
                  }`}>
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                }
              >
                <span className="font-medium text-lg">Yes</span>
              </OnboardingCard>
            </div>
          </div>
        );

      case 6: // Language
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Choose your language</h1>
              <p className="text-muted-foreground">Select your preferred language for the app.</p>
            </div>
            
            <div className="space-y-3 max-h-[50vh] overflow-y-auto hide-scrollbar">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <OnboardingCard
                  key={lang.code}
                  selected={data.language === lang.code}
                  onClick={() => setData({ ...data, language: lang.code })}
                  icon={<span className="text-2xl">{lang.flag}</span>}
                >
                  <span className="font-medium text-lg">{lang.label}</span>
                </OnboardingCard>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="h-screen bg-background flex flex-col overflow-hidden pt-safe">
        {/* Header with back button and progress */}
        <header className="flex-shrink-0 px-4 py-4">
          <div className="flex items-center gap-4">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10" />
            )}
            <div className="flex-1">
              <OnboardingProgress current={step} total={totalSteps} />
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overscroll-none px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Continue button */}
        <div className="flex-shrink-0 px-6 pb-safe py-4">
          <Button
            onClick={step < totalSteps - 1 ? () => setStep(step + 1) : handleComplete}
            disabled={!canProceed || loading}
            className={`w-full h-14 rounded-2xl text-lg font-semibold transition-all ${
              canProceed 
                ? "bg-foreground text-background hover:opacity-90" 
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
