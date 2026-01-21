import { motion } from "framer-motion";
import { MealHistory } from "@/components/MealHistory";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useMealHistory } from "@/hooks/useMealHistory";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

export default function HistoryPage() {
  const { meals, loading, deleteMeal } = useMealHistory();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDeleteMeal = async (id: string) => {
    const success = await deleteMeal(id);
    if (success) {
      toast({
        title: t.history.mealDeleted,
        description: t.history.mealDeleted,
        duration: 3000,
      });
    } else {
      toast({
        title: t.common.error,
        description: t.common.error,
        variant: "destructive",
      });
    }
  };

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
            <h1 className="text-2xl font-bold tracking-tight">{t.history.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t.history.startTracking}</p>
          </motion.div>

          <MealHistory
            meals={meals}
            loading={loading}
            onDelete={handleDeleteMeal}
          />
        </motion.div>
      </AppLayout>
    </PageTransition>
  );
}
