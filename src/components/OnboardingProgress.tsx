import { motion } from "framer-motion";

interface OnboardingProgressProps {
  current: number;
  total: number;
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  const progress = ((current + 1) / total) * 100;
  
  return (
    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-foreground rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}
