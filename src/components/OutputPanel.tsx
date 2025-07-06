import { cn } from "@/lib/utils";
import { Loader2, Terminal, Eraser } from "lucide-react";

interface OutputPanelProps {
  output: string;
  outIsError?: boolean;
  isLoading?: boolean;
  className?: string;
  onClear?: () => void;
}

export function OutputPanel({
  output,
  outIsError,
  isLoading = false,
  className,
  onClear,
}: OutputPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full w-full bg-card text-foreground font-mono p-2 overflow-auto rounded-md",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2 p-2 bg-muted/30 rounded-md">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Output</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4 text-primary" />
              <span className="text-xs">Running...</span>
            </div>
          )}
          {onClear && (
            <button
              className="ml-2 p-1 text-xs bg-muted rounded hover:bg-muted/70 border border-muted-foreground/20 flex items-center justify-center"
              onClick={onClear}
              type="button"
              title="Clear Output"
            >
              <Eraser className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 p-2 bg-editor-background rounded-md text-editor-foreground">
        <pre
              className={cn(
              "whitespace-pre-wrap text-sm",
              outIsError ? "text-red-400" : "text-white-500"
              )}
            >
              {output
                ? output
                    .split(/<==START PRINT GRAPH==>[\s\S]*?<==END PRINT GRAPH==>/g)
                    .join("")
                    .trim() || "// Output will appear here after running code"
                : "// Output will appear here after running code"}
            </pre>
      </div>
    </div>
  );
}