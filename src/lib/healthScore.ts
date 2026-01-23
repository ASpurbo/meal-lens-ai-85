import { MealAnalysis } from "@/hooks/useMealHistory";

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Calculate health score based on nutritional balance and food quality
 * Score is 0-100 where:
 * - 0-40: Poor - Significant nutritional imbalances
 * - 40-60: Fair - Some areas need improvement
 * - 60-80: Good - Balanced nutrition with minor areas to improve
 * - 80-100: Excellent - Well-balanced, nutrient-dense choices
 */
export function calculateHealthScore(
  meals: MealAnalysis[],
  goals: NutritionGoals
): number {
  if (meals.length === 0) return 0;

  const totals = {
    calories: meals.reduce((sum, m) => sum + m.calories, 0),
    protein: meals.reduce((sum, m) => sum + m.protein, 0),
    carbs: meals.reduce((sum, m) => sum + m.carbs, 0),
    fat: meals.reduce((sum, m) => sum + m.fat, 0),
  };

  let score = 0;

  // 1. Calorie Balance (25 points)
  // Optimal: 80-110% of goal
  const calorieRatio = totals.calories / goals.calories;
  if (calorieRatio >= 0.8 && calorieRatio <= 1.1) {
    score += 25;
  } else if (calorieRatio >= 0.6 && calorieRatio <= 1.3) {
    score += 15;
  } else if (calorieRatio >= 0.4 && calorieRatio <= 1.5) {
    score += 8;
  }

  // 2. Protein Intake (25 points)
  // Protein is crucial for health - reward meeting/exceeding goal
  const proteinRatio = totals.protein / goals.protein;
  if (proteinRatio >= 0.9 && proteinRatio <= 1.5) {
    score += 25;
  } else if (proteinRatio >= 0.7 && proteinRatio <= 1.8) {
    score += 18;
  } else if (proteinRatio >= 0.5) {
    score += 10;
  }

  // 3. Macro Balance (25 points)
  // Reward balanced macro distribution
  const totalMacroGrams = totals.protein + totals.carbs + totals.fat;
  if (totalMacroGrams > 0) {
    const proteinPct = (totals.protein / totalMacroGrams) * 100;
    const carbsPct = (totals.carbs / totalMacroGrams) * 100;
    const fatPct = (totals.fat / totalMacroGrams) * 100;

    // Ideal ranges: Protein 20-35%, Carbs 40-55%, Fat 20-35%
    const proteinInRange = proteinPct >= 15 && proteinPct <= 40;
    const carbsInRange = carbsPct >= 35 && carbsPct <= 60;
    const fatInRange = fatPct >= 15 && fatPct <= 40;

    if (proteinInRange) score += 10;
    else if (proteinPct >= 10 && proteinPct <= 45) score += 5;

    if (carbsInRange) score += 8;
    else if (carbsPct >= 25 && carbsPct <= 70) score += 4;

    if (fatInRange) score += 7;
    else if (fatPct >= 10 && fatPct <= 45) score += 3;
  }

  // 4. Variety & Meal Frequency (15 points)
  // Reward eating multiple meals with variety
  const uniqueFoods = new Set(meals.flatMap(m => m.foods)).size;
  
  if (meals.length >= 3) score += 5;
  else if (meals.length >= 2) score += 3;
  
  if (uniqueFoods >= 8) score += 10;
  else if (uniqueFoods >= 5) score += 7;
  else if (uniqueFoods >= 3) score += 4;

  // 5. Food Quality Indicators (10 points)
  // Check for high-confidence identifications (suggests whole foods)
  const highConfidenceMeals = meals.filter(m => m.confidence === "high").length;
  const confidenceRatio = highConfidenceMeals / meals.length;
  
  if (confidenceRatio >= 0.8) score += 10;
  else if (confidenceRatio >= 0.5) score += 6;
  else if (confidenceRatio >= 0.3) score += 3;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Get health score label based on score value
 */
export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Improvement";
}

/**
 * Get color class for health score
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-amber-500";
  if (score >= 40) return "text-orange-500";
  return "text-rose-500";
}
