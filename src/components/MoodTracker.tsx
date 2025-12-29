import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Smile, Meh, Frown, Zap, Battery, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MealAnalysis } from "@/hooks/useMealHistory";

interface MoodTrackerProps {
  meals: MealAnalysis[];
}

interface MoodLog {
  id: string;
  meal_id: string | null;
  mood: string;
  energy_level: number;
  notes: string | null;
  logged_at: string;
}

const moods = [
  { value: "great", icon: Smile, label: "Great", color: "text-green-500" },
  { value: "okay", icon: Meh, label: "Okay", color: "text-yellow-500" },
  { value: "tired", icon: Frown, label: "Tired", color: "text-orange-500" },
  { value: "bloated", icon: Frown, label: "Bloated", color: "text-red-500" },
];

const energyLevels = [
  { value: 1, icon: BatteryLow, label: "Very Low" },
  { value: 2, icon: BatteryLow, label: "Low" },
  { value: 3, icon: BatteryMedium, label: "Medium" },
  { value: 4, icon: BatteryMedium, label: "Good" },
  { value: 5, icon: BatteryFull, label: "High" },
];

export function MoodTracker({ meals }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [notes, setNotes] = useState("");
  const [recentLogs, setRecentLogs] = useState<MoodLog[]>([]);
  const [saving, setSaving] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(5);
      
      if (data) setRecentLogs(data);
    };

    fetchLogs();
  }, [user]);

  const handleSave = async () => {
    if (!user || !selectedMood) return;
    
    setSaving(true);
    try {
      const latestMeal = meals[0];
      
      const { error } = await supabase
        .from("mood_logs")
        .insert({
          user_id: user.id,
          meal_id: latestMeal?.id || null,
          mood: selectedMood,
          energy_level: energyLevel,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Mood logged!",
        description: "We'll help you track patterns over time.",
      });

      // Reset form
      setSelectedMood(null);
      setEnergyLevel(3);
      setNotes("");

      // Refresh logs
      const { data } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(5);
      
      if (data) setRecentLogs(data);
    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Failed to save",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Log new mood */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-primary" />
            How are you feeling?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood selection */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Mood after eating</label>
            <div className="flex gap-3">
              {moods.map((mood) => {
                const Icon = mood.icon;
                return (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedMood === mood.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${mood.color}`} />
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy level */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Energy Level
            </label>
            <div className="flex gap-2">
              {energyLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setEnergyLevel(level.value)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all text-center ${
                    energyLevel === level.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg font-bold">{level.value}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {energyLevels.find((e) => e.value === energyLevel)?.label}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific feelings after your meal?"
              className="resize-none"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={!selectedMood || saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Log Mood"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Mood Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log, i) => {
                const moodConfig = moods.find((m) => m.value === log.mood);
                const MoodIcon = moodConfig?.icon || Smile;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <MoodIcon className={`w-6 h-6 ${moodConfig?.color || "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{log.mood}</span>
                        <span className="text-sm text-muted-foreground">
                          · Energy: {log.energy_level}/5
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground">{log.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.logged_at).toLocaleDateString()}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
