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
      if (isDebugging) {
        codeEditorRef.current?.highlightExecutionLine(line);
      }
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
      setIsPaused(false);
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
      if (isDebugging) {
        setIsPaused(true);
      }
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
      if (isDebugging) {
        pythonThread.setBreakpoints(breakpoints);
      } else {
        pythonThread.setBreakpoints([]);
      }
    }
  }, [breakpoints, pythonThread, isDebugging]);


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
        setDebugStatus("restarting");
        console.log("Restart debugging");
        break;

      case "stop":
        pythonThread.terminate();
        console.log("Stop debugging");
        setIsDebugging(false);
        setDebugStatus("stopped");
        codeEditorRef.current?.clearExecutionLine();
        break;
    }
  }, [isDebugging, breakpoints]);



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
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-12 border-b bg-card flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={runJacCode}
                  disabled={isRunning}
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
              </div>
            </div>

            <DebugControls
              isDebugging={isDebugging}
              isPaused={isPaused}
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
