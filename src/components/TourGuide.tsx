import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Camera, History, BarChart3, Target, Apple, Utensils, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tip?: string;
}

interface TourGuideProps {
  onComplete: () => void;
}

export function TourGuide({ onComplete }: TourGuideProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const steps: TourStep[] = [
    {
      id: "welcome",
      title: t.tour?.welcome || "Welcome to NutriMind",
      subtitle: t.tour?.welcomeDesc || "Your AI-powered nutrition companion. Track meals effortlessly with just a photo.",
      icon: <Apple className="w-8 h-8" />,
      tip: "Swipe left to continue →",
    },
    {
      id: "scan",
      title: t.tour?.scanTitle || "Snap & Track",
      subtitle: t.tour?.scanDesc || "Take a photo of any meal and our AI instantly analyzes calories and macros.",
      icon: <Camera className="w-8 h-8" />,
      tip: "Tap the + button on the home screen to start",
    },
    {
      id: "history",
      title: t.tour?.historyTitle || "Your Food Diary",
      subtitle: t.tour?.historyDesc || "Every meal is saved. View your complete nutrition history anytime.",
      icon: <Utensils className="w-8 h-8" />,
      tip: "Access via Recently Uploaded on your dashboard",
    },
    {
      id: "charts",
      title: t.tour?.chartsTitle || "See Your Progress",
      subtitle: t.tour?.chartsDesc || "Beautiful charts show your nutrition trends over days and weeks.",
      icon: <TrendingUp className="w-8 h-8" />,
      tip: "Tap 'Progress' in the bottom navigation",
    },
    {
      id: "goals",
      title: t.tour?.goalsTitle || "Personalized Goals",
      subtitle: t.tour?.goalsDesc || "Set custom targets based on your body and fitness objectives.",
      icon: <Target className="w-8 h-8" />,
      tip: "Tap 'Goals' to customize your targets",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -50 && currentStep < steps.length - 1) {
      handleNext();
    } else if (info.offset.x > 50 && currentStep > 0) {
      handlePrev();
    }
  };

  const step = steps[currentStep];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col"
    >
      {/* Skip button - minimal */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onComplete}
          className="text-sm font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content area - centered with lots of whitespace */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="flex flex-col items-center text-center max-w-xs cursor-grab active:cursor-grabbing"
          >
            {/* Minimal icon - black circle with white icon */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 300 }}
              className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center text-background mb-8"
            >
              {step.icon}
            </motion.div>

            {/* Title - large, bold, minimal */}
            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold tracking-tight mb-3"
            >
              {step.title}
            </motion.h1>

            {/* Subtitle - muted, clean */}
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-base text-muted-foreground leading-relaxed"
            >
              {step.subtitle}
            </motion.p>

            {/* Tip - contextual hint */}
            {step.tip && (
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-6 px-4 py-2 bg-muted/50 rounded-full"
              >
                <p className="text-xs text-muted-foreground">💡 {step.tip}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section - minimal spacing */}
      <div className="px-10 pb-12 space-y-6">
        {/* Progress indicator - thin line style */}
        <div className="flex justify-center gap-1.5">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{
                width: index === currentStep ? 20 : 6,
                backgroundColor: index === currentStep 
                  ? "hsl(var(--foreground))" 
                  : "hsl(var(--muted-foreground) / 0.25)",
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        {/* Continue button - full width, black, rounded */}
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-full bg-foreground text-background hover:bg-foreground/90"
        >
          {currentStep === steps.length - 1 
            ? (t.tour?.getStarted || "Get Started") 
            : "Continue"
          }
        </Button>
      </div>
    </motion.div>
  );
}
