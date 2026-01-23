import { Slider } from "@/components/ui/slider";

interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  goal: "lose" | "gain";
}

export function SpeedSlider({
  value,
  onChange,
  min,
  max,
  step,
  goal,
}: SpeedSliderProps) {
  const speeds = [
    { value: min, label: `${min} kg`, icon: "🦥" },
    { value: (min + max) / 2, label: `${((min + max) / 2).toFixed(1)} kg`, icon: "🐇" },
    { value: max, label: `${max} kg`, icon: "🐆" },
  ];

  const recommendedValue = (min + max) / 2;

  return (
    <div className="space-y-8">
      {/* Current value display */}
      <div className="text-center">
        <p className="text-muted-foreground mb-2">
          {goal === "lose" ? "Lose" : "Gain"} weight speed per week
        </p>
        <span className="text-5xl font-bold">{value.toFixed(1)} kg</span>
      </div>
      
      {/* Speed icons */}
      <div className="flex justify-between items-end px-2">
        {speeds.map((s, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-3xl mb-2">{s.icon}</span>
          </div>
        ))}
      </div>
      
      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between px-2">
        {speeds.map((s, i) => (
          <span key={i} className="text-sm text-muted-foreground">
            {s.label}
          </span>
        ))}
      </div>
      
      {/* Recommended badge */}
      {Math.abs(value - recommendedValue) < step && (
        <div className="flex justify-center">
          <div className="bg-secondary px-6 py-3 rounded-2xl">
            <span className="font-medium">Recommended</span>
          </div>
        </div>
      )}
    </div>
  );
}
