import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";

export function NutritionGoals() {
  const { goals, hasCustomGoals, loading, saveGoals } = useNutritionGoals();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    calories: goals.calories,
    protein: goals.protein,
    carbs: goals.carbs,
    fat: goals.fat,
  });
  const { toast } = useToast();

  // Update form when goals load
  useState(() => {
    setFormData({
      calories: goals.calories,
      protein: goals.protein,
      carbs: goals.carbs,
      fat: goals.fat,
    });
  });

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
      toast({
        title: "Goals saved!",
        description: "Your daily nutrition goals have been updated.",
      });
    } else {
      toast({
        title: "Failed to save",
        description: "Could not save your goals. Please try again.",
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Daily Goals</CardTitle>
              <CardDescription>
                {hasCustomGoals 
                  ? "Your personalized daily targets" 
                  : "Set your daily nutrition targets"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData(prev => ({ ...prev, calories: Number(e.target.value) }))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  min="0"
                  value={formData.protein}
                  onChange={(e) => setFormData(prev => ({ ...prev, protein: Number(e.target.value) }))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  min="0"
                  value={formData.carbs}
                  onChange={(e) => setFormData(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat" className="text-fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  min="0"
                  value={formData.fat}
                  onChange={(e) => setFormData(prev => ({ ...prev, fat: Number(e.target.value) }))}
                  className="bg-background/50"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Goals
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
