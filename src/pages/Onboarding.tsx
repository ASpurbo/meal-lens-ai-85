import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, ArrowRight, ArrowLeft, Loader2, User, Ruler, Scale, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingData {
  age: number;
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

const calculateNutritionGoals = (data: OnboardingData) => {
  // Mifflin-St Jeor Equation for BMR
  let bmr: number;
  if (data.gender === "male") {
    bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age + 5;
  } else {
    bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age - 161;
  }

  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };

  const tdee = Math.round(bmr * (activityMultipliers[data.activity_level] || 1.55));
  
  // Macro distribution: 30% protein, 40% carbs, 30% fat
  const protein = Math.round((tdee * 0.30) / 4); // 4 cal per gram
  const carbs = Math.round((tdee * 0.40) / 4);   // 4 cal per gram
  const fat = Math.round((tdee * 0.30) / 9);     // 9 cal per gram

  return { calories: tdee, protein, carbs, fat };
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    age: 25,
    height_cm: 170,
    weight_kg: 70,
    gender: "male",
    activity_level: "moderate",
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps = [
    { title: "About You", icon: User },
    { title: "Body Stats", icon: Ruler },
    { title: "Activity Level", icon: Activity },
  ];

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Calculate nutrition goals
      const goals = calculateNutritionGoals(data);

      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          age: data.age,
          height_cm: data.height_cm,
          weight_kg: data.weight_kg,
          gender: data.gender,
          activity_level: data.activity_level,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Save nutrition goals
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

      // Initialize streak
      await supabase
        .from("user_streaks")
        .upsert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
        }, { onConflict: "user_id" });

      toast({
        title: "Welcome to NutriMind!",
        description: `Your daily goal is ${goals.calories} calories. Let's get started!`,
      });

      navigate("/dashboard");
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
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="age">How old are you?</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="120"
                value={data.age}
                onChange={(e) => setData({ ...data, age: Number(e.target.value) })}
                className="text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label>Gender</Label>
              <RadioGroup
                value={data.gender}
                onValueChange={(value) => setData({ ...data, gender: value })}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="male"
                  className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    data.gender === "male"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="male" id="male" className="sr-only" />
                  <span className="font-medium">Male</span>
                </Label>
                <Label
                  htmlFor="female"
                  className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    data.gender === "female"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="female" id="female" className="sr-only" />
                  <span className="font-medium">Female</span>
                </Label>
              </RadioGroup>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="height" className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                min="100"
                max="250"
                value={data.height_cm}
                onChange={(e) => setData({ ...data, height_cm: Number(e.target.value) })}
                className="text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={data.weight_kg}
                onChange={(e) => setData({ ...data, weight_kg: Number(e.target.value) })}
                className="text-lg"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Level
            </Label>
            <RadioGroup
              value={data.activity_level}
              onValueChange={(value) => setData({ ...data, activity_level: value })}
              className="space-y-3"
            >
              {activityLevels.map((level) => (
                <Label
                  key={level.value}
                  htmlFor={level.value}
                  className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    data.activity_level === level.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={level.value} id={level.value} className="sr-only" />
                  <span className="font-medium">{level.label}</span>
                  <span className="text-sm text-muted-foreground">{level.description}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <header className="container py-4">
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
      </header>

      <main className="flex-1 container flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i <= step ? "w-12 bg-primary" : "w-8 bg-muted"
                }`}
              />
            ))}
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                {(() => {
                  const StepIcon = steps[step].icon;
                  return (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <StepIcon className="w-6 h-6 text-primary" />
                    </div>
                  );
                })()}
                <div>
                  <CardTitle>{steps[step].title}</CardTitle>
                  <CardDescription>
                    Step {step + 1} of {steps.length}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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

              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                {step < steps.length - 1 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    className="flex-1"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={loading}
                    className="flex-1"
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
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
