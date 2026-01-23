import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AnalyzingBannerProps {
  isVisible: boolean;
}

export function AnalyzingBanner({ isVisible }: AnalyzingBannerProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-0 left-0 right-0 z-[60] bg-foreground text-background px-4 py-3 pt-safe"
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Analyzing your meal...</p>
          <p className="text-xs opacity-80">
            You can switch apps or turn off your phone. We'll notify you when the analysis is done.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
