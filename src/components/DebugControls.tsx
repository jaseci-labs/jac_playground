
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
        "flex items-center gap-1 p-1.5 bg-card border-t border-border overflow-x-auto", 
        className
      )}>
        {isDebugging && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDebugAction("continue")}
                  disabled={!isPaused}
                  className="h-7 w-7 p-0"
                >
                  <Play className="h-3.5 w-3.5" />
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
                  className="h-7 w-7 p-0"
                >
                  <SkipForward className="h-3.5 w-3.5" />
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
                  className="h-7 w-7 p-0"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
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
                  className="h-7 w-7 p-0"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
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
                  className="h-7 w-7 p-0"
                >
                  <RotateCw className="h-3.5 w-3.5" />
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
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                >
                  <Square className="h-3.5 w-3.5" />
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