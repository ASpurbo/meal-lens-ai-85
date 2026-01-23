import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Layers, ScanBarcode, CircleDot } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ScanTutorialProps {
  onComplete: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  badge: string;
  tips: { icon: React.ReactNode; text: string }[];
  image: string;
}

export function ScanTutorial({ onComplete }: ScanTutorialProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { t } = useTranslation();

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: "Capture the full meal",
      badge: "Perfect! Scan now.",
      tips: [
        { icon: <Camera className="w-5 h-5" />, text: "Fit the entire meal in the scan lines." },
        { icon: <CircleDot className="w-5 h-5" />, text: "Don't cut off the sides of the meal." },
        { icon: <Camera className="w-5 h-5" />, text: "Make sure the image has good lighting." },
      ],
      image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      title: "Show every ingredient",
      badge: "All ingredients visible.",
      tips: [
        { icon: <Layers className="w-5 h-5" />, text: "Make sure all ingredients are visible." },
        { icon: <Layers className="w-5 h-5" />, text: "Spread out layered food, like burgers." },
        { icon: <Layers className="w-5 h-5" />, text: "Remove covers like foil or lids." },
      ],
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
    },
    {
      id: 3,
      title: "Any doubt? Barcodes...",
      badge: "Barcode & library is best",
      tips: [
        { icon: <ScanBarcode className="w-5 h-5" />, text: "When possible use our barcode/label scanner and food database for the highest accuracy." },
        { icon: <Layers className="w-5 h-5" />, text: "Our scan feature is best when you're at a restaurant and don't know all the ingredient measurements." },
      ],
      image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop",
    },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep - 1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={onComplete}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setCurrentStep(num)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                currentStep === num
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {/* Image container */}
            <div className="bg-muted rounded-3xl p-4 mb-6">
              {/* Success badge */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-foreground">{step.badge}</span>
              </div>

              {/* Food image with scan frame */}
              <div className="relative aspect-square rounded-2xl overflow-hidden max-w-[280px] mx-auto">
                <img
                  src={step.image}
                  alt="Food example"
                  className="w-full h-full object-cover"
                />
                
                {/* Scan frame corners */}
                <div className="absolute inset-8 pointer-events-none">
                  {/* Top left */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-[3px] border-t-[3px] border-white rounded-tl-lg" />
                  {/* Top right */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-[3px] border-t-[3px] border-white rounded-tr-lg" />
                  {/* Bottom left */}
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-[3px] border-b-[3px] border-white rounded-bl-lg" />
                  {/* Bottom right */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-[3px] border-b-[3px] border-white rounded-br-lg" />
                </div>

                {/* Bottom action buttons */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-1.5 text-xs font-medium">
                    <Camera className="w-3.5 h-3.5" />
                    Scan food
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-1.5 text-xs font-medium">
                    <ScanBarcode className="w-3.5 h-3.5" />
                    Barcode
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-6">
              {step.title}
            </h1>

            {/* Tips */}
            <div className="space-y-4">
              {step.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    {tip.icon}
                  </div>
                  <p className="text-muted-foreground text-base pt-2 leading-relaxed">
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      <div className="px-6 pb-8 pt-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-lg"
        >
          {currentStep === 3 ? "Scan now" : "Next"}
        </motion.button>
      </div>
    </motion.div>
  );
}
