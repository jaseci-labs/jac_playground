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
    globalPythonThread.callbackConversionResult = (result: string) => {
      if (result.startsWith("// Error")) {
        reject(new Error(result.replace("// Error during conversion:\n// ", "")));
      } else {
        resolve(result);
      }
    };
    
    globalPythonThread.startConversion('jac2lib', jacCode);
    
    setTimeout(() => {
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
    globalPythonThread.callbackConversionResult = (result: string) => {
      if (result.startsWith("// Error")) {
        reject(new Error(result.replace("// Error during conversion:\n// ", "")));
      } else {
        resolve(result);
      }
    };
    
    globalPythonThread.startConversion('py2jac', pythonCode);
    
    setTimeout(() => {
      reject(new Error("Conversion timeout - operation took too long"));
    }, 30000);
  });
}
