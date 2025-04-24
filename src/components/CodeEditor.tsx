import { useRef, useCallback, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import "./CodeEditor.css";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  className,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const breakpointsRef = useRef<Set<number>>(new Set());
  const decorationIdsRef = useRef<string[]>([]);
  const decorationsCollectionRef = useRef<any>(null);
  
  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

    editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
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

        if (decorationsCollectionRef.current) {
          decorationsCollectionRef.current.set(newDecorations);
        } else {
          decorationsCollectionRef.current = editor.createDecorationsCollection(newDecorations);
        }
      }
    });
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
          fontSize: 14,
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
