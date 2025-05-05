
// ----------------------------------------------------------------------------
// Globals
// ----------------------------------------------------------------------------

var pyodide = null;
var breakpoints = [];

const JAC_PATH = "/tmp/main.jac";
const LOG_PATH = "/tmp/logs.log";
const DOT_PATH = "/home/pyodide/main.dot";

// ----------------------------------------------------------------------------
// Message passing protocol
// ----------------------------------------------------------------------------

onmessage = async (event) => {
  const data = event.data;
  switch (data.type) {

    case 'initialize':
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js");
      pyodide = await loadPyodide();
      const success = await loadPyodideAndJacLang();
      logMessage(`Pyodide and JacLang loaded: success=${success}`);
      self.postMessage({ type: 'initialized', success: success });
      break;

    case 'setBreakpoints':
      breakpoints = data.breakpoints;
      break;

    case 'startExecution':
      logMessage("Starting execution...");
      const output = await startExecution(data.code);
      logMessage(`Execution finished. output=${output}`);
      // TODO: No more needed here.
      self.postMessage({ type: 'stdout', output: output });
      self.postMessage({ type: 'execEnd' });
      break;

    default:
      console.error("Unknown message type:", data.type);
  }

};

// ----------------------------------------------------------------------------
// Utility functions
// ----------------------------------------------------------------------------

function logMessage(message) {
  console.log("[PythonThread] " + message);
}


async function readFileAsString(fileName) {
  const response = await fetch(fileName);
  return await response.text();
};


async function readFileAsBytes(fileName) {
  const response = await fetch("/jaclang.zip");
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}


// ----------------------------------------------------------------------------
// Jaclang Initialization
// ----------------------------------------------------------------------------

async function loadPyodideAndJacLang() {
  try {
    await loadPythonResources(pyodide);
    return await checkJaclangLoaded(pyodide);
  } catch (error) {
    console.error("Error loading JacLang:", error);
    return false;
  }
}


async function loadPythonResources(pyodide) {
  const data = await readFileAsBytes("/jaclang.zip");
  await pyodide.FS.writeFile("/jaclang.zip", data);
  await pyodide.runPythonAsync(
    await readFileAsString("/python/extract_jaclang.py")
  );
}


async function checkJaclangLoaded(pyodide) {
  try {
    await pyodide.runPythonAsync(`from jaclang.cli.cli import run`);
    console.log("JacLang is available.");
    return true;
  } catch (error) {
    console.error("JacLang is not available:", error);
    return false;
  }
}


// ----------------------------------------------------------------------------
// Execution
// ----------------------------------------------------------------------------

function callbackBreak(dbg, line) {
  dbg.clear_breakpoints();
  for (const bp of breakpoints) {
    dbg.set_breakpoint(bp);
  }
  self.postMessage({ type: 'breakHit', line: line });
}


function callbackStdout(output) {
  self.postMessage({ type: 'stdout', output: output });
}


function callbackStderr(output) {
  self.postMessage({ type: 'stderr', output: output });
}

function callbackDot(output) {
  self.postMessage({ type: 'execDot', output: output });
}


async function startExecution(safeCode) {

  pyodide.globals.set('SAFE_CODE', safeCode);
  pyodide.globals.set('JAC_PATH', JAC_PATH);
  pyodide.globals.set('LOG_PATH', LOG_PATH);
  pyodide.globals.set('DOT_PATH', DOT_PATH);
  pyodide.globals.set('CB_BREAK', callbackBreak);
  pyodide.globals.set('CB_STDOUT', callbackStdout);
  pyodide.globals.set('CB_STDERR', callbackStderr);
  pyodide.globals.set('CB_DOT', callbackDot);

  // Run the debugger module
  await pyodide.runPythonAsync(
    await readFileAsString("/python/debugger.py")
  );

  // Run the main script
  logMessage("Execution started.");
  await pyodide.runPythonAsync(
    await readFileAsString("/python/main.py")
  );
  logMessage("Execution finished.");

  // Now read the output log using Pyodide FS API
  const outputBuffer = pyodide.FS.readFile(LOG_PATH);
  const outputText = new TextDecoder().decode(outputBuffer);
  return outputText;
}
