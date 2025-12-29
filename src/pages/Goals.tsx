import { motion } from "framer-motion";
import { NutritionGoals } from "@/components/NutritionGoals";
import { GamificationPanel } from "@/components/GamificationPanel";
import { AppLayout } from "@/components/AppLayout";

export default function GoalsPage() {
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Goals & Achievements</h1>
          <p className="text-muted-foreground text-sm">Customize your nutrition targets</p>
        </div>

        <NutritionGoals />
        
        <div className="pt-4">
          <h2 className="text-xl font-bold mb-4">Your Badges</h2>
          <GamificationPanel />
        </div>
      </motion.div>
    </AppLayout>
  );
}
