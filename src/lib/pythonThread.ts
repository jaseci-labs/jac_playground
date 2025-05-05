

export class PythonThread {

  loaded: boolean = false;
  pythonThread: Worker;

  // Callbacks for the browser ui.
  callbackLoaded: () => void;
  callbackExecEnd: () => void;
  callbackBreakHit: (line: number) => void;
  callbackStdout: (output: string) => void;
  callbackStderr: (output: string) => void;
  callbackDot: (output: string) => void;

  constructor(loadedCallback: () => void) {
    this.pythonThread = new Worker('/python/python.js');
    this.callbackLoaded = loadedCallback;
    this.pythonThread.onmessage = this.messageHandler.bind(this);
    this.pythonThread.postMessage({ type: 'initialize' });
  }

  // ---------------------------------------------------------
  // Public methods.
  // ---------------------------------------------------------

  setBreakpoints(breakpoints: number[]) {
    this.logMessage("Starting execution");
    console.log("[jsthread] Setting breakpoints:", breakpoints);
    this.pythonThread.postMessage({
      type: 'setBreakpoints',
      breakpoints: breakpoints,
    });
  }

  startExecution(code: string) {
    this.logMessage("Starting execution");
    this.pythonThread.postMessage({
      type: 'startExecution',
      code: code,
    });
  }

  terminate() {
    this.pythonThread.terminate();
  }

  // ---------------------------------------------------------
  // Internal methods.
  // ---------------------------------------------------------

  logMessage(message) {
    console.log("[JsThread] " + message);
  }

  messageHandler(event) {
    const data = event.data;

    switch (data.type) {
      case 'initialized':
        console.log(`[JsThread] Initialized success=${data.success}`);
        if (data.success) {
          this.loaded = true;
          this.callbackLoaded();
        }
        break;

      case 'breakHit':
        if (this.callbackBreakHit !== undefined) {
          this.callbackBreakHit(data.line);
        }
        break;

      case 'stdout':
        if (this.callbackStdout !== undefined) {
          this.callbackStdout(data.output);
        }
        break;

      case 'stderr':
        if (this.callbackStderr !== undefined) {
          this.callbackStderr(data.output);
        }
        break;

      case 'execEnd':
        console.log('[JsThread] Execution result got');
        this.callbackExecEnd();
        break;

      default:
        console.warn('Unknown message type:', data.type);
        break;
    }

  }

}
