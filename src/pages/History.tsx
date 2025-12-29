import { motion } from "framer-motion";
import { MealHistory } from "@/components/MealHistory";
import { AppLayout } from "@/components/AppLayout";
import { useMealHistory } from "@/hooks/useMealHistory";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const { meals, loading, deleteMeal } = useMealHistory();
  const { toast } = useToast();

  const handleDeleteMeal = async (id: string) => {
    const success = await deleteMeal(id);
    if (success) {
      toast({
        title: "Meal deleted",
        description: "Removed from your history",
        duration: 3000,
      });
    } else {
      toast({
        title: "Delete failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Meal History</h1>
          <p className="text-muted-foreground text-sm">All your logged meals</p>
        </div>

        <MealHistory
          meals={meals}
          loading={loading}
          onDelete={handleDeleteMeal}
        />
      </motion.div>
    </AppLayout>
  );
}
