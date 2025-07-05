import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Keyboard, Play, Bug, RotateCcw } from "lucide-react";

export function HelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Jac Playground Help
          </DialogTitle>
          <DialogDescription>
            Learn how to use the Jac Programming Language Playground
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Run Code</span>
                <Badge variant="outline">Ctrl + Enter</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Toggle Debug Mode</span>
                <Badge variant="outline">F5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Run Code (Alternative)</span>
                <Badge variant="outline">Ctrl + F5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Add/Remove Breakpoint</span>
                <Badge variant="outline">Click gutter</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Play className="h-4 w-4" />
              Features
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Code Execution</h4>
                <p className="text-sm text-muted-foreground">
                  Write Jac code in the editor and run it using the Run button or Ctrl+Enter.
                  The output will appear in the Output panel below.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Bug className="h-3 w-3" />
                  Debug Mode
                </h4>
                <p className="text-sm text-muted-foreground">
                  Toggle debug mode to step through your code line by line.
                  Click on line numbers to set breakpoints.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <RotateCcw className="h-3 w-3" />
                  Restart
                </h4>
                <p className="text-sm text-muted-foreground">
                  Stop current execution and restart with the same code.
                  Useful when code gets stuck or you want a fresh start.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Examples</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Explore the examples in the sidebar to learn Jac syntax and features:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>• Variables & Basic Operations</div>
              <div>• Control Flow (if/else)</div>
              <div>• Loops & Iteration</div>
              <div>• Functions & Methods</div>
              <div>• Objects & Classes</div>
              <div>• Arrays & Data Structures</div>
            </div>
          </div>

          <Separator />

          {/* Tips */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tips</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• Use the examples to get started quickly</div>
              <div>• Set breakpoints by clicking on line numbers</div>
              <div>• Use debug mode to understand program flow</div>
              <div>• Check the output panel for errors and results</div>
              <div>• Toggle between light and dark themes</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
