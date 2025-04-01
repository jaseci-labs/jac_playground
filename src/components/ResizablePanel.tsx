
import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResizablePanelProps {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export function ResizablePanel({
  children,
  direction = "horizontal",
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  className,
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize);
  const isDragging = useRef(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startPos = useRef(0);
  const startSize = useRef(defaultSize);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startPos.current = direction === "horizontal" ? e.clientY : e.clientX;
    startSize.current = size;
    document.body.style.cursor = direction === "horizontal" ? "row-resize" : "col-resize";
  }, [direction, size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;

    const containerSize = direction === "horizontal" 
      ? resizeRef.current?.parentElement?.clientHeight || 0
      : resizeRef.current?.parentElement?.clientWidth || 0;
    
    const delta = direction === "horizontal"
      ? startPos.current - e.clientY
      : e.clientX - startPos.current;
    
    const deltaPercent = (delta / containerSize) * 100;
    const newSize = Math.min(Math.max(startSize.current + deltaPercent, minSize), maxSize);
    
    setSize(newSize);
  }, [direction, minSize, maxSize]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const isHorizontal = direction === "horizontal";
  const sizeStyle = isHorizontal ? { height: `${size}%` } : { width: `${size}%` };
  const resizerClassName = isHorizontal ? "horizontal-resizer" : "vertical-resizer";

  return (
    <div
      className={cn(
        "relative",
        className
      )}
      style={sizeStyle}
    >
      {children}
      <div
        ref={resizeRef}
        className={cn(
          "absolute resizer",
          resizerClassName,
          isHorizontal ? "top-0 left-0" : "right-0 top-0"
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
