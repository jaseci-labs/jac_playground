import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RefreshCw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeEditor, CodeEditorHandle } from "@/components/CodeEditor";
import { OutputPanel } from "@/components/OutputPanel";
import { ExamplesSidebar } from "@/components/ExamplesSidebar";
import { ResizablePanel } from "@/components/ResizablePanel";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { defaultCode } from "@/lib/examples";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { DebugPanel } from "@/components/DebugPanel";
import { DebugControls, DebugAction } from "@/components/DebugControls";
import { HelpDialog } from "@/components/HelpDialog";
import { useToast } from "@/hooks/use-toast";
import jacLogo from "/jaseci.png";

import {
  PythonThread,
} from "@/lib/pythonThread";
import JacLoadingOverlay from "@/components/JacLoadingOverlay";


const Index = () => {

  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState("");
  const [outIsError, setOutIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [pythonThread, setPythonThread] = useState(null);
  const [loaded, setloaded] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugStatus, setDebugStatus] = useState("");
  const [graph, setGraph] = useState<JSON>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const isMobile = useMobileDetect();
  const { toast } = useToast();
  const codeEditorRef = useRef<CodeEditorHandle>(null);

  useEffect(() => {
    if (!pythonThread) {
      setPythonThread(new PythonThread(() => {
        console.log("[JsThread] Loaded callback invoked.");
        setloaded(true);
      }));
    }
  }, [loaded, pythonThread]);


  const runJacCode = async () => {
    if (!loaded) return;
    if (!pythonThread.loaded) return;

    setOutput("");
    setDebugStatus("running");

    // Assign all the callbacks --------------------------------------------
    pythonThread.callbackBreakHit = (line: number) => {
      codeEditorRef.current?.highlightExecutionLine(line);
    }
    pythonThread.callbackStdout = (outputText: string) => {
      setOutput(prev => prev + outputText);
      setOutIsError(false);
    }
    pythonThread.callbackStderr = (errorText: string) => {
      setOutput(prev => prev + errorText);
      setOutIsError(true);
    }
    pythonThread.callbackExecEnd = () => {
      setIsRunning(false);
      codeEditorRef.current?.clearExecutionLine();
    }

    let isNewGraph: boolean = true;
    pythonThread.callbackJacGraph = (graph_str: string) => {
      const graph = JSON.parse(graph_str);
      console.log("JacGraph received:", graph);
      setGraph(graph);
      isNewGraph = false;
    }
    
    // Assign all the callbacks --------------------------------------------
    try {
      setIsRunning(true);
      pythonThread.startExecution(code);
    } catch (error) {
      console.error("Error running Jac code:", error);
      setOutput(`Error: ${error}`);
    }
  };

  const handleReset = () => {
    setCode(defaultCode);
    setOutput("");
    toast({
      title: "Editor Reset",
      description: "Code has been reset to default example.",
    });
  };

  const handleSelectExample = (exampleCode: string) => {
    setCode(exampleCode);
    if (isMobile) {
      setShowMobileSidebar(false);
    }
    toast({
      title: "Example Loaded",
      description: "Code example has been loaded into the editor.",
    });
  };

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const handleBreakpointsChange = (newBreakpoints: number[]) => {
    setBreakpoints(newBreakpoints);
  };

  useEffect(() => {
    if (pythonThread != null && pythonThread.loaded) {
      pythonThread.setBreakpoints(breakpoints);
    }
  }, [breakpoints, pythonThread]);


  const handleDebugAction = useCallback(async (action: DebugAction) => {
    switch (action) {


      // Toggles between debug and run mode.
      case "toggle":
        setIsDebugging(prev => {
          const newState = !prev;
          return newState;
        });
        break;

      case "continue":
        pythonThread.continueExecution();
        break;

      case "stepOver":
        pythonThread.stepOver();
        break;

      case "stepInto":
        pythonThread.stepInto();
        break;

      case "stepOut":
        pythonThread.stepOut();
        break;

      case "restart":
        if (!pythonThread || !pythonThread.loaded || !loaded) {
          toast({
            title: "Cannot Restart",
            description: "Python environment is not ready yet. Please wait for initialization to complete.",
            variant: "destructive",
          });
          return;
        }
        
        if (!code.trim()) {
          toast({
            title: "Cannot Restart",
            description: "No code to execute. Please write some Jac code first.",
            variant: "destructive",
          });
          return;
        }
        
        setDebugStatus("restarting");
        console.log("Restart debugging");
        toast({
          title: "Restarting Execution",
          description: "Stopping current execution and restarting...",
        });
        
        codeEditorRef.current?.clearExecutionLine();
        
        if (isRunning) {
          pythonThread.terminate();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setOutput("");
        setOutIsError(false);
        pythonThread.startExecution(code);
        setIsRunning(true);
        break;

      case "stop":
        pythonThread.terminate();
        console.log("Stop debugging");
        setDebugStatus("stopped");
        codeEditorRef.current?.clearExecutionLine();
        break;
    }
  }, [isDebugging, breakpoints, pythonThread, loaded, isRunning, code, toast]);



  if (!loaded) {
    return (
      <JacLoadingOverlay />
    );
  }

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        <header className="h-14 border-b bg-card flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <img src={jacLogo} className="w-8 h-8 mr-2" />
            <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">Jac Playground</h1>
          </div>
          <div className="flex items-center space-x-2">
            {isMobile && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMobileSidebar}
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <HelpDialog />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-12 border-b bg-card flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={runJacCode}
                  disabled={isRunning || !loaded}
                  className="space-x-1 bg-primary hover:bg-primary/90"
                >
                  <Play className="h-4 w-4" />
                  <span>{isDebugging ? "Debug" : "Run"}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Run</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isDebugging}
                      onChange={() => handleDebugAction("toggle")}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm font-medium text-muted-foreground">Debug</span>
                </div>
              </div>
              
              {/* Environment Status Indicator - Right aligned */}
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${loaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="text-muted-foreground">
                  {loaded ? 'Environment Ready' : 'Loading Environment...'}
                </span>
              </div>
            </div>

            <DebugControls
              isDebugging={isDebugging}
              isPaused={true}
              onDebugAction={handleDebugAction}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <div className="flex h-full">
                  <div className={`${isDebugging ? 'w-1/2' : 'w-full'} border-r border-border`}>
                    <CodeEditor
                      ref={codeEditorRef}
                      value={code}
                      onChange={setCode}
                      className="h-full"
                      onBreakpointsChange={handleBreakpointsChange}
                      onRunCode={runJacCode}
                      onToggleDebug={() => handleDebugAction("toggle")}
                    />
                  </div>
                  {
                    isDebugging && (
                      <div className="flex-1">
                        <DebugPanel
                          graph={graph}
                          debugStatus={isRunning}
                          className="h-full"
                        />
                      </div>
                    )
                  }
                </div>
              </div>

              <ResizablePanel
                direction="horizontal"
                defaultSize={30}
                minSize={20}
                maxSize={50}
                className="overflow-hidden border-t"
              >
                <OutputPanel
                  output={output}
                  outIsError={outIsError}
                  isLoading={isRunning}
                  className="h-full"
                  onClear={() => setOutput("")}
                />
              </ResizablePanel>
            </div>
          </div>

          {(showMobileSidebar || !isMobile) && (
            <ExamplesSidebar
              onSelectExample={handleSelectExample}
              isMobile={isMobile}
              onToggleMobile={toggleMobileSidebar}
              className={isMobile ? "absolute inset-0 z-50" : "border-l"}
            />
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
