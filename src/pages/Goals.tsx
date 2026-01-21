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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.goals.title}</h1>
            <p className="text-muted-foreground text-sm">{t.goals.dailyTarget}</p>
          </div>

          <NutritionGoals />
          
          <div>
            <h2 className="text-lg font-semibold mb-4">{t.goals.badges}</h2>
            <GamificationPanel />
          </div>
        </motion.div>
      </AppLayout>
    </PageTransition>
  );
}
