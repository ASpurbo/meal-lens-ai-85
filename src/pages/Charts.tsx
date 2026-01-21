import { motion } from "framer-motion";
import { NutritionCharts } from "@/components/NutritionCharts";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useMealHistory } from "@/hooks/useMealHistory";

export default function ChartsPage() {
  const { meals } = useMealHistory();

  return (
    <PageTransition>
      <AppLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-2"
          >
            <h1 className="text-2xl font-bold tracking-tight">Trends</h1>
            <p className="text-muted-foreground text-sm mt-1">Your weekly nutrition overview</p>
          </motion.div>

          <NutritionCharts meals={meals} />
        </motion.div>
      </AppLayout>
    </PageTransition>
  );
}
