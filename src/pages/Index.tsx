declare var loadPyodide: any;

import { useState, useEffect, useCallback } from "react";
import { Play, RefreshCw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/CodeEditor";
import { OutputPanel } from "@/components/OutputPanel";
import { ExamplesSidebar } from "@/components/ExamplesSidebar";
import { ResizablePanel } from "@/components/ResizablePanel";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { defaultCode } from "@/lib/examples";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { DebugPanel, DebugState } from "@/components/DebugPanel";
import { DebugControls, DebugAction } from "@/components/DebugControls";
import { useToast } from "@/hooks/use-toast";
import jacLogo from "/jaseci.png";
import { set } from "date-fns";

const Index = () => {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [pyodide, setPyodide] = useState(null);
  const [loaded, setloaded] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugState, setDebugState] = useState<DebugState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useMobileDetect();
  const { toast } = useToast();

  useEffect(() => {
    const loadPyodideAndJacLang = async () => {
      try {
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
          cache: true,
        });

        const response = await fetch("/jaclang.zip");
        const buffer = await response.arrayBuffer();
        const data = new Uint8Array(buffer);

        // Write the zip file to Pyodide's filesystem
        await pyodideInstance.FS.writeFile("/jaclang.zip", data);

        // Extract JacLang files
        await pyodideInstance.runPythonAsync(`
import shutil
import zipfile
import os

with zipfile.ZipFile("/jaclang.zip", "r") as zip_ref:
    zip_ref.extractall("/jaclang")

os.sys.path.append("/jaclang")
print("JacLang files loaded!")
`);
        // Check if JacLang is installed
        try {
          await pyodideInstance.runPythonAsync(`
from jaclang.cli.cli import run
print("JacLang is available!")
          `);
        } catch (validationError) {
          console.error("JacLang is not available:", validationError);
        }

        setPyodide(pyodideInstance);
        setloaded(true);
      } catch (error) {
        console.error('Error loading Pyodide or JacLang:', error);
      } finally {
      }
    };

    if (!pyodide) {
      loadPyodideAndJacLang();
    }
  }, [pyodide]);


  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        setloaded(false);
      }, 1500);
    }
  }, [loaded])

  const runJacCode = async () => {
    if (!pyodide) return;
    setIsRunning(true);
    setOutput('');
    const safeCode = JSON.stringify(code);

    try {
      await pyodide.runPythonAsync(`
import os
import sys

jac_code = ${safeCode}
with open("/tmp/temp.jac", "w") as f:
    f.write(jac_code)

# Backup actual file descriptors
stdout_fd = sys.stdout.fileno()
stderr_fd = sys.stderr.fileno()
saved_stdout = os.dup(stdout_fd)
saved_stderr = os.dup(stderr_fd)

with open("/tmp/jac_output.log", "w") as log_file:
    os.dup2(log_file.fileno(), stdout_fd)
    os.dup2(log_file.fileno(), stderr_fd)

    try:
        run("/tmp/temp.jac")
    except Exception:
        import traceback
        traceback.print_exc(file=log_file)

os.dup2(saved_stdout, stdout_fd)
os.dup2(saved_stderr, stderr_fd)
os.close(saved_stdout)
os.close(saved_stderr)
      `);

      // Now read the output log using Pyodide FS API
      const outputBuffer = pyodide.FS.readFile("/tmp/jac_output.log");
      const outputText = new TextDecoder().decode(outputBuffer);

      setOutput(outputText || "No output");
      setIsRunning(false);
    } catch (error) {
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

  const handleDebugAction = useCallback(async (action: DebugAction) => {
    if (action === "toggle") {
      setIsDebugging(prev => !prev);
    }
  }, []);
  
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
                      value={code}
                      onChange={setCode}
                      language="jac"
                      // breakpoints={breakpoints}
                      // onToggleBreakpoint={handleToggleBreakpoint}
                      className="h-full"
                    />
                  </div>
                  {
                    isDebugging && (
                      <div className="flex-1">
                        <DebugPanel
                          debugState={debugState}
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
                  isLoading={isRunning}
                  // isDebugging={isDebugging}
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
