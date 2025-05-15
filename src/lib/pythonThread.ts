
/**
 *   Shared ints layout (communication protocol):
 *
 *   0:
 *      0 - python thread is waiting for input
 *      1 - python thread get input instruction from index 1
 *   1:
 *      1 - clear all breakpoints
 *      2 - set breakpoint line number in index 2
 *      3 - continue
 *      4 - step over
 *      5 - step into
 *      6 - step out
 *      7 - terminate
 *   2:
 *       line number for breakpoint / Or values for other instructions
 */

const SHARED_INT_SIZE = 3;

export class PythonThread {

  loaded: boolean = false;
  pythonThread: Worker;
  isRunning: boolean = false;
  sharedInts: Int32Array;

  // Callbacks for the browser ui.
  callbackLoaded: () => void;
  callbackExecEnd: () => void;
  callbackBreakHit: (line: number) => void;
  callbackStdout: (output: string) => void;
  callbackStderr: (output: string) => void;
  callbackJacGraph: (graph: string) => void;

  constructor(loadedCallback: () => void) {

    const sharedBuffer = new SharedArrayBuffer(4 * SHARED_INT_SIZE); // 4 bytes for one Int32
    this.sharedInts = new Int32Array(sharedBuffer);

    this.pythonThread = new Worker('/python/python.js');

    this.callbackLoaded = loadedCallback;
    this.pythonThread.onmessage = this.messageHandler.bind(this);
    this.pythonThread.postMessage({ type: 'initialize', sharedBuffer: sharedBuffer });
  }

  // ---------------------------------------------------------
  // Public methods.
  // ---------------------------------------------------------

  setBreakpoints(breakpoints: number[]) {
    this.logMessage(`Setting breakpoints: ${breakpoints}`);
    // If not running, we send this message to buffer the breakpoints
    // which will be set when the execution starts.
    if (!this.isRunning) {
      this.pythonThread.postMessage({
        type: 'setBreakpoints',
        breakpoints: breakpoints,
      });
    } else {

      // If running, we need to clear all breakpoints first and then set the new ones.
      this.sharedInts[0] = 1;
      this.sharedInts[1] = 1; // Clear all breakpoints
      Atomics.notify(this.sharedInts, 0, 1);

      for (const bp of breakpoints) {
        this.sharedInts[0] = 1;
        this.sharedInts[1] = 2;  // Set breakpoint
        this.sharedInts[2] = bp; // Line number
        Atomics.notify(this.sharedInts, 0, 1);
      }

    }
  }

  startExecution(code: string) {
    this.logMessage("Starting execution");
    this.pythonThread.postMessage({
      type: 'startExecution',
      code: code,
    });
    this.isRunning = true;
  }

  continueExecution() {
    this.logMessage("Continuing execution");
    this.sharedInts[0] = 1;
    this.sharedInts[1] = 3;
    Atomics.notify(this.sharedInts, 0, 1);
  }

  stepOver() {
    this.logMessage("Stepping over");
    this.sharedInts[0] = 1;
    this.sharedInts[1] = 4;
    Atomics.notify(this.sharedInts, 0, 1);
  }

  stepInto() {
    this.logMessage("Stepping into");
    this.sharedInts[0] = 1;
    this.sharedInts[1] = 5;
    Atomics.notify(this.sharedInts, 0, 1);
  }

  stepOut() {
    this.logMessage("Stepping out");
    this.sharedInts[0] = 1;
    this.sharedInts[1] = 6;
    Atomics.notify(this.sharedInts, 0, 1);
  }

  terminate() {
    this.isRunning = false;
    this.logMessage("Terminating");
    this.sharedInts[0] = 1;
    this.sharedInts[1] = 7;
    Atomics.notify(this.sharedInts, 0, 1);
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
        this.logMessage(`Initialized success=${data.success}`)
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
        this.logMessage("Execution ended");
        this.callbackExecEnd();
        this.isRunning = false;
        break;

      case 'jacGraph':
        this.logMessage('JacGraph received');
        if (this.callbackJacGraph !== undefined) {
          this.callbackJacGraph(data.graph);
        }
        break;

      default:
        console.warn('Unknown message type:', data.type);
        break;
    }

  }

}
