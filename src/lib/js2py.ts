
import { readFileAsBytes, readFileAsString } from "./utils";


// This is loaded from a CDN, so it should be available in the browser context.
declare var loadPyodide: any;

const JAC_PATH = "/tmp/main.jac";
const LOG_PATH = "/tmp/logs.log";


// -----------------------------------------------------------------
// Public functions.
// -----------------------------------------------------------------

export async function loadPyodideAndJacLang() {
  const pyodideInstance = await loadPydiodeInstance();
  await loadPythonResources(pyodideInstance);
  if (await checkJaclangLoaded(pyodideInstance)) {
    return pyodideInstance;
  }
  return null;
}


export async function startExecution(pyodide, safeCode: string) {

  pyodide.globals.set('SAFE_CODE', safeCode);
  pyodide.globals.set('JAC_PATH', JAC_PATH);
  pyodide.globals.set('LOG_PATH', LOG_PATH);

  // Run the debugger module
  await pyodide.runPythonAsync(
    await readFileAsString("/python/debugger.py")
  );

  // Run the main script
  await pyodide.runPythonAsync(
    await readFileAsString("/python/main.py")
  );

  // Now read the output log using Pyodide FS API
  const outputBuffer = pyodide.FS.readFile(LOG_PATH);
  const outputText = new TextDecoder().decode(outputBuffer);
  return outputText;
}


// -----------------------------------------------------------------
// Internal functions.
// -----------------------------------------------------------------

async function loadPydiodeInstance() {
    const pyodideInstance = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
        cache: true,
    });
    return pyodideInstance;
}


async function loadPythonResources(pyodideInstance) {
    const data = await readFileAsBytes("/jaclang.zip");
    await pyodideInstance.FS.writeFile("/jaclang.zip", data);
    await pyodideInstance.runPythonAsync(
        await readFileAsString("/python/extract_jaclang.py")
    );
}


async function checkJaclangLoaded(pyodideInstance): Promise<boolean> {
    try {
        await pyodideInstance.runPythonAsync(`from jaclang.cli.cli import run`);
        return true;
    } catch (error) {
        console.error("JacLang is not available:", error);
        return false;
    }
}
