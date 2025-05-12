
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
        <label className="inline-flex items-center cursor-pointer p-2">
          <input type="checkbox" value="" checked={isDebugging} onChange={() => onDebugAction("toggle")} className="sr-only peer" />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {isDebugging ? "Debug Mode" : "Run Mode"}
          </span>
        </label>

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