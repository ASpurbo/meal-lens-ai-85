import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/backendClient";
import { useAuth } from "@/hooks/useAuth";
import { getTranslations, TranslationKeys } from "@/lib/translations";

interface TranslationContextType {
  t: TranslationKeys;
  language: string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile-language", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("language")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const language = profile?.language || "en";
  const t = useMemo(() => getTranslations(language), [language]);

  return (
    <TranslationContext.Provider value={{ t, language }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    // Return English as default if not wrapped in provider
    return { t: getTranslations("en"), language: "en" };
  }
  return context;
}
