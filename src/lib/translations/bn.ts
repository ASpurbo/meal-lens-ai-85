import type { TranslationKeys } from "./en";

export const bn: TranslationKeys = {
  // Common
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    done: "Done",
    error: "Error",
    success: "Success",
  },

  // Navigation
  nav: {
    scan: "Scan",
    history: "History",
    charts: "Charts",
    goals: "Goals",
    coach: "Coach",
    settings: "Settings",
  },

  // Auth
  auth: {
    welcomeBack: "Welcome back",
    createAccount: "Create account",
    signInToContinue: "Sign in to continue tracking",
    startJourney: "Start your nutrition journey",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signUp: "Create account",
    noAccount: "Don't have an account? Sign up",
    hasAccount: "Already have an account? Sign in",
    loginFailed: "Login failed",
    invalidCredentials: "Invalid email or password. Please try again.",
    emailNotVerified: "Please check your inbox and verify your email before signing in.",
    signUpFailed: "Sign up failed",
    accountExists: "This email is already registered. Please log in instead.",
  },

  // Onboarding
  onboarding: {
    welcome: "Welcome to NutriMind",
    letsPersonalize: "Let's personalize your experience",
    selectLanguage: "Select your language",
    chooseLanguage: "Choose your preferred language",
    whatsYourGoal: "What's your goal?",
    selectGoal: "Select your primary nutrition goal",
    birthday: "When's your birthday?",
    birthdayHelp: "This helps us calculate your nutritional needs",
    height: "How tall are you?",
    heightUnit: "cm",
    weight: "What's your current weight?",
    weightUnit: "kg",
    gender: "What's your gender?",
    male: "Male",
    female: "Female",
    other: "Other",
    activityLevel: "What's your activity level?",
    sedentary: "Sedentary",
    sedentaryDesc: "Little or no exercise",
    light: "Lightly Active",
    lightDesc: "Light exercise 1-3 days/week",
    moderate: "Moderately Active",
    moderateDesc: "Moderate exercise 3-5 days/week",
    active: "Very Active",
    activeDesc: "Hard exercise 6-7 days/week",
    veryActive: "Extra Active",
    veryActiveDesc: "Very hard exercise & physical job",
    getStarted: "Get Started",
  },

  // Settings
  settings: {
    title: "Settings",
    preferences: "Preferences",
    language: "Language",
    darkMode: "Dark Mode",
    security: "Security",
    changePassword: "Change Password",
    account: "Account",
    signOut: "Sign Out",
    deleteAccount: "Delete Account",
    deleteWarning: "This action cannot be undone. All your data will be permanently deleted.",
    age: "Age",
    heightCm: "Height cm",
    weightKg: "Weight kg",
    removePhoto: "Remove photo",
    passwordUpdated: "Password updated",
    passwordsDontMatch: "Passwords don't match",
    passwordTooShort: "Password must be at least 6 characters",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updatePassword: "Update Password",
    languageUpdated: "Language updated",
    selectLanguage: "Select Language",
    choosePreferredLanguage: "Choose your preferred language",
    version: "Version",
  },

  // Scan
  scan: {
    title: "What did you eat?",
    subtitle: "Snap a photo or enter manually",
    takePhoto: "Take Photo",
    uploadImage: "Upload Image",
    scanBarcode: "Scan Barcode",
    manualEntry: "Manual Entry",
    analyzing: "Analyzing your meal...",
    mealAnalyzed: "Meal analyzed",
    addedToHistory: "Added to your history",
    analysisError: "Could not analyze image",
  },

  // History
  history: {
    title: "Meal History",
    today: "Today",
    yesterday: "Yesterday",
    noMeals: "No meals logged yet",
    startTracking: "Start tracking your meals to see them here",
    calories: "cal",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    delete: "Delete",
    mealDeleted: "Meal deleted",
  },

  // Charts
  charts: {
    title: "Nutrition Charts",
    weekly: "Weekly",
    monthly: "Monthly",
    calories: "Calories",
    macros: "Macros",
    trends: "Trends",
    average: "Average",
    total: "Total",
    noData: "Not enough data",
    trackMore: "Track more meals to see charts",
  },

  // Goals
  goals: {
    title: "Nutrition Goals",
    dailyTarget: "Daily Target",
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    grams: "g",
    save: "Save Goals",
    saved: "Goals saved",
    streak: "Day Streak",
    badges: "Badges",
    challenges: "Challenges",
  },

  // Coach
  coach: {
    title: "AI Coach",
    subtitle: "Your personal nutrition assistant",
    askAnything: "Ask me anything about your diet, macros, or meal planning. I'll personalize advice based on your goals.",
    placeholder: "Ask about nutrition...",
    starterPrompts: {
      calories: "What should my daily calories be?",
      breakfast: "Suggest a high-protein breakfast",
      macros: "How do I hit my macro goals?",
      mealPrep: "Tips for meal prepping",
    },
    error: "Could not send message",
  },

  // Diet Goals
  dietGoals: {
    loseWeight: "Lose Weight",
    loseWeightDesc: "Create a calorie deficit to lose fat",
    maintain: "Maintain Weight",
    maintainDesc: "Stay at your current weight",
    gainMuscle: "Gain Muscle",
    gainMuscleDesc: "Build muscle with a slight surplus",
    bulk: "Bulk",
    bulkDesc: "Maximize muscle gain with higher calories",
    cut: "Cut",
    cutDesc: "Aggressive fat loss while preserving muscle",
    recomp: "Body Recomp",
    recompDesc: "Build muscle and lose fat simultaneously",
  },

  // Meal Periods
  mealPeriods: {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
  },

  // Daily Progress
  progress: {
    todayProgress: "Today's Progress",
    remaining: "remaining",
    over: "over",
    ofGoal: "of goal",
  },

  // Recommendations
  recommendations: {
    title: "Recommendations",
    onTrack: "You're on track today!",
    keepItUp: "Keep up the great work",
    proteinToGo: "protein to go",
    carbsRemaining: "carbs remaining",
    addHealthyFats: "Add healthy fats",
    tryHighProtein: "Try these high-protein recipes",
    healthyCarbOptions: "Healthy carb options for you",
    goodFatSources: "Good fat sources",
    startYourDay: "Start your day right",
    noMealsLogged: "No meals logged — here are some ideas",
    cal: "cal",
    protein: "protein",
    prepTime: "prep time",
    servings: "servings",
    ingredients: "Ingredients",
    instructions: "Instructions",
    difficulty: "Difficulty",
  },
};
