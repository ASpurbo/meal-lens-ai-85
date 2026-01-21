import { motion } from "framer-motion";
import { NutritionGoals } from "@/components/NutritionGoals";
import { GamificationPanel } from "@/components/GamificationPanel";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useTranslation } from "@/hooks/useTranslation";

export default function GoalsPage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <AppLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-2"
          >
            <h1 className="text-2xl font-bold tracking-tight">{t.goals.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t.goals.dailyTarget}</p>
          </motion.div>

          <NutritionGoals />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4 px-1">{t.goals.badges}</h2>
            <GamificationPanel />
          </motion.div>
        </motion.div>
      </AppLayout>
    </PageTransition>
  );
}
