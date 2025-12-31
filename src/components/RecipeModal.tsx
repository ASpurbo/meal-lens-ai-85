import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, ChefHat } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

interface RecipeModalProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeModal({ recipe, open, onOpenChange }: RecipeModalProps) {
  const { t } = useTranslation();
  
  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{recipe.name}</DialogTitle>
          <p className="text-muted-foreground">{recipe.description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick stats */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              {recipe.prepTime}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
              <Users className="w-3.5 h-3.5" />
              {recipe.servings} {t.recommendations.servings}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              {t.recommendations.difficulty}: {recipe.difficulty}
            </Badge>
          </div>

          {/* Nutrition info */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-xl bg-calories/10">
              <Flame className="w-5 h-5 mx-auto mb-1 text-calories" />
              <p className="text-lg font-bold text-calories">{recipe.calories}</p>
              <p className="text-xs text-muted-foreground">{t.goals.calories}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-protein/10">
              <p className="text-lg font-bold text-protein">{recipe.protein}g</p>
              <p className="text-xs text-muted-foreground">{t.goals.protein}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-carbs/10">
              <p className="text-lg font-bold text-carbs">{recipe.carbs}g</p>
              <p className="text-xs text-muted-foreground">{t.goals.carbs}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-fat/10">
              <p className="text-lg font-bold text-fat">{recipe.fat}g</p>
              <p className="text-xs text-muted-foreground">{t.goals.fat}</p>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold text-lg mb-3">{t.recommendations.ingredients}</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold text-lg mb-3">{t.recommendations.instructions}</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium text-xs">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
