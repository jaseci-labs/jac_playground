import os
import sys


# If these variables are not set by the pyodide this will raise an exception.
SAFE_CODE = globals()["SAFE_CODE"]
JAC_PATH  = globals()["JAC_PATH"]
LOG_PATH  = globals()["LOG_PATH"]
Debugger  = globals()["Debugger"]


with open(JAC_PATH, "w") as f:
    f.write(SAFE_CODE)

# Backup actual file descriptors.
stdout_fd = sys.stdout.fileno()
stderr_fd = sys.stderr.fileno()
saved_stdout = os.dup(stdout_fd)
saved_stderr = os.dup(stderr_fd)

with open(LOG_PATH, "w") as log_file:
    os.dup2(log_file.fileno(), stdout_fd)
    os.dup2(log_file.fileno(), stderr_fd)

    try:
        code = f"from jaclang.cli.cli import run\nrun('{JAC_PATH}')"
        debugger = Debugger(code=code, filepath=JAC_PATH)
        debugger.do_run()
    except Exception:
        import traceback
        traceback.print_exc(file=log_file)

# Restore actual file descriptors.
os.dup2(saved_stdout, stdout_fd)
os.dup2(saved_stderr, stderr_fd)
os.close(saved_stdout)
os.close(saved_stderr)