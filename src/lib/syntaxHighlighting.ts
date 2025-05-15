export async function loadSyntax(monaco: any, editor: any, value: any) {
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

  const uri = monaco.Uri.parse("inmemory://model.jac");
  const model = monaco.editor.createModel(value, "jac", uri);
  editor.setModel(model);
  await wireTmGrammars(monaco, registry, grammars, editor);
  return grammerConfig;
}


export async function configureTheme(monaco: any, grammerConfig: any) {
  monaco.languages.setLanguageConfiguration("jac", grammerConfig);
  monaco.editor.defineTheme("jac-theme", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "storage.type.class.jac", foreground: "569CD6" },
      { token: "storage.type.function.jac", foreground: "569CD6" },
      { token: "keyword.control.flow.jac", foreground: "C678DD" },
      { token: "entity.name.type.class.jac", foreground: "3ac9b0" },
    ],
    colors: {
      "editor.foreground": "#FFFFFF",
    }
  });
  monaco.editor.setTheme("jac-theme");
  console.log("Jac language successfully registered");
}