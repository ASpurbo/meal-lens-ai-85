import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScanViewfinderProps {
  isAnalyzing: boolean;
  preview: string | null;
  onClear: () => void;
}

export function ScanViewfinder({ isAnalyzing, preview, onClear }: ScanViewfinderProps) {
  return (
    <div className="relative w-full aspect-[3/4] max-h-[60vh] rounded-3xl overflow-hidden bg-gradient-to-b from-background/20 to-background/60">
      {/* Corner brackets */}
      <div className="absolute inset-8 pointer-events-none">
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-foreground/70 rounded-tl-lg" />
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-foreground/70 rounded-tr-lg" />
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-foreground/70 rounded-bl-lg" />
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-foreground/70 rounded-br-lg" />
      </div>

      {/* Preview Image */}
      {preview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
        >
          <img
            src={preview}
            alt="Meal preview"
            className="w-full h-full object-cover"
          />
          {!isAnalyzing && (
            <button
              onClick={onClear}
              className="absolute top-4 right-4 p-2 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </motion.div>
      )}

      {/* Analyzing overlay */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-foreground" />
            <span className="text-base font-medium">Analyzing...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
