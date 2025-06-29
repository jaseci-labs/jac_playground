import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Code, X, FolderOpen, Folder as FolderIcon, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { JAC_EXAMPLES_JSON_PATH } from "@/lib/assetPaths";

// Types for folder/file tree
type ExampleTree = {
  [name: string]: ExampleTree | string;
};

interface ExamplesSidebarProps {
  onSelectExample: (code: string) => void;
  className?: string;
  isMobile?: boolean;
  onToggleMobile?: () => void;
}

interface ExampleFileNode {
  name: string;
  filename: string;
}

interface ExampleFolderNode {
  name: string;
  children: (ExampleFolderNode | ExampleFileNode)[];
}

type ExampleNode = ExampleFolderNode | ExampleFileNode;

function isFileNode(node: ExampleNode): node is ExampleFileNode {
  return (node as ExampleFileNode).filename !== undefined;
}

// Convert the JSON tree to a node tree
function parseExampleTree(obj: ExampleTree, name = ""): ExampleNode[] {
  return Object.entries(obj).map(([key, value]) => {
    if (typeof value === "string") {
      return { name: key, filename: value };
    } else {
      return { name: key, children: parseExampleTree(value, key) };
    }
  });
}

export function ExamplesSidebar({
  onSelectExample,
  className,
  isMobile = false,
  onToggleMobile,
}: ExamplesSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [exampleTree, setExampleTree] = useState<ExampleNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchExamples() {
      setLoading(true);
      try {
        const res = await fetch(JAC_EXAMPLES_JSON_PATH);
        const files: ExampleTree = await res.json();
        setExampleTree(parseExampleTree(files));
      } catch (e) {
        setExampleTree([]);
      }
      setLoading(false);
    }
    fetchExamples();
  }, []);

  const toggleSidebar = () => {
    if (isMobile && onToggleMobile) {
      onToggleMobile();
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleToggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Recursive tree rendering
  const renderTree = (nodes: ExampleNode[], parentPath = "", level = 0) => (
    <ul className={level === 0 ? "" : "ml-3"}>
      {nodes.map((node) => {
        const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
        if (isFileNode(node)) {
          return (
            <li key={nodePath}>
              <div
                className={cn(
                  "flex items-center gap-2 cursor-pointer rounded-md border bg-card hover:bg-accent/10 transition-colors duration-200 p-2 my-1",
                  level > 0 && "border-none bg-transparent pl-7"
                )}
                onClick={async () => {
                  // Fetch code and pass to onSelectExample
                  const codeRes = await fetch(`/examples/${node.filename}`);
                  if (!codeRes.ok) {
                    console.error(`Failed to load ${node.filename}: ${codeRes.statusText}`);
                    return;
                  }
                  const contentType = codeRes.headers.get("content-type");
                  const code = await codeRes.text();
                  if (
                    (contentType && contentType.includes("text/html")) ||
                    code.trim().startsWith("<!DOCTYPE html") ||
                    code.trim().startsWith("<html")
                  ) {
                    console.error(`File not found or invalid: ${node.filename}`);
                    return;
                  }
                  onSelectExample(code);
                }}
                title={node.name}
              >
                <FileText className="h-4 w-4 text-primary" />
                <span
                  className={cn(
                    "text-sm truncate",
                    isMobile ? "max-w-[220px]" : "max-w-[140px]"
                  )}
                >
                  {node.name}
                </span>
              </div>
            </li>
          );
        } else {
          const isOpen = expandedFolders[nodePath] ?? false;
          return (
            <li key={nodePath}>
              <div
                className={cn(
                  "flex items-center gap-2 cursor-pointer rounded-md hover:bg-accent/10 transition-colors duration-200 p-2 my-1 font-medium",
                  level > 0 && "pl-4"
                )}
                onClick={() => handleToggleFolder(nodePath)}
                title={node.name}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <FolderIcon className="h-4 w-4 text-yellow-600" />
                <span
                  className={cn(
                    "text-sm truncate",
                    isMobile ? "max-w-[200px]" : "max-w-[120px]"
                  )}
                >
                  {node.name}
                </span>
              </div>
              {isOpen && renderTree(node.children, nodePath, level + 1)}
            </li>
          );
        }
      })}
    </ul>
  );

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
                collapsed && "rotate-180"
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
              {loading ? (
                <div className="text-xs text-muted-foreground">Loading examples...</div>
              ) : (
                renderTree(exampleTree)
              )}
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
