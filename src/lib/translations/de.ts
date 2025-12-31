import type { TranslationKeys } from "./en";

export const de: TranslationKeys = {
  // Common
  common: {
    loading: "Lädt...",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    back: "Zurück",
    next: "Weiter",
    done: "Fertig",
    error: "Fehler",
    success: "Erfolg",
  },

  // Navigation
  nav: {
    scan: "Scannen",
    history: "Verlauf",
    charts: "Diagramme",
    goals: "Ziele",
    coach: "Coach",
    settings: "Einstellungen",
  },

  // Auth
  auth: {
    welcomeBack: "Willkommen zurück",
    createAccount: "Konto erstellen",
    signInToContinue: "Anmelden zum Fortfahren",
    startJourney: "Starten Sie Ihre Ernährungsreise",
    email: "E-Mail",
    password: "Passwort",
    signIn: "Anmelden",
    signUp: "Konto erstellen",
    noAccount: "Kein Konto? Registrieren",
    hasAccount: "Bereits ein Konto? Anmelden",
    loginFailed: "Anmeldung fehlgeschlagen",
    invalidCredentials: "Ungültige E-Mail oder Passwort. Bitte versuchen Sie es erneut.",
    emailNotVerified: "Bitte überprüfen Sie Ihren Posteingang und bestätigen Sie Ihre E-Mail.",
    signUpFailed: "Registrierung fehlgeschlagen",
    accountExists: "Diese E-Mail ist bereits registriert. Bitte melden Sie sich an.",
  },

  // Onboarding
  onboarding: {
    welcome: "Willkommen bei NutriMind",
    letsPersonalize: "Personalisieren wir Ihre Erfahrung",
    selectLanguage: "Wählen Sie Ihre Sprache",
    chooseLanguage: "Wählen Sie Ihre bevorzugte Sprache",
    whatsYourGoal: "Was ist Ihr Ziel?",
    selectGoal: "Wählen Sie Ihr primäres Ernährungsziel",
    birthday: "Wann haben Sie Geburtstag?",
    birthdayHelp: "Dies hilft uns, Ihren Nährstoffbedarf zu berechnen",
    height: "Wie groß sind Sie?",
    heightUnit: "cm",
    weight: "Wie ist Ihr aktuelles Gewicht?",
    weightUnit: "kg",
    gender: "Was ist Ihr Geschlecht?",
    male: "Männlich",
    female: "Weiblich",
    other: "Andere",
    activityLevel: "Wie aktiv sind Sie?",
    sedentary: "Sitzend",
    sedentaryDesc: "Wenig oder kein Sport",
    light: "Leicht aktiv",
    lightDesc: "Leichter Sport 1-3 Tage/Woche",
    moderate: "Mäßig aktiv",
    moderateDesc: "Mäßiger Sport 3-5 Tage/Woche",
    active: "Sehr aktiv",
    activeDesc: "Intensiver Sport 6-7 Tage/Woche",
    veryActive: "Extrem aktiv",
    veryActiveDesc: "Sehr intensiver Sport und körperliche Arbeit",
    getStarted: "Loslegen",
  },

  // Settings
  settings: {
    title: "Einstellungen",
    preferences: "Einstellungen",
    language: "Sprache",
    darkMode: "Dunkelmodus",
    security: "Sicherheit",
    changePassword: "Passwort ändern",
    account: "Konto",
    signOut: "Abmelden",
    deleteAccount: "Konto löschen",
    deleteWarning: "Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden dauerhaft gelöscht.",
    age: "Alter",
    heightCm: "Größe cm",
    weightKg: "Gewicht kg",
    removePhoto: "Foto entfernen",
    passwordUpdated: "Passwort aktualisiert",
    passwordsDontMatch: "Passwörter stimmen nicht überein",
    passwordTooShort: "Passwort muss mindestens 6 Zeichen haben",
    newPassword: "Neues Passwort",
    confirmPassword: "Passwort bestätigen",
    updatePassword: "Passwort aktualisieren",
    languageUpdated: "Sprache aktualisiert",
    selectLanguage: "Sprache auswählen",
    choosePreferredLanguage: "Wählen Sie Ihre bevorzugte Sprache",
    version: "Version",
  },

  // Scan
  scan: {
    title: "Was haben Sie gegessen?",
    subtitle: "Machen Sie ein Foto oder geben Sie manuell ein",
    takePhoto: "Foto aufnehmen",
    uploadImage: "Bild hochladen",
    scanBarcode: "Barcode scannen",
    manualEntry: "Manuelle Eingabe",
    analyzing: "Ihre Mahlzeit wird analysiert...",
    mealAnalyzed: "Mahlzeit analysiert",
    addedToHistory: "Zu Ihrem Verlauf hinzugefügt",
    analysisError: "Bild konnte nicht analysiert werden",
  },

  // History
  history: {
    title: "Mahlzeitenverlauf",
    today: "Heute",
    yesterday: "Gestern",
    noMeals: "Noch keine Mahlzeiten erfasst",
    startTracking: "Beginnen Sie, Ihre Mahlzeiten zu tracken",
    calories: "kcal",
    protein: "Protein",
    carbs: "Kohlenhydrate",
    fat: "Fett",
    delete: "Löschen",
    mealDeleted: "Mahlzeit gelöscht",
  },

  // Charts
  charts: {
    title: "Ernährungsdiagramme",
    weekly: "Wöchentlich",
    monthly: "Monatlich",
    calories: "Kalorien",
    macros: "Makros",
    trends: "Trends",
    average: "Durchschnitt",
    total: "Gesamt",
    noData: "Nicht genügend Daten",
    trackMore: "Erfassen Sie mehr Mahlzeiten für Diagramme",
  },

  // Goals
  goals: {
    title: "Ernährungsziele",
    dailyTarget: "Tagesziel",
    calories: "Kalorien",
    protein: "Protein",
    carbs: "Kohlenhydrate",
    fat: "Fett",
    grams: "g",
    save: "Ziele speichern",
    saved: "Ziele gespeichert",
    streak: "Tage in Folge",
    badges: "Abzeichen",
    challenges: "Herausforderungen",
  },

  // Coach
  coach: {
    title: "KI-Coach",
    subtitle: "Ihr persönlicher Ernährungsassistent",
    askAnything: "Fragen Sie mich alles über Ihre Ernährung, Makros oder Mahlzeitenplanung. Ich gebe personalisierte Ratschläge basierend auf Ihren Zielen.",
    placeholder: "Fragen zur Ernährung...",
    starterPrompts: {
      calories: "Wie viele Kalorien sollte ich täglich essen?",
      breakfast: "Vorschlag für ein proteinreiches Frühstück",
      macros: "Wie erreiche ich meine Makro-Ziele?",
      mealPrep: "Tipps zur Mahlzeitenvorbereitung",
    },
    error: "Nachricht konnte nicht gesendet werden",
  },

  // Diet Goals
  dietGoals: {
    loseWeight: "Abnehmen",
    loseWeightDesc: "Kaloriendefizit zum Fettabbau",
    maintain: "Gewicht halten",
    maintainDesc: "Ihr aktuelles Gewicht beibehalten",
    gainMuscle: "Muskeln aufbauen",
    gainMuscleDesc: "Muskelaufbau mit leichtem Überschuss",
    bulk: "Aufbauphase",
    bulkDesc: "Maximaler Muskelzuwachs mit mehr Kalorien",
    cut: "Definitionsphase",
    cutDesc: "Aggressiver Fettabbau bei Muskelerhalt",
    recomp: "Körper-Rekomposition",
    recompDesc: "Gleichzeitig Muskeln aufbauen und Fett verlieren",
  },

  // Meal Periods
  mealPeriods: {
    breakfast: "Frühstück",
    lunch: "Mittagessen",
    dinner: "Abendessen",
    snack: "Snack",
  },

  // Daily Progress
  progress: {
    todayProgress: "Heutiger Fortschritt",
    remaining: "übrig",
    over: "über",
    ofGoal: "vom Ziel",
  },

  // Recommendations
  recommendations: {
    title: "Empfehlungen",
    onTrack: "Du bist heute auf Kurs!",
    keepItUp: "Weiter so!",
    proteinToGo: "Protein noch übrig",
    carbsRemaining: "Kohlenhydrate verbleibend",
    addHealthyFats: "Gesunde Fette hinzufügen",
    tryHighProtein: "Probiere diese proteinreichen Rezepte",
    healthyCarbOptions: "Gesunde Kohlenhydrat-Optionen",
    goodFatSources: "Gute Fettquellen",
    startYourDay: "Starte gut in den Tag",
    noMealsLogged: "Keine Mahlzeiten erfasst — hier sind einige Ideen",
    cal: "kcal",
    protein: "Protein",
    prepTime: "Zubereitungszeit",
    servings: "Portionen",
    ingredients: "Zutaten",
    instructions: "Zubereitung",
    difficulty: "Schwierigkeit",
  },
};
