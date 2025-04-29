
import { useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { setupJacHighlighter } from "@/lib/setupJacLanguage";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "jac",
  className,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = useCallback(async (editor, monaco) => {
    editorRef.current = editor;

    if (language === "jac") {
      await setupJacHighlighter(editor);
    }

    editor.focus();
  }, [language]);

  return (
    <div className={cn("h-full w-full overflow-hidden", className)}>
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="jac"
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
