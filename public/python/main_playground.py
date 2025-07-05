import io
import contextlib
import bdb

# If these variables are not set by the pyodide this will raise an exception.
SAFE_CODE = globals()["SAFE_CODE"]
JAC_PATH  = globals()["JAC_PATH"]
CB_STDOUT = globals()["CB_STDOUT"]
CB_STDERR = globals()["CB_STDERR"]
debugger  = globals()["debugger"]

# Redirect stdout and stderr to javascript callback.
class JsIO(io.StringIO):
    def __init__(self, callback, *args, **kwargs):
        self.callback = callback
        super().__init__(*args, **kwargs)

    def write(self, s: str, /) -> int:
        self.callback(s)
        super().write(s)
        return 0

    def writelines(self, lines, /) -> None:
        for line in lines:
            self.callback(line)
        super().writelines(lines)


with open(JAC_PATH, "w") as f:
    f.write(SAFE_CODE)

# Import our custom exception for better error handling
try:
    exec("from debugger import DebuggerTerminated", globals())
except:
    # Fallback if import fails
    class DebuggerTerminated(Exception):
        pass


with contextlib.redirect_stdout(JsIO(CB_STDOUT)), \
        contextlib.redirect_stderr(JsIO(CB_STDERR)):

    try:
        code = \
        "from jaclang.cli.cli import run\n" \
        f"run('{JAC_PATH}')\n"
        # Ensure printgraph is imported and available
        exec("from jaclang.cli.cli import printgraph", globals())
        debugger.set_code(code=code, filepath=JAC_PATH)
        debugger.do_run()

    except DebuggerTerminated:
        # Handle our custom termination exception
        print("Debug session ended by user.")
    except SystemExit:
        # Handle clean debugger termination
        print("Execution stopped by user.")
    except Exception as e:
        # Check for other termination-related errors
        if "terminated" in str(e).lower():
            print("Execution terminated by user.")
        elif "not a directory" in str(e).lower() or "no such file" in str(e).lower():
            # Handle the specific bdb.py errors that occur in Pyodide
            print("Debug session ended.")
        else:
            import traceback
            traceback.print_exc()
