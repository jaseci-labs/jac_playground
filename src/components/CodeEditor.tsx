import { useRef, useCallback, useEffect } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
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
  className,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const textMateLoaded = useRef(false);

  const registerJacLanguage = useCallback(async (monaco: any, editor: any) => {
    if (textMateLoaded.current) return;

    try {
      const { loadWASM } = await import("onigasm");
      const { Registry } = await import("monaco-textmate");
      const { wireTmGrammars } = await import("monaco-editor-textmate");

      monaco.languages.register({ id: "jac" });

      try {
        await loadWASM("/onigasm.wasm");
      } catch (e) {
        console.warn("WASM already loaded or failed to load:", e);
      }
      
      const response = await fetch("/jac.tmLanguage.json");
      const grammerConfigRes = await fetch("/language-configuration.json");
      const jacGrammar = await response.json();
      const grammerConfig = await grammerConfigRes.json();

      const registry = new Registry({
        getGrammarDefinition: async () => ({
          format: "json",
          content: jacGrammar,
        }),
      });

      const grammars = new Map();
      grammars.set("jac", "source.jac");

      // Create a model with the proper URI to apply grammar
      const uri = monaco.Uri.parse("inmemory://model.jac");
      const model = monaco.editor.createModel(value, "jac", uri);
      editor.setModel(model);

      await wireTmGrammars(monaco, registry, grammars, editor);

      monaco.languages.setLanguageConfiguration("jac", grammerConfig);

      console.log("Jac language successfully registered");
      textMateLoaded.current = true;
    } catch (error) {
      console.error("Failed to register Jac language:", error);
    }
  }, []);

  const handleEditorDidMount: OnMount = useCallback(
    async (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      await registerJacLanguage(monaco, editor);
      editor.focus();
    },
    [registerJacLanguage]
  );

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
        language="jac"
        value={value}
        theme="vs-dark"
        onChange={(val) => onChange(val || "")}
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
