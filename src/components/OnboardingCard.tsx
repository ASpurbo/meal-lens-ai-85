import { motion } from "framer-motion";
import { ReactNode } from "react";

interface OnboardingCardProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function OnboardingCard({ 
  selected, 
  onClick, 
  children, 
  icon,
  className = "",
}: OnboardingCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-5 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 ${
        selected
          ? "bg-foreground text-background"
          : "bg-secondary hover:bg-secondary/80"
      } ${className}`}
    >
      {icon && (
        <div className={`flex-shrink-0 ${selected ? "text-background" : "text-foreground"}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </motion.button>
  );
}
