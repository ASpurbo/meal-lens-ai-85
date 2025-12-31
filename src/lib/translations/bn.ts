import type { TranslationKeys } from "./en";

export const bn: TranslationKeys = {
  // Common
  common: {
    loading: "লোড হচ্ছে...",
    save: "সংরক্ষণ",
    cancel: "বাতিল",
    delete: "মুছুন",
    edit: "সম্পাদনা",
    back: "পিছনে",
    next: "পরবর্তী",
    done: "সম্পন্ন",
    error: "ত্রুটি",
    success: "সফল",
  },

  // Navigation
  nav: {
    scan: "স্ক্যান",
    history: "ইতিহাস",
    charts: "চার্ট",
    goals: "লক্ষ্য",
    coach: "কোচ",
    settings: "সেটিংস",
  },

  // Auth
  auth: {
    welcomeBack: "স্বাগতম",
    createAccount: "অ্যাকাউন্ট তৈরি করুন",
    signInToContinue: "ট্র্যাকিং চালিয়ে যেতে সাইন ইন করুন",
    startJourney: "আপনার পুষ্টি যাত্রা শুরু করুন",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    signIn: "সাইন ইন",
    signUp: "অ্যাকাউন্ট তৈরি করুন",
    noAccount: "অ্যাকাউন্ট নেই? সাইন আপ করুন",
    hasAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন",
    loginFailed: "লগইন ব্যর্থ হয়েছে",
    invalidCredentials: "অবৈধ ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।",
    emailNotVerified: "সাইন ইন করার আগে অনুগ্রহ করে আপনার ইনবক্স চেক করুন এবং ইমেইল যাচাই করুন।",
    signUpFailed: "সাইন আপ ব্যর্থ হয়েছে",
    accountExists: "এই ইমেইল ইতিমধ্যে নিবন্ধিত। অনুগ্রহ করে লগ ইন করুন।",
  },

  // Onboarding
  onboarding: {
    welcome: "NutriMind এ স্বাগতম",
    letsPersonalize: "আপনার অভিজ্ঞতা ব্যক্তিগতকৃত করি",
    selectLanguage: "আপনার ভাষা নির্বাচন করুন",
    chooseLanguage: "আপনার পছন্দের ভাষা বেছে নিন",
    whatsYourGoal: "আপনার লক্ষ্য কী?",
    selectGoal: "আপনার প্রাথমিক পুষ্টি লক্ষ্য নির্বাচন করুন",
    birthday: "আপনার জন্মদিন কবে?",
    birthdayHelp: "এটি আপনার পুষ্টি চাহিদা গণনা করতে সাহায্য করে",
    height: "আপনার উচ্চতা কত?",
    heightUnit: "সেমি",
    weight: "আপনার বর্তমান ওজন কত?",
    weightUnit: "কেজি",
    gender: "আপনার লিঙ্গ কী?",
    male: "পুরুষ",
    female: "মহিলা",
    other: "অন্যান্য",
    activityLevel: "আপনার কার্যকলাপ স্তর কী?",
    sedentary: "নিষ্ক্রিয়",
    sedentaryDesc: "সামান্য বা কোন ব্যায়াম নেই",
    light: "হালকা সক্রিয়",
    lightDesc: "সপ্তাহে ১-৩ দিন হালকা ব্যায়াম",
    moderate: "মাঝারি সক্রিয়",
    moderateDesc: "সপ্তাহে ৩-৫ দিন মাঝারি ব্যায়াম",
    active: "খুব সক্রিয়",
    activeDesc: "সপ্তাহে ৬-৭ দিন কঠিন ব্যায়াম",
    veryActive: "অতিরিক্ত সক্রিয়",
    veryActiveDesc: "খুব কঠিন ব্যায়াম এবং শারীরিক কাজ",
    getStarted: "শুরু করুন",
  },

  // Settings
  settings: {
    title: "সেটিংস",
    preferences: "পছন্দসমূহ",
    language: "ভাষা",
    darkMode: "ডার্ক মোড",
    security: "নিরাপত্তা",
    changePassword: "পাসওয়ার্ড পরিবর্তন",
    account: "অ্যাকাউন্ট",
    signOut: "সাইন আউট",
    deleteAccount: "অ্যাকাউন্ট মুছুন",
    deleteWarning: "এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না। আপনার সমস্ত ডেটা স্থায়ীভাবে মুছে যাবে।",
    age: "বয়স",
    heightCm: "উচ্চতা সেমি",
    weightKg: "ওজন কেজি",
    removePhoto: "ছবি সরান",
    passwordUpdated: "পাসওয়ার্ড আপডেট হয়েছে",
    passwordsDontMatch: "পাসওয়ার্ড মিলছে না",
    passwordTooShort: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে",
    newPassword: "নতুন পাসওয়ার্ড",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    updatePassword: "পাসওয়ার্ড আপডেট করুন",
    languageUpdated: "ভাষা আপডেট হয়েছে",
    selectLanguage: "ভাষা নির্বাচন করুন",
    choosePreferredLanguage: "আপনার পছন্দের ভাষা বেছে নিন",
    version: "সংস্করণ",
  },

  // Scan
  scan: {
    title: "আপনি কী খেয়েছেন?",
    subtitle: "একটি ছবি তুলুন বা ম্যানুয়ালি লিখুন",
    takePhoto: "ছবি তুলুন",
    uploadImage: "ছবি আপলোড",
    scanBarcode: "বারকোড স্ক্যান",
    manualEntry: "ম্যানুয়াল এন্ট্রি",
    analyzing: "আপনার খাবার বিশ্লেষণ করা হচ্ছে...",
    mealAnalyzed: "খাবার বিশ্লেষিত",
    addedToHistory: "আপনার ইতিহাসে যোগ করা হয়েছে",
    analysisError: "ছবি বিশ্লেষণ করা যায়নি",
  },

  // History
  history: {
    title: "খাবারের ইতিহাস",
    today: "আজ",
    yesterday: "গতকাল",
    noMeals: "এখনও কোন খাবার লগ করা হয়নি",
    startTracking: "এখানে দেখতে আপনার খাবার ট্র্যাক করা শুরু করুন",
    calories: "ক্যাল",
    protein: "প্রোটিন",
    carbs: "কার্বস",
    fat: "ফ্যাট",
    delete: "মুছুন",
    mealDeleted: "খাবার মুছে ফেলা হয়েছে",
  },

  // Charts
  charts: {
    title: "পুষ্টি চার্ট",
    weekly: "সাপ্তাহিক",
    monthly: "মাসিক",
    calories: "ক্যালোরি",
    macros: "ম্যাক্রোস",
    trends: "প্রবণতা",
    average: "গড়",
    total: "মোট",
    noData: "পর্যাপ্ত ডেটা নেই",
    trackMore: "চার্ট দেখতে আরও খাবার ট্র্যাক করুন",
  },

  // Goals
  goals: {
    title: "পুষ্টি লক্ষ্য",
    dailyTarget: "দৈনিক লক্ষ্য",
    calories: "ক্যালোরি",
    protein: "প্রোটিন",
    carbs: "কার্বস",
    fat: "ফ্যাট",
    grams: "গ্রাম",
    save: "লক্ষ্য সংরক্ষণ",
    saved: "লক্ষ্য সংরক্ষিত",
    streak: "দিনের ধারা",
    badges: "ব্যাজ",
    challenges: "চ্যালেঞ্জ",
  },

  // Coach
  coach: {
    title: "AI কোচ",
    subtitle: "আপনার ব্যক্তিগত পুষ্টি সহকারী",
    askAnything: "আপনার ডায়েট, ম্যাক্রো বা খাবার পরিকল্পনা সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন। আমি আপনার লক্ষ্যের উপর ভিত্তি করে পরামর্শ ব্যক্তিগতকৃত করব।",
    placeholder: "পুষ্টি সম্পর্কে জিজ্ঞাসা করুন...",
    starterPrompts: {
      calories: "আমার দৈনিক ক্যালোরি কত হওয়া উচিত?",
      breakfast: "উচ্চ প্রোটিনযুক্ত সকালের নাস্তা সুপারিশ করুন",
      macros: "আমি কীভাবে আমার ম্যাক্রো লক্ষ্যে পৌঁছাব?",
      mealPrep: "খাবার প্রস্তুতির টিপস",
    },
    error: "মেসেজ পাঠানো যায়নি",
  },

  // Diet Goals
  dietGoals: {
    loseWeight: "ওজন কমান",
    loseWeightDesc: "চর্বি কমাতে ক্যালোরি ঘাটতি তৈরি করুন",
    maintain: "ওজন বজায় রাখুন",
    maintainDesc: "আপনার বর্তমান ওজনে থাকুন",
    gainMuscle: "পেশী বাড়ান",
    gainMuscleDesc: "সামান্য উদ্বৃত্ত দিয়ে পেশী তৈরি করুন",
    bulk: "বাল্ক",
    bulkDesc: "উচ্চ ক্যালোরি দিয়ে সর্বাধিক পেশী বৃদ্ধি",
    cut: "কাট",
    cutDesc: "পেশী রক্ষা করে আগ্রাসী চর্বি হ্রাস",
    recomp: "বডি রিকম্প",
    recompDesc: "একই সাথে পেশী তৈরি করুন এবং চর্বি কমান",
  },

  // Meal Periods
  mealPeriods: {
    breakfast: "সকালের নাস্তা",
    lunch: "দুপুরের খাবার",
    dinner: "রাতের খাবার",
    snack: "স্ন্যাক",
  },

  // Daily Progress
  progress: {
    todayProgress: "আজকের অগ্রগতি",
    remaining: "বাকি",
    over: "বেশি",
    ofGoal: "লক্ষ্যের",
  },
};
