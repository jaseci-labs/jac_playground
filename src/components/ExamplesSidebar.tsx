
import { useState } from "react";
import { BookOpen, ChevronRight, Code, X, Layout, FolderOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { exampleCodes } from "@/lib/examples";
import { Badge } from "@/components/ui/badge";

interface ExamplesSidebarProps {
  onSelectExample: (code: string) => void;
  className?: string;
  isMobile?: boolean;
  onToggleMobile?: () => void;
}

export function ExamplesSidebar({
  onSelectExample,
  className,
  isMobile = false,
  onToggleMobile,
}: ExamplesSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (isMobile && onToggleMobile) {
      onToggleMobile();
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-card text-card-foreground border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-12" : isMobile ? "w-full" : "w-72",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 h-14 bg-muted/30">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h1 className="font-medium text-sm">Jaclang Examples</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(collapsed && "mx-auto")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isMobile ? 
            <X className="h-4 w-4" /> : 
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                !collapsed && "rotate-180"
              )}
            />
          }
        </Button>
      </div>

      <Separator />

      {!collapsed && (
        <>
          <div className="p-4">
            <p className="text-xs text-muted-foreground">
              Click on an example to load it into the editor
            </p>
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-2 p-2">
              {exampleCodes.map((example, index) => (
                <div 
                  key={index}
                  onClick={() => onSelectExample(example.code)}
                  className="group cursor-pointer rounded-md border bg-card hover:bg-accent/10 transition-colors duration-200 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">{example.name}</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-primary/10">
                      Example
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {example.code.slice(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 flex justify-between items-center border-t">
            <span className="text-xs text-muted-foreground">
              v1.0.0
            </span>
            <ThemeToggle />
          </div>
        </>
      )}
    </div>
  );
}
