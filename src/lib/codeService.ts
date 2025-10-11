let globalPythonThread: any = null;

export function setPythonThread(pythonThread: any) {
  globalPythonThread = pythonThread;
}

// Conversion service for Jac to Python using actual jaclang
export async function convertJacToPython(jacCode: string): Promise<string> {
  if (!jacCode.trim()) {
    throw new Error("No Jac code provided");
  }
  
  if (!globalPythonThread || !globalPythonThread.loaded) {
    throw new Error("Python environment not ready");
  }
  
  return new Promise((resolve, reject) => {
    const originalStdout = globalPythonThread.callbackStdout;
    const originalStderr = globalPythonThread.callbackStderr;
    
    // Temporarily disable output callbacks to prevent conversion output from appearing in output panel
    globalPythonThread.callbackStdout = null;
    globalPythonThread.callbackStderr = null;
    
    globalPythonThread.callbackConversionResult = (result: string) => {
      // Restore original callbacks
      globalPythonThread.callbackStdout = originalStdout;
      globalPythonThread.callbackStderr = originalStderr;
      
      if (result.startsWith("// Error")) {
        reject(new Error(result.replace("// Error during conversion:\n// ", "")));
      } else {
        resolve(result);
      }
    };
    
    globalPythonThread.startConversion('jac2lib', jacCode);
    
    setTimeout(() => {
      // Restore original callbacks on timeout too
      globalPythonThread.callbackStdout = originalStdout;
      globalPythonThread.callbackStderr = originalStderr;
      reject(new Error("Conversion timeout - operation took too long"));
    }, 30000);
  });
}

// Conversion service for Python to Jac using actual jaclang
export async function convertPythonToJac(pythonCode: string): Promise<string> {
  if (!pythonCode.trim()) {
    throw new Error("No Python code provided");
  }
  
  if (!globalPythonThread || !globalPythonThread.loaded) {
    throw new Error("Python environment not ready");
  }
  
  return new Promise((resolve, reject) => {
    // Store original callbacks
    const originalStdout = globalPythonThread.callbackStdout;
    const originalStderr = globalPythonThread.callbackStderr;
    
    // Temporarily disable output callbacks to prevent conversion output from appearing in output panel
    globalPythonThread.callbackStdout = null;
    globalPythonThread.callbackStderr = null;
    
    globalPythonThread.callbackConversionResult = (result: string) => {
      // Restore original callbacks
      globalPythonThread.callbackStdout = originalStdout;
      globalPythonThread.callbackStderr = originalStderr;
      
      if (result.startsWith("// Error")) {
        reject(new Error(result.replace("// Error during conversion:\n// ", "")));
      } else {
        resolve(result);
      }
    };
    
    globalPythonThread.startConversion('py2jac', pythonCode);
    
    setTimeout(() => {
      // Restore original callbacks on timeout too
      globalPythonThread.callbackStdout = originalStdout;
      globalPythonThread.callbackStderr = originalStderr;
      reject(new Error("Conversion timeout - operation took too long"));
    }, 30000);
  });
}
