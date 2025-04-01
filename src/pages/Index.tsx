
import { useState, useEffect, useCallback } from "react";
import { Play, RefreshCw, FileCode, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/CodeEditor";
import { OutputPanel } from "@/components/OutputPanel";
import { ExamplesSidebar } from "@/components/ExamplesSidebar";
import { ResizablePanel } from "@/components/ResizablePanel";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { defaultCode } from "@/lib/examples";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { useToast } from "@/hooks/use-toast";
import jacLogo from "/jaseci.png";

const Index = () => {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setloaded] = useState(false);
  const isMobile = useMobileDetect();
  const { toast } = useToast();


  useEffect(() => {
    const loadPyodideAndJacLang = async () => {
      setLoading(true);
      try {
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
          cache: true,
        });

        const response = await fetch("jaclang.zip");
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
        setLoading(false);
      }
    };

    if (!pyodide) {
      loadPyodideAndJacLang();
    }
  }, []);


  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        setloaded(false);
        setLoading(false);
      }, 1500);
    }
  }, [loaded])



  // Function to handle running JacLang code
  const runJacCode = async () => {
    if (!pyodide) return;
    setOutput('');
    const safeCode = JSON.stringify(code);
    try {
      const result = await pyodide.runPythonAsync(`
import sys
from io import StringIO

# Capture both stdout and stderr
captured_output = StringIO()
sys.stdout = captured_output
sys.stderr = captured_output

jac_code = ${safeCode}

# Create a temporary file using the input code and run it directly
with open("/tmp/temp.jac", "w") as f:
    f.write(jac_code)
run("/tmp/temp.jac")

# Get the captured output
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
captured_output.getvalue()
`);
      setOutput(result || "No output");
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

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        {/* Header */}
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
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Editor Toolbar */}
            <div className="h-12 border-b bg-card flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={runJacCode}
                  disabled={isRunning}
                  className="space-x-1 bg-primary hover:bg-primary/90"
                >
                  <Play className="h-4 w-4" />
                  <span>Run</span>
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

            {/* Editor and output panels */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Editor Section */}
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language="python" // Using Python as closest syntax to Jaclang
                  className="h-full"
                />
              </div>

              {/* Output Panel */}
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
                  className="h-full"
                />
              </ResizablePanel>
            </div>
          </div>

          {/* Sidebar - hidden on mobile until toggled */}
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
