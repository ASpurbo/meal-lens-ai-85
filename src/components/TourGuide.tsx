import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Camera, History, BarChart3, Target, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
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
      icon: <Sparkles className="w-12 h-12" />,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      id: "scan",
      title: t.tour?.scanTitle || "Snap & Track",
      subtitle: t.tour?.scanDesc || "Take a photo of any meal and our AI instantly analyzes calories and macros.",
      icon: <Camera className="w-12 h-12" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "history",
      title: t.tour?.historyTitle || "Your Food Diary",
      subtitle: t.tour?.historyDesc || "Every meal is saved. View your complete nutrition history anytime.",
      icon: <History className="w-12 h-12" />,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "charts",
      title: t.tour?.chartsTitle || "See Your Progress",
      subtitle: t.tour?.chartsDesc || "Beautiful charts show your nutrition trends over days and weeks.",
      icon: <BarChart3 className="w-12 h-12" />,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      id: "goals",
      title: t.tour?.goalsTitle || "Personalized Goals",
      subtitle: t.tour?.goalsDesc || "Set custom targets based on your body and fitness objectives.",
      icon: <Target className="w-12 h-12" />,
      gradient: "from-rose-500 to-pink-500",
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
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
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
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onComplete}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
        >
          Skip
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="flex flex-col items-center text-center max-w-sm cursor-grab active:cursor-grabbing"
          >
            {/* Icon with gradient background */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className={`w-28 h-28 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white mb-10 shadow-lg`}
            >
              {step.icon}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-3xl font-bold tracking-tight mb-4"
            >
              {step.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              {step.subtitle}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-12 space-y-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{
                width: index === currentStep ? 24 : 8,
                backgroundColor: index === currentStep 
                  ? "hsl(var(--foreground))" 
                  : "hsl(var(--muted-foreground) / 0.3)",
              }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Continue button */}
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-full"
        >
          {currentStep === steps.length - 1 ? (
            t.tour?.getStarted || "Get Started"
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
