
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
      <div className={cn(
        "flex items-center gap-1 md:gap-2 p-1 md:p-2 bg-card border-t border-border overflow-x-auto", 
        className
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle 
              pressed={isDebugging}
              onPressedChange={() => onDebugAction("toggle")}
              aria-label="Toggle debug mode"
              className="gap-1"
            >
              <ToggleRight className="h-4 w-4" />
              <span className="hidden sm:inline">
                {!isDebugging ? "Debug Mode" : "Run Mode"}
              </span>
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>Debug Mode</p>
          </TooltipContent>
        </Tooltip>
        
        {isDebugging && (
          <>
            <div className="h-4 border-l border-border mx-1" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDebugAction("continue")}
                  disabled={!isPaused}
                >
                  <Play className="h-4 w-4" />
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
                  size="sm" 
                  onClick={() => onDebugAction("stepOver")}
                  disabled={!isPaused}
                >
                  <SkipForward className="h-4 w-4" />
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
                  size="sm" 
                  onClick={() => onDebugAction("stepInto")}
                  disabled={!isPaused}
                >
                  <ArrowDown className="h-4 w-4" />
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
                  size="sm" 
                  onClick={() => onDebugAction("stepOut")}
                  disabled={!isPaused}
                >
                  <ArrowUp className="h-4 w-4" />
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
                  size="sm" 
                  onClick={() => onDebugAction("restart")}
                >
                  <RotateCw className="h-4 w-4" />
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
                  size="sm" 
                  onClick={() => onDebugAction("stop")}
                  className="text-red-500 hover:text-red-600"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stop</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}