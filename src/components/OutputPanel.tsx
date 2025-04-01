
import { cn } from "@/lib/utils";
import { Loader2, Terminal } from "lucide-react";

interface OutputPanelProps {
  output: string;
  isLoading?: boolean;
  className?: string;
}

export function OutputPanel({
  output,
  isLoading = false,
  className,
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
        {isLoading && (
          <div className="flex items-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4 text-primary" />
            <span className="text-xs">Running...</span>
          </div>
        )}
      </div>
      <div className="flex-1 p-2 bg-editor-background rounded-md text-editor-foreground">
        <pre className="whitespace-pre-wrap text-sm">
          {output || "// Output will appear here after running code"}
        </pre>
      </div>
    </div>
  );
}
