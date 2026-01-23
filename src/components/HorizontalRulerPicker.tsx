import { useRef, useEffect, useState } from "react";

interface HorizontalRulerPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
}

export function HorizontalRulerPicker({
  min,
  max,
  value,
  onChange,
  step = 1,
  unit = "kg",
}: HorizontalRulerPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  
  const tickWidth = 8;
  const containerWidth = typeof window !== "undefined" ? window.innerWidth : 375;
  const centerOffset = containerWidth / 2;
  const totalTicks = Math.floor((max - min) / step) + 1;

  useEffect(() => {
    if (containerRef.current && !isScrolling) {
      const scrollPosition = ((value - min) / step) * tickWidth;
      containerRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [value, min, step, tickWidth, isScrolling]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      
      const scrollLeft = containerRef.current.scrollLeft;
      const tickIndex = Math.round(scrollLeft / tickWidth);
      const newValue = Math.max(min, Math.min(max, min + tickIndex * step));
      
      if (newValue !== value) {
        onChange(newValue);
      }
      
      // Snap to position
      containerRef.current.scrollTo({
        left: tickIndex * tickWidth,
        behavior: "smooth",
      });
      
      setIsScrolling(false);
    }, 100);
  };

  return (
    <div className="w-full">
      {/* Value display */}
      <div className="text-center mb-4">
        <span className="text-5xl font-bold">{value.toFixed(1)}</span>
        <span className="text-3xl font-semibold ml-1">{unit}</span>
      </div>
      
      {/* Ruler */}
      <div className="relative h-20 overflow-hidden">
        {/* Center indicator */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-foreground z-10"
        />
        
        {/* Gradient overlays */}
        <div 
          className="absolute top-0 left-0 w-24 h-full pointer-events-none z-10"
          style={{
            background: "linear-gradient(to right, hsl(var(--background)) 0%, transparent 100%)",
          }}
        />
        <div 
          className="absolute top-0 right-0 w-24 h-full pointer-events-none z-10"
          style={{
            background: "linear-gradient(to left, hsl(var(--background)) 0%, transparent 100%)",
          }}
        />
        
        {/* Scrollable ruler */}
        <div
          ref={containerRef}
          className="h-full overflow-x-auto hide-scrollbar"
          onScroll={handleScroll}
          style={{ 
            scrollSnapType: "x mandatory",
          }}
        >
          <div 
            className="flex items-end h-full"
            style={{ 
              paddingLeft: centerOffset,
              paddingRight: centerOffset,
            }}
          >
            {Array.from({ length: totalTicks }, (_, i) => {
              const tickValue = min + i * step;
              const isMajor = tickValue % 5 === 0;
              const isLabel = tickValue % 10 === 0;
              
              return (
                <div
                  key={i}
                  className="flex flex-col items-center flex-shrink-0"
                  style={{ 
                    width: tickWidth,
                    scrollSnapAlign: "center",
                  }}
                >
                  <div 
                    className={`w-px transition-all ${
                      isMajor ? "h-10 bg-foreground" : "h-6 bg-muted-foreground/50"
                    }`}
                  />
                  {isLabel && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {tickValue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
