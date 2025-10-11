import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RefreshCw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeEditor, CodeEditorHandle } from "@/components/CodeEditor";
import { OutputPanel } from "@/components/OutputPanel";
import { ExamplesSidebar } from "@/components/ExamplesSidebar";
import { ResizablePanel } from "@/components/ResizablePanel";
import { ResizablePanelGroup, ResizablePanel as UIResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModeSelector, Mode } from "@/components/ModeSelector";
import { ConversionPanel } from "@/components/ConversionPanel";
import { defaultCode } from "@/lib/examples";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { DebugPanel } from "@/components/DebugPanel";
import { DebugControls, DebugAction } from "@/components/DebugControls";
import { HelpDialog } from "@/components/HelpDialog";
import { useToast } from "@/hooks/use-toast";
import { convertJacToPython, convertPythonToJac, setPythonThread as setCodeServicePythonThread } from "@/lib/codeService";
import jacLogo from "/jaseci.png";

import {
  PythonThread,
} from "@/lib/pythonThread";
import JacLoadingOverlay from "@/components/JacLoadingOverlay";


const Index = () => {

  const [currentMode, setCurrentMode] = useState<Mode>("run");
  const [code, setCode] = useState(defaultCode);
  const [conversionCode, setConversionCode] = useState(""); // For jac2py and py2jac modes
  const [output, setOutput] = useState("");
  const [outIsError, setOutIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [pythonThread, setPythonThread] = useState(null);
  const [loaded, setloaded] = useState(false);
  const [graph, setGraph] = useState<JSON>(null);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);

  const isMobile = useMobileDetect();
  const { toast } = useToast();
  const codeEditorRef = useRef<CodeEditorHandle>(null);

  useEffect(() => {
    if (!pythonThread) {
      const newPythonThread = new PythonThread(() => {
        console.log("[JsThread] Loaded callback invoked.");
        setloaded(true);
      });
      setCodeServicePythonThread(newPythonThread);
      setPythonThread(newPythonThread);
    }
  }, [loaded, pythonThread]);

  const runJacCode = async () => {
    if (!loaded) return;
    if (!pythonThread.loaded) return;

    setOutput("");

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

    pythonThread.callbackJacGraph = (graph_str: string) => {
      const graph = JSON.parse(graph_str);
      setGraph(graph);
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

  const handleRunJac = (jacCode: string) => {
    if (!loaded || !pythonThread?.loaded) {
      toast({
        title: "Environment Not Ready",
        description: "Python environment is still loading. Please wait.",
        variant: "destructive",
      });
      return;
    }

    setOutput("");
    setOutIsError(false);

    // Only set necessary callbacks for conversion panel
    pythonThread.callbackStdout = (outputText: string) => {
      setOutput(prev => prev + outputText);
      setOutIsError(false);
    };
    pythonThread.callbackStderr = (errorText: string) => {
      setOutput(prev => prev + errorText);
      setOutIsError(true);
    };
    pythonThread.callbackExecEnd = () => {
      setIsRunning(false);
    };
    pythonThread.callbackJacGraph = (graph_str: string) => {
      const graph = JSON.parse(graph_str);
      setGraph(graph);
    };

    try {
      setIsRunning(true);
      pythonThread.startExecution(jacCode);
    } catch (error) {
      console.error("Error running Jac code:", error);
      setOutput(`Error: ${error}`);
      setIsRunning(false);
    }
  };

  const handleRunPython = (pythonCode: string) => {
    if (!loaded || !pythonThread?.loaded) {
      toast({
        title: "Environment Not Ready",
        description: "Python environment is still loading. Please wait.",
        variant: "destructive",
      });
      return;
    }

    setOutput("");
    setOutIsError(false);

    pythonThread.callbackStdout = (outputText: string) => {
      setOutput(prev => prev + outputText);
      setOutIsError(false);
    };
    pythonThread.callbackStderr = (errorText: string) => {
      setOutput(prev => prev + errorText);
      setOutIsError(true);
    };
    pythonThread.callbackExecEnd = () => {
      setIsRunning(false);
    };

    try {
      setIsRunning(true);
      pythonThread.startPythonExecution(pythonCode);
    } catch (error) {
      console.error("Error running Python code:", error);
      setOutput(`Error: ${error}`);
      setIsRunning(false);
    }
  };

  const handleSelectExample = (exampleCode: string) => {
    setCurrentMode("run");
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


  const handleModeChange = useCallback((mode: Mode) => {
    setCurrentMode(mode);
    setConversionCode("");

  }, []);

  const handleConversion = useCallback(async (inputCode: string): Promise<string> => {
    if (currentMode === "jac2py") {
      return await convertJacToPython(inputCode);
    } else if (currentMode === "py2jac") {
      return await convertPythonToJac(inputCode);
    }
    throw new Error("Invalid conversion mode");
  }, [currentMode]);

  const handleDebugAction = useCallback(async (action: DebugAction) => {
    switch (action) {

      case "toggle":
        setCurrentMode(prev => prev === "debug" ? "run" : "debug");
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
        toast({
          title: "Execution Stopped",
          description: "Execution has been stopped.",
        });
        codeEditorRef.current?.clearExecutionLine();
        break;
    }
  }, [currentMode, breakpoints, pythonThread, loaded, isRunning, code, toast]);


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
                {(currentMode === "run" || currentMode === "debug") && (
                  <Button
                    onClick={runJacCode}
                    disabled={isRunning || !loaded}
                    className="space-x-1 bg-primary hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4" />
                    <span>{currentMode === "debug" ? "Debug" : "Run"}</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
                
                <ModeSelector
                  currentMode={currentMode}
                  onModeChange={handleModeChange}
                />
              </div>
              
              {/* Environment Status Indicator - Right aligned */}
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${loaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="text-muted-foreground">
                  {loaded ? 'Environment Ready' : 'Loading Environment...'}
                </span>
              </div>
            </div>

            {currentMode === "debug" && (
              <DebugControls
                isDebugging={true}
                isPaused={true}
                onDebugAction={handleDebugAction}
              />
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                {/* Render different layouts based on current mode */}
                {(currentMode === "run" || currentMode === "debug") && (
                  <div className="h-full">
                    {currentMode === "debug" ? (
                      <ResizablePanelGroup direction="horizontal" className="h-full">
                        <UIResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                          <CodeEditor
                            ref={codeEditorRef}
                            value={code}
                            onChange={setCode}
                            className="h-full"
                            onBreakpointsChange={handleBreakpointsChange}
                            onRunCode={runJacCode}
                            onToggleDebug={() => handleDebugAction("toggle")}
                          />
                        </UIResizablePanel>
                        
                        <ResizableHandle withHandle />
                        
                        <UIResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                          <DebugPanel
                            graph={graph}
                            debugStatus={isRunning}
                            className="h-full"
                          />
                        </UIResizablePanel>
                      </ResizablePanelGroup>
                    ) : (
                      <CodeEditor
                        ref={codeEditorRef}
                        value={code}
                        onChange={setCode}
                        className="h-full"
                        onBreakpointsChange={handleBreakpointsChange}
                        onRunCode={runJacCode}
                        onToggleDebug={() => handleDebugAction("toggle")}
                      />
                    )}
                  </div>
                )}

                {(currentMode === "jac2py" || currentMode === "py2jac") && (
                  <ConversionPanel
                    mode={currentMode}
                    inputCode={conversionCode}
                    onInputChange={setConversionCode}
                    onConvert={handleConversion}
                    onRunJac={handleRunJac}
                    onRunPython={handleRunPython}
                    className="h-full"
                  />
                )}
              </div>

              {(currentMode === "run" || currentMode === "debug" || currentMode === "jac2py" || currentMode === "py2jac") && (
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
              )}
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
