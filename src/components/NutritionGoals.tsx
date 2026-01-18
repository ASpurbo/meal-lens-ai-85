import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";

export function NutritionGoals() {
  const { goals, hasCustomGoals, loading, saveGoals } = useNutritionGoals();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(goals);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(goals);
  }, [goals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await saveGoals({
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fat: Number(formData.fat),
    });
    if (success) {
      toast({ title: "Goals saved!", description: "Your targets have been updated." });
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const fields = [
    { key: "calories", label: "Calories", unit: "kcal" },
    { key: "protein", label: "Protein", unit: "g" },
    { key: "carbs", label: "Carbs", unit: "g" },
    { key: "fat", label: "Fat", unit: "g" },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{field.label}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={formData[field.key]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                  className="w-24 h-10 text-right rounded-xl border-border bg-muted/50"
                />
                <span className="text-sm text-muted-foreground w-8">{field.unit}</span>
              </div>
            </div>
          </div>
        ))}
        
        <Button type="submit" disabled={isSaving} className="w-full h-12 rounded-full mt-6">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Goals"}
        </Button>
      </form>
    </motion.div>
  );
}
