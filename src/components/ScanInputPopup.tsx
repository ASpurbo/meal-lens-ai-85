import { motion, AnimatePresence } from "framer-motion";
import { Camera, Barcode, PenLine, X, Utensils } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ScanInputPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: "camera" | "barcode" | "manual") => void;
}

export function ScanInputPopup({ open, onOpenChange, onSelectMethod }: ScanInputPopupProps) {
  const { t } = useTranslation();

  const handleSelect = (method: "camera" | "barcode" | "manual") => {
    onSelectMethod(method);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={() => onOpenChange(false)}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-32 right-6 z-50 flex flex-col items-end gap-3"
          >
            {/* Food images decoration */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mr-2"
            >
              <span className="text-3xl">🥗</span>
              <span className="text-3xl">🌭</span>
              <span className="text-3xl">🍟</span>
            </motion.div>

            {/* Menu items */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => handleSelect("camera")}
              className="flex items-center gap-3 px-5 py-3 bg-card rounded-2xl border border-border shadow-lg hover:bg-accent transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span className="font-medium">{t.scan.takePhoto}</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleSelect("barcode")}
              className="flex items-center gap-3 px-5 py-3 bg-card rounded-2xl border border-border shadow-lg hover:bg-accent transition-colors"
            >
              <Barcode className="w-5 h-5" />
              <span className="font-medium">{t.scan.scanBarcode}</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => handleSelect("manual")}
              className="flex items-center gap-3 px-5 py-3 bg-card rounded-2xl border border-border shadow-lg hover:bg-accent transition-colors"
            >
              <PenLine className="w-5 h-5" />
              <span className="font-medium">{t.scan.manualEntry}</span>
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
