export const DIET_GOALS = [
  { 
    value: "lose_weight", 
    label: "Lose Weight", 
    description: "Reduce body fat with a calorie deficit",
    calorieModifier: -500,
  },
  { 
    value: "maintain", 
    label: "Stay Healthy", 
    description: "Maintain your current weight and health",
    calorieModifier: 0,
  },
  { 
    value: "gain_muscle", 
    label: "Gain Muscle", 
    description: "Build lean muscle with a slight surplus",
    calorieModifier: 300,
  },
  { 
    value: "bulk", 
    label: "Bulk Up", 
    description: "Maximum muscle gain with calorie surplus",
    calorieModifier: 500,
  },
  { 
    value: "cut", 
    label: "Cut", 
    description: "Aggressive fat loss while preserving muscle",
    calorieModifier: -750,
  },
  { 
    value: "recomp", 
    label: "Body Recomposition", 
    description: "Lose fat and build muscle simultaneously",
    calorieModifier: -200,
  },
] as const;

export type DietGoalValue = typeof DIET_GOALS[number]["value"];

export const getDietGoalLabel = (value: string) => {
  return DIET_GOALS.find((g) => g.value === value)?.label || "Stay Healthy";
};

export const getDietGoalModifier = (value: string) => {
  return DIET_GOALS.find((g) => g.value === value)?.calorieModifier || 0;
};
