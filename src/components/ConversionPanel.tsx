import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeEditor } from "./CodeEditor";

interface ConversionPanelProps {
  mode: "jac2py" | "py2jac";
  inputCode: string;
  onInputChange: (code: string) => void;
  onConvert: (code: string) => Promise<string>;
  className?: string;
}

export function ConversionPanel({
  mode,
  inputCode,
  onInputChange,
  onConvert,
  className
}: ConversionPanelProps) {
  const [outputCode, setOutputCode] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConvert = async () => {
    if (!inputCode.trim()) return;
    
    setIsConverting(true);
    try {
      const result = await onConvert(inputCode);
      setOutputCode(result);
    } catch (error) {
      console.error("Conversion error:", error);
      setOutputCode(`Error: ${error}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!outputCode) return;
    
    try {
      await navigator.clipboard.writeText(outputCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const inputLabel = mode === "jac2py" ? "Jac Code" : "Python Code";
  const outputLabel = mode === "jac2py" ? "Python Code" : "Jac Code";

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Conversion Controls */}
      <div className="h-12 border-b bg-card flex items-center justify-center px-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">{inputLabel}</span>
          <Button
            onClick={handleConvert}
            disabled={isConverting || !inputCode.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {isConverting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span className="ml-2">Convert</span>
          </Button>
          <span className="text-sm font-medium text-muted-foreground">{outputLabel}</span>
        </div>
      </div>

      {/* Editor Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input Panel */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <div className="h-8 bg-muted/50 border-b flex items-center px-3">
            <span className="text-xs font-medium text-muted-foreground">{inputLabel}</span>
          </div>
          <div className="flex-1">
            <CodeEditor
              value={inputCode}
              onChange={onInputChange}
              className="h-full"
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="h-8 bg-muted/50 border-b flex items-center justify-between px-3">
            <span className="text-xs font-medium text-muted-foreground">{outputLabel}</span>
            {outputCode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 px-2"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
          <div className="flex-1 bg-muted/20">
            {outputCode ? (
              <CodeEditor
                value={outputCode}
                onChange={() => {}}
                className="h-full"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-center">
                  Enter {inputLabel.toLowerCase()} and click Convert<br />
                  to see the {outputLabel.toLowerCase()} output
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}