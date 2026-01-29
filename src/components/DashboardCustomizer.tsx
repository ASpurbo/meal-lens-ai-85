import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { X, GripVertical, Eye, EyeOff, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDashboardSettings, WidgetId } from "@/hooks/useDashboardSettings";

interface DashboardCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WIDGET_LABELS: Record<WidgetId, { label: string; emoji: string }> = {
  daily_tip: { label: "Daily Tips", emoji: "💡" },
  calendar: { label: "Weekly Calendar", emoji: "📅" },
  dashboard_cards: { label: "Nutrition Dashboard", emoji: "📊" },
  recently_uploaded: { label: "Recent Meals", emoji: "🍽️" },
  recommendations: { label: "Smart Recommendations", emoji: "✨" },
};

export function DashboardCustomizer({ open, onOpenChange }: DashboardCustomizerProps) {
  const { settings, toggleWidget, reorderWidgets, resetToDefault, isWidgetVisible, isUpdating } = useDashboardSettings();
  const [localOrder, setLocalOrder] = useState<WidgetId[]>(settings.widget_order);

  // Sync local order with settings when opened
  useState(() => {
    setLocalOrder(settings.widget_order);
  });

  const handleReorder = (newOrder: WidgetId[]) => {
    setLocalOrder(newOrder);
  };

  const handleSaveOrder = () => {
    reorderWidgets(localOrder);
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-2xl border-t sm:border border-border shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-lg">Customize Dashboard</h2>
            <p className="text-xs text-muted-foreground">Drag to reorder, toggle to show/hide</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Widget List */}
        <div className="flex-1 overflow-y-auto p-6 pb-safe">
          <Reorder.Group
            axis="y"
            values={localOrder}
            onReorder={handleReorder}
            className="space-y-3"
          >
            {localOrder.map((widgetId) => {
              const widget = WIDGET_LABELS[widgetId];
              const visible = isWidgetVisible(widgetId);

              return (
                <Reorder.Item
                  key={widgetId}
                  value={widgetId}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    visible
                      ? "bg-card border-border"
                      : "bg-muted/50 border-border/50 opacity-60"
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing touch-none">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* Widget Info */}
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-xl">{widget.emoji}</span>
                    <span className={`font-medium ${!visible && "line-through text-muted-foreground"}`}>
                      {widget.label}
                    </span>
                  </div>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => toggleWidget(widgetId)}
                    className={`p-2 rounded-lg transition-colors ${
                      visible ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-border/30 flex-shrink-0">
          <Button
            variant="outline"
            onClick={resetToDefault}
            disabled={isUpdating}
            className="flex-1 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={() => {
              handleSaveOrder();
              onOpenChange(false);
            }}
            disabled={isUpdating}
            className="flex-1 rounded-xl"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
