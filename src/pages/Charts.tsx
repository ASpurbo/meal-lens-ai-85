import { motion } from "framer-motion";
import { NutritionCharts } from "@/components/NutritionCharts";
import { AppLayout } from "@/components/AppLayout";
import { useMealHistory } from "@/hooks/useMealHistory";

export default function ChartsPage() {
  const { meals } = useMealHistory();

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Nutrition Charts</h1>
          <p className="text-muted-foreground text-sm">Track your nutrition trends</p>
        </div>

        <NutritionCharts meals={meals} />
      </motion.div>
    </AppLayout>
  );
}
