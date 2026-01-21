import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";

export function NutritionGoals() {
  const { goals, hasCustomGoals, loading, saveGoals } = useNutritionGoals();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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
    { key: "calories", label: "Calories", unit: "kcal", color: "from-orange-500/20 to-red-500/20", dotClass: "macro-dot-calories" },
    { key: "protein", label: "Protein", unit: "g", color: "from-pink-500/20 to-rose-500/20", dotClass: "macro-dot-protein" },
    { key: "carbs", label: "Carbs", unit: "g", color: "from-amber-500/20 to-yellow-500/20", dotClass: "macro-dot-carbs" },
    { key: "fat", label: "Fat", unit: "g", color: "from-blue-500/20 to-cyan-500/20", dotClass: "macro-dot-fat" },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field, index) => (
          <motion.div 
            key={field.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative overflow-hidden bg-card rounded-2xl border border-border/60 p-4"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${field.color} opacity-50`} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${field.dotClass}`} />
                <span className="font-semibold">{field.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={formData[field.key]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                  className="w-24 h-11 text-right font-bold rounded-xl border-border/50 bg-background/80"
                />
                <span className="text-sm text-muted-foreground font-medium w-8">{field.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            type="submit" 
            disabled={isSaving || saved} 
            className="w-full h-14 rounded-2xl mt-4 text-base font-bold"
          >
            {saved ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Saved!
              </>
            ) : isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Goals
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
