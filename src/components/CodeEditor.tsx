import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle, } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import "./CodeEditor.css";
import { configureTheme, loadSyntax } from "@/lib/syntaxHighlighting";
import { clearLineHighlighter, lineHighlighter } from "@/lib/debuggerService";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  language?: string;
  onBreakpointsChange?: (breakpoints: number[]) => void;
  onRunCode?: () => void; // Callback for Ctrl+Enter
  onToggleDebug?: () => void; // Callback for F5
}

export interface CodeEditorHandle {
  highlightExecutionLine: (line: number) => void;
  clearExecutionLine: () => void;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  ({ value, onChange, className, language = "jac", onBreakpointsChange, onRunCode, onToggleDebug }, ref) => {
    const editorRef = useRef<any>(null);
    const breakpointsRef = useRef<Set<number>>(new Set());
    const decorationsCollectionRef = useRef<any>(null);
    const executionLineRef = useRef<number | null>(null);
    const executionLineDecorationsRef = useRef<string[]>([]);
    const monacoRef = useRef<any>(null);
    const textMateLoaded = useRef(false);

    const registerJacLanguage = useCallback(async (monaco: any, editor: any) => {
      if (textMateLoaded.current) return;

      try {
        const grammerConfig = await loadSyntax(monaco, editor);
        await configureTheme(monaco, grammerConfig);
        textMateLoaded.current = true;
      } catch (error) {
        console.error("Failed to register Jac language:", error);
      }
    }, []);

    const highlightExecutionLine = useCallback(async (lineNumber: number) => {
      await lineHighlighter(
        editorRef,
        monacoRef,
        executionLineRef,
        executionLineDecorationsRef,
        lineNumber
      );
    }, []);

    const clearExecutionLine = useCallback(async () => {
      await clearLineHighlighter(
        editorRef,
        executionLineDecorationsRef,
        executionLineRef
      )
    }, []);

    const handleEditorDidMount: OnMount = useCallback(async (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      
      // Only register Jac language if we're using Jac
      if (language === "jac") {
        await registerJacLanguage(monaco, editor);
      }
      
      editor.focus();

      editor.onMouseDown((e) => {
        if (language === "jac" && e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
          const line = e.target.position?.lineNumber;
          if (!line) return;

          const breakpoints = breakpointsRef.current;
          if (breakpoints.has(line)) {
            breakpoints.delete(line);
          } else {
            breakpoints.add(line);
          }

          const newDecorations = Array.from(breakpoints).map((lineNum) => ({
            range: new monaco.Range(lineNum, 1, lineNum, 1),
            options: {
              isWholeLine: false,
              glyphMarginClassName: "myBreakPoint",
              glyphMarginHoverMessage: { value: "Breakpoint" },
            },
          }));

          if (onBreakpointsChange) {
            onBreakpointsChange(Array.from(breakpoints));
          }

          if (decorationsCollectionRef.current) {
            decorationsCollectionRef.current.set(newDecorations);
          } else {
            decorationsCollectionRef.current = editor.createDecorationsCollection(newDecorations);
          }
        }
      });

      // Add keyboard shortcuts
      // Only add Jac-specific keyboard shortcuts and context menu for Jac language
      if (language === "jac") {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
          onRunCode?.();
        });

        editor.addCommand(monaco.KeyCode.F5, () => {
          onToggleDebug?.();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.F5, () => {
          onRunCode?.();
        });

        // Add context menu actions
        editor.addAction({
          id: 'run-code',
          label: 'Run Code (Ctrl+Enter)',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
          contextMenuGroupId: '1_modification',
          contextMenuOrder: 1,
          run: () => onRunCode?.()
        });

        editor.addAction({
          id: 'toggle-debug',
          label: 'Toggle Debug Mode (F5)',
          keybindings: [monaco.KeyCode.F5],
          contextMenuGroupId: '2_debug',
          contextMenuOrder: 1,
          run: () => onToggleDebug?.()
        });
      }
    }, [language, registerJacLanguage, onRunCode, onToggleDebug]);


    useImperativeHandle(ref, () => ({
      highlightExecutionLine: (line) => highlightExecutionLine(line),
      clearExecutionLine: () => clearExecutionLine(),
    }));


    useEffect(() => {
      return () => {
        if (editorRef.current) {
          editorRef.current.dispose();
        }
      };
    }, []);


    return (
      <div className={cn("h-full w-full overflow-hidden", className)}>
        <Editor
          height="100%"
          width="100%"
          language={language}
          value={value}
          theme="vs-dark"
          onChange={(value) => onChange(value || "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 15,
            minimap: { enabled: false },
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            lineNumbers: "on",
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderLineHighlight: "all",
            tabSize: 2,
            fixedOverflowWidgets: true,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    );
  }
);

CodeEditor.displayName = "CodeEditor";
