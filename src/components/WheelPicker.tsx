import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface WheelPickerProps {
  items: (string | number)[];
  value: string | number;
  onChange: (value: string | number) => void;
  label?: string;
  itemHeight?: number;
  visibleItems?: number;
}

export function WheelPicker({
  items,
  value,
  onChange,
  label,
  itemHeight = 44,
  visibleItems = 5,
}: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  
  const currentIndex = items.indexOf(value);
  const containerHeight = itemHeight * visibleItems;
  const paddingItems = Math.floor(visibleItems / 2);

  useEffect(() => {
    if (containerRef.current && !isScrolling) {
      const scrollPosition = currentIndex * itemHeight;
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex, itemHeight, isScrolling]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      
      if (items[clampedIndex] !== value) {
        onChange(items[clampedIndex]);
      }
      
      // Snap to position
      containerRef.current.scrollTo({
        top: clampedIndex * itemHeight,
        behavior: "smooth",
      });
      
      setIsScrolling(false);
    }, 100);
  };

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-sm font-semibold text-foreground mb-2">{label}</span>
      )}
      <div className="relative" style={{ height: containerHeight }}>
        {/* Selection highlight */}
        <div 
          className="absolute left-0 right-0 bg-secondary rounded-xl pointer-events-none z-0"
          style={{ 
            top: paddingItems * itemHeight,
            height: itemHeight,
          }}
        />
        
        {/* Gradient overlays */}
        <div 
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{
            height: paddingItems * itemHeight,
            background: "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)",
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
          style={{
            height: paddingItems * itemHeight,
            background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)",
          }}
        />
        
        {/* Scrollable container */}
        <div
          ref={containerRef}
          className="h-full overflow-y-auto hide-scrollbar relative z-0"
          onScroll={handleScroll}
          style={{ scrollSnapType: "y mandatory" }}
        >
          {/* Top padding */}
          <div style={{ height: paddingItems * itemHeight }} />
          
          {/* Items */}
          {items.map((item, index) => {
            const isSelected = item === value;
            const distance = Math.abs(index - currentIndex);
            const opacity = isSelected ? 1 : Math.max(0.3, 1 - distance * 0.25);
            
            return (
              <div
                key={`${item}-${index}`}
                className="flex items-center justify-center cursor-pointer transition-all"
                style={{ 
                  height: itemHeight,
                  scrollSnapAlign: "center",
                }}
                onClick={() => onChange(item)}
              >
                <span 
                  className={`text-lg transition-all ${
                    isSelected 
                      ? "font-semibold text-foreground" 
                      : "text-muted-foreground"
                  }`}
                  style={{ opacity }}
                >
                  {item}
                </span>
              </div>
            );
          })}
          
          {/* Bottom padding */}
          <div style={{ height: paddingItems * itemHeight }} />
        </div>
      </div>
    </div>
  );
}
