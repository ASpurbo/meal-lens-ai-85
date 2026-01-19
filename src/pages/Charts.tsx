import { motion } from "framer-motion";
import { NutritionCharts } from "@/components/NutritionCharts";
import { AppLayout } from "@/components/AppLayout";
import { useMealHistory } from "@/hooks/useMealHistory";

export default function ChartsPage() {
  const { meals } = useMealHistory();

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Cal AI style header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-semibold tracking-tight">Trends</h1>
        </div>

        <NutritionCharts meals={meals} />
      </motion.div>
    </AppLayout>
  );
}
