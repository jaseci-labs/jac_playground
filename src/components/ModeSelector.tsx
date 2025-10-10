import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Mode = "run" | "debug" | "jac2py" | "py2jac";

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
  className?: string;
}

export function ModeSelector({ currentMode, onModeChange, className }: ModeSelectorProps) {
  const modes: { key: Mode; label: string; description: string }[] = [
    { key: "run", label: "Run", description: "Execute Jac code" },
    { key: "debug", label: "Debug", description: "Debug with graph visualization" },
    { key: "jac2py", label: "Jac2Py", description: "Convert Jac to Python" },
    { key: "py2jac", label: "Py2Jac", description: "Convert Python to Jac" },
  ];

  return (
    <div className={cn("flex items-center gap-1 bg-muted/50 p-1 rounded-lg", className)}>
      {modes.map((mode) => (
        <Button
          key={mode.key}
          variant={currentMode === mode.key ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange(mode.key)}
          className={cn(
            "transition-all duration-200",
            currentMode === mode.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted"
          )}
          title={mode.description}
        >
          {mode.label}
        </Button>
      ))}
    </div>
  );
}