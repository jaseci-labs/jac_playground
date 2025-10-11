let globalPythonThread: any = null;
type ConversionType = 'jac2lib' | 'py2jac';
const CONVERSION_TIMEOUT = 30000;

// Sets the global Python thread instance
export function setPythonThread(pythonThread: any) {
  globalPythonThread = pythonThread;
}

// Validates prerequisites before performing conversion
function validateConversionPrerequisites(code: string, codeType: string): void {
  if (!code.trim()) {
    throw new Error(`No ${codeType} code provided`);
  }
  
  if (!globalPythonThread || !globalPythonThread.loaded) {
    throw new Error("Python environment not ready");
  }
}

// Temporarily disables output callbacks to prevent conversion output from appearing in main output panel
function disableOutputCallbacks(): { stdout: any; stderr: any } {
  const originalCallbacks = {
    stdout: globalPythonThread.callbackStdout,
    stderr: globalPythonThread.callbackStderr
  };
  
  globalPythonThread.callbackStdout = null;
  globalPythonThread.callbackStderr = null;
  
  return originalCallbacks;
}


// Restores the original output callbacks
function restoreOutputCallbacks(originalCallbacks: { stdout: any; stderr: any }): void {
  globalPythonThread.callbackStdout = originalCallbacks.stdout;
  globalPythonThread.callbackStderr = originalCallbacks.stderr;
}

// Processes conversion result and handles errors
function processConversionResult(result: string): string {
  if (result.startsWith("// Error")) {
    throw new Error(result.replace("// Error during conversion:\n// ", ""));
  }
  return result;
}

// Generic conversion function that handles the common conversion logic
async function performConversion(
  code: string, 
  conversionType: ConversionType,
  codeTypeName: string
): Promise<string> {
  validateConversionPrerequisites(code, codeTypeName);
  
  return new Promise((resolve, reject) => {
    const originalCallbacks = disableOutputCallbacks();
    
    globalPythonThread.callbackConversionResult = (result: string) => {
      restoreOutputCallbacks(originalCallbacks);
      
      try {
        const processedResult = processConversionResult(result);
        resolve(processedResult);
      } catch (error) {
        reject(error);
      }
    };
    
    globalPythonThread.startConversion(conversionType, code);
    
    setTimeout(() => {
      restoreOutputCallbacks(originalCallbacks);
      reject(new Error("Conversion timeout - operation took too long"));
    }, CONVERSION_TIMEOUT);
  });
}

// Converts Jac code to Python using jaclang
export async function convertJacToPython(jacCode: string): Promise<string> {
  return performConversion(jacCode, 'jac2lib', 'Jac');
}

// Converts Python code to Jac using jaclang
export async function convertPythonToJac(pythonCode: string): Promise<string> {
  return performConversion(pythonCode, 'py2jac', 'Python');
}
