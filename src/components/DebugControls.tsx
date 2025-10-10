
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { 
  Play, 
  SkipForward, 
  ArrowDown, 
  ArrowUp, 
  RotateCw, 
  Square, 
  ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export type DebugAction = "continue" | "stepOver" | "stepInto" | "stepOut" | "restart" | "stop" | "toggle";

interface DebugControlsProps {
  isDebugging: boolean;
  isPaused: boolean;
  onDebugAction: (action: DebugAction) => void;
  className?: string;
}

export function DebugControls({ 
  isDebugging,
  isPaused,
  onDebugAction,
  className
}: DebugControlsProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center justify-center gap-2 py-1 px-2 bg-card border-t border-border", 
          className
        )}
        style={{
          minHeight: "40px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {isDebugging && (
          <div className="flex items-center justify-center gap-2 w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDebugAction("continue")}
                  disabled={!isPaused}
                  className={cn(
                    "rounded-full h-9 w-9 flex items-center justify-center p-0 border border-transparent transition-colors",
                    "bg-[#2c2c32] hover:bg-[#3c3c42] active:bg-[#23232a]",
                    !isPaused ? "opacity-60 cursor-not-allowed" : ""
                  )}
                >
                  <Play className="h-5 w-5 text-green-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Continue</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDebugAction("stepOver")}
                  disabled={!isPaused}
                  className={cn(
                    "rounded-full h-9 w-9 flex items-center justify-center p-0 border border-transparent transition-colors",
                    "bg-[#2c2c32] hover:bg-[#3c3c42] active:bg-[#23232a]",
                    !isPaused ? "opacity-60 cursor-not-allowed" : ""
                  )}
                >
                  <SkipForward className="h-5 w-5 text-blue-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Step Over</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDebugAction("stepInto")}
                  disabled={!isPaused}
                  className={cn(
                    "rounded-full h-9 w-9 flex items-center justify-center p-0 border border-transparent transition-colors",
                    "bg-[#2c2c32] hover:bg-[#3c3c42] active:bg-[#23232a]",
                    !isPaused ? "opacity-60 cursor-not-allowed" : ""
                  )}
                >
                  <ArrowDown className="h-5 w-5 text-blue-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Step Into</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDebugAction("stepOut")}
                  disabled={!isPaused}
                  className={cn(
                    "rounded-full h-9 w-9 flex items-center justify-center p-0 border border-transparent transition-colors",
                    "bg-[#2c2c32] hover:bg-[#3c3c42] active:bg-[#23232a]",
                    !isPaused ? "opacity-60 cursor-not-allowed" : ""
                  )}
                >
                  <ArrowUp className="h-5 w-5 text-blue-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Step Out</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDebugAction("restart")}
                  className={cn(
                    "rounded-full h-9 w-9 flex items-center justify-center p-0 border border-transparent transition-colors",
                    "bg-[#2c2c32] hover:bg-[#3c3c42] active:bg-[#23232a]"
                  )}
                >
                  <RotateCw className="h-5 w-5 text-yellow-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Restart</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDebugAction("stop")}
                  className={cn(
                    "rounded-full h-9 w-9 flex items-center justify-center p-0 border border-transparent transition-colors",
                    "bg-[#2c2c32] hover:bg-[#3c3c42] active:bg-[#23232a]"
                  )}
                >
                  <Square className="h-5 w-5 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stop</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}