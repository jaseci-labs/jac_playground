
import { useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { cn } from "@/lib/utils";

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

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
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
          glyphMargin: false,
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
