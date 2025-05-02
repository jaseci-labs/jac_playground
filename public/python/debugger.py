import bdb
from typing import Callable

class Debugger(bdb.Bdb):

    def __init__(self, code: str, filepath: str):
        super().__init__()
        self.filepath = filepath
        self.code = code
        self.curframe = None

        # Callback after a breakpoint is hit.
        self.cb_break: Callable[[Debugger, int], None] = lambda dbg, lineno: None


    def user_line(self, frame):
        """Called when we stop or break at a line."""
        if self.curframe is None:
            self.set_continue()
        self.curframe = frame
        if self.stop_here(frame) or self.break_here(frame):
            self.cb_break(self, frame.f_lineno)

    # -------------------------------------------------------------------------
    # Public API.
    # -------------------------------------------------------------------------

    def set_breakpoint(self, lineno: int) -> None:
        self.set_break(self.filepath, lineno)

    def do_run(self) -> None:
        self.run(self.code)

    def do_continue(self) -> None:
        self.set_continue()

    def do_step_over(self) -> None:
        self.set_next(self.curframe)

    def do_step_into(self) -> None:
        self.set_step()

    def do_step_out(self) -> None:
        self.set_return(self.curframe)


"""
def cb_break(d: Debugger, lineno: int) -> None:
    global x
    print(f'Breakpoint hit at line {lineno}')

    while True:
        match input('> '):
            case 'c':
                d.do_continue()
                return
            case 'n':
                d.do_step_over()
                return
            case 's':
                d.do_step_into()
                return
            case 'r':
                d.do_step_out()
                return

            case 'e':
                expr = input('Expression: ')
                try:
                    result = d.runeval(expr, d.curframe.f_globals, d.curframe.f_locals)
                    print(f'Expression result: {result}')
                except Exception as e:
                    print(f'Error evaluating expression: {e}')

            # case 'q':
            #     d.set_quit()
            case _:
                print('Unknown command.')
                d.set_continue()
                return


d = Debugger('test.py')
d.set_breakpoint(15)

d.cb_break = cb_break
d.do_run()

"""