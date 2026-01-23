interface MacroRingProps {
  value: number;
  label: string;
  unit?: string;
  color: "calories" | "protein" | "carbs" | "fat";
  icon: React.ReactNode;
  onEdit?: () => void;
}

export function MacroRing({
  value,
  label,
  unit = "g",
  color,
  icon,
  onEdit,
}: MacroRingProps) {
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Show partial fill for visual effect
  const progress = 0.75;
  const strokeDashoffset = circumference * (1 - progress);

  const colorMap = {
    calories: "stroke-calories",
    protein: "stroke-protein", 
    carbs: "stroke-carbs",
    fat: "stroke-fat",
  };

  return (
    <div className="bg-secondary/50 rounded-2xl p-4 relative">
      {/* Icon and label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      
      {/* Ring */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className={colorMap[color]}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          
          {/* Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{value}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
        </div>
      </div>
      
      {/* Edit button */}
      {onEdit && (
        <button 
          onClick={onEdit}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
      )}
    </div>
  );
}
