import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Camera, History, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: "top" | "bottom" | "center";
}

interface TourGuideProps {
  onComplete: () => void;
}

export function TourGuide({ onComplete }: TourGuideProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      id: "welcome",
      title: t.tour?.welcome || "Welcome to NutriMind!",
      description: t.tour?.welcomeDesc || "Let's take a quick tour to help you get started with tracking your nutrition.",
      icon: <Sparkles className="w-8 h-8" />,
      position: "center",
    },
    {
      id: "scan",
      title: t.tour?.scanTitle || "Scan Your Meals",
      description: t.tour?.scanDesc || "Take a photo of your food, scan a barcode, or enter meals manually. Our AI will analyze the nutrition instantly.",
      icon: <Camera className="w-8 h-8" />,
      position: "bottom",
    },
    {
      id: "history",
      title: t.tour?.historyTitle || "Track Your History",
      description: t.tour?.historyDesc || "View all your logged meals and see your daily nutrition breakdown over time.",
      icon: <History className="w-8 h-8" />,
      position: "bottom",
    },
    {
      id: "charts",
      title: t.tour?.chartsTitle || "Visualize Progress",
      description: t.tour?.chartsDesc || "See your nutrition trends with beautiful charts showing weekly and monthly progress.",
      icon: <BarChart3 className="w-8 h-8" />,
      position: "bottom",
    },
    {
      id: "goals",
      title: t.tour?.goalsTitle || "Set Your Goals",
      description: t.tour?.goalsDesc || "Customize your daily calorie and macro targets based on your personal fitness goals.",
      icon: <Target className="w-8 h-8" />,
      position: "bottom",
    },
    {
      id: "coach",
      title: t.tour?.coachTitle || "AI Nutrition Coach",
      description: t.tour?.coachDesc || "Tap the sparkle icon in the header anytime to chat with your personal AI coach for nutrition advice.",
      icon: <Sparkles className="w-8 h-8" />,
      position: "top",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
      >
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-lg"
        >
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step indicator */}
          <div className="flex justify-center gap-1.5 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                    ? "w-1.5 bg-primary/50"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {step.icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t.common?.back || "Back"}
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === steps.length - 1 ? (
                t.tour?.getStarted || "Get Started"
              ) : (
                <>
                  {t.common?.next || "Next"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
