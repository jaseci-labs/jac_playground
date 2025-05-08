import bdb

import sys
from typing import Callable

class Debugger(bdb.Bdb):


    def __init__(self):
        super().__init__()
        self.filepath: str = ""
        self.code: str = ""
        self.curframe = None
        self.breakpoint_buff = []

        self.cb_break: Callable[[Debugger, int], None] = lambda dbg, lineno: None
        self.cb_graph: Callable[[str], None] = lambda graph: None


    def set_code(self, code: str, filepath: str) -> None:
        self.filepath = filepath
        self.code = code
        self.curframe = None
        self.clear_breakpoints()


    def user_line(self, frame):
        """Called when we stop or break at a line."""
        self._send_graph()
        if self.curframe is None:
            self.set_continue()
            self.curframe = frame
        else:
            self.curframe = frame
            self.cb_break(self, frame.f_lineno)


    def _send_graph(self) -> None:
        try:
            graph_str = self.runeval("dotgen(as_json=True)")
            self.cb_graph(graph_str)
            self.set_trace()
        except Exception as e:
            print(str(e), file=sys.stderr)

    # -------------------------------------------------------------------------
    # Public API.
    # -------------------------------------------------------------------------

    def set_breakpoint(self, lineno: int) -> None:
        if not self.filepath:
            self.breakpoint_buff.append(lineno)
        else:
            self.set_break(self.filepath, lineno)

    def clear_breakpoints(self) -> None:
        self.clear_all_breaks()

    def do_run(self) -> None:
        for lineno in self.breakpoint_buff:
            self.set_break(self.filepath, lineno)
        self.breakpoint_buff.clear()
        self.run(self.code)

    def do_continue(self) -> None:
        self.set_continue()

    def do_step_over(self) -> None:
        self.set_next(self.curframe)

    def do_step_into(self) -> None:
        self.set_step()

    def do_step_out(self) -> None:
        self.set_return(self.curframe)

    def do_terminate(self) -> None:
        self.set_quit()

