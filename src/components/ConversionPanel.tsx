import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeEditor } from "./CodeEditor";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface ConversionPanelProps {
  mode: "jac2py" | "py2jac";
  inputCode: string;
  onInputChange: (code: string) => void;
  onConvert: (inputCode: string) => Promise<string>;
  onRunJac?: (jacCode: string) => void;
  onRunPython?: (pythonCode: string) => void;
  className?: string;
}

export function ConversionPanel({
  mode,
  inputCode,
  onInputChange,
  onConvert,
  onRunJac,
  onRunPython,
  className
}: ConversionPanelProps) {
  const [outputCode, setOutputCode] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  useEffect(() => {
    setOutputCode("");
    setCopiedInput(false);
    setCopiedOutput(false);
  }, [mode]);

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

  const handleCopyInput = async () => {
    if (!inputCode) return;
    
    try {
      await navigator.clipboard.writeText(inputCode);
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleCopyOutput = async () => {
    if (!outputCode) return;
    
    try {
      await navigator.clipboard.writeText(outputCode);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleRunInput = () => {
    if (!inputCode.trim()) return;
    
    if (mode === "jac2py") {
      onRunJac?.(inputCode);
    } else {
      onRunPython?.(inputCode);
    }
  };

  const handleRunOutput = () => {
    if (!outputCode.trim()) return;
    
    if (mode === "jac2py") {
      onRunPython?.(outputCode);
    } else {
      onRunJac?.(outputCode);
    }
  };

  const inputLabel = mode === "jac2py" ? "Jac Code" : "Python Code";
  const outputLabel = mode === "jac2py" ? "Python Code" : "Jac Code";

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Conversion Controls */}
      <div className="h-12 border-b bg-card flex items-center justify-center px-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">{inputLabel}</span>
          <Button
            onClick={handleConvert}
            disabled={isConverting || !inputCode.trim()}
            className="bg-primary hover:bg-primary/90 h-7 px-3 text-xs"
            size="sm"
          >
            {isConverting ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="h-3 w-3" />
            )}
            <span className="ml-1.5">Convert</span>
          </Button>
          <span className="text-xs font-medium text-muted-foreground">{outputLabel}</span>
        </div>
      </div>

      {/* Editor Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Input Panel */}
          <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
            <div className="h-full flex flex-col">
              <div className="h-8 bg-muted/50 border-b flex items-center justify-between px-3">
                <span className="text-xs font-medium text-muted-foreground">{inputLabel}</span>
                <div className="flex items-center gap-1">
                  {inputCode && (onRunJac || onRunPython) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRunInput}
                      className="h-6 px-2"
                      title={`Run ${inputLabel}`}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  {inputCode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyInput}
                        className="h-6 px-2"
                        title="Copy to clipboard"
                      >
                        {copiedInput ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <CodeEditor
                  value={inputCode}
                  onChange={onInputChange}
                  language={mode === "jac2py" ? "jac" : "python"}
                  onRunCode={handleRunInput}
                  readOnly={false}
                  className="h-full"
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Output Panel */}
          <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
            <div className="h-full flex flex-col">
              <div className="h-8 bg-muted/50 border-b flex items-center justify-between px-3">
                <span className="text-xs font-medium text-muted-foreground">{outputLabel}</span>
                <div className="flex items-center gap-1">
                  {outputCode && (onRunJac || onRunPython) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRunOutput}
                      className="h-6 px-2"
                      title={`Run ${outputLabel}`}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  {outputCode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyOutput}
                      className="h-6 px-2"
                      title="Copy to clipboard"
                    >
                      {copiedOutput ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-muted/20">
                {outputCode ? (
                  <CodeEditor
                    value={outputCode}
                    onChange={() => {}}
                    language={mode === "jac2py" ? "python" : "jac"}
                    onRunCode={handleRunOutput}
                    readOnly={true}
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}