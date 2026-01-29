import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/backendClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type WidgetId = "daily_tip" | "calendar" | "dashboard_cards" | "recently_uploaded" | "recommendations";

export interface DashboardSettings {
  widget_order: WidgetId[];
  hidden_widgets: WidgetId[];
}

const DEFAULT_SETTINGS: DashboardSettings = {
  widget_order: ["daily_tip", "calendar", "dashboard_cards", "recently_uploaded", "recommendations"],
  hidden_widgets: [],
};

export function useDashboardSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["dashboard-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return DEFAULT_SETTINGS;

      const { data, error } = await supabase
        .from("dashboard_settings")
        .select("widget_order, hidden_widgets")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create default settings for new user
        const { error: insertError } = await supabase
          .from("dashboard_settings")
          .insert({
            user_id: user.id,
            widget_order: DEFAULT_SETTINGS.widget_order,
            hidden_widgets: DEFAULT_SETTINGS.hidden_widgets,
          });

        if (insertError) console.error("Error creating dashboard settings:", insertError);
        return DEFAULT_SETTINGS;
      }

      return {
        widget_order: (data.widget_order as WidgetId[]) || DEFAULT_SETTINGS.widget_order,
        hidden_widgets: (data.hidden_widgets as WidgetId[]) || DEFAULT_SETTINGS.hidden_widgets,
      };
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<DashboardSettings>) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("dashboard_settings")
        .upsert({
          user_id: user.id,
          ...settings,
          ...newSettings,
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-settings", user?.id] });
    },
  });

  const toggleWidget = (widgetId: WidgetId) => {
    if (!settings) return;

    const isHidden = settings.hidden_widgets.includes(widgetId);
    const newHiddenWidgets = isHidden
      ? settings.hidden_widgets.filter((id) => id !== widgetId)
      : [...settings.hidden_widgets, widgetId];

    updateSettings.mutate({ hidden_widgets: newHiddenWidgets });
  };

  const reorderWidgets = (newOrder: WidgetId[]) => {
    updateSettings.mutate({ widget_order: newOrder });
  };

  const resetToDefault = () => {
    updateSettings.mutate(DEFAULT_SETTINGS);
  };

  const isWidgetVisible = (widgetId: WidgetId) => {
    return !settings?.hidden_widgets.includes(widgetId);
  };

  return {
    settings: settings || DEFAULT_SETTINGS,
    isLoading,
    toggleWidget,
    reorderWidgets,
    resetToDefault,
    isWidgetVisible,
    isUpdating: updateSettings.isPending,
  };
}
