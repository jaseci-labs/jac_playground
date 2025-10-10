import { ONIGASM_WASM_PATH, LANGUAGE_CONFIG_PATH } from "./assetPaths";

let wasmInitialized = false;
let languageRegistered = false;
let grammarLoaded = false;
let cachedGrammarConfig: any = null;

export async function loadSyntax(monaco: any, editor: any) {
// export async function loadSyntax(monaco: any, editor: any, value: any) {
  const { loadWASM } = await import("onigasm");
  const { Registry } = await import("monaco-textmate");
  const { wireTmGrammars } = await import("monaco-editor-textmate");

  if (!languageRegistered) {
    monaco.languages.register({ id: "jac" });
    languageRegistered = true;
  }

  if (!wasmInitialized) {
    try {
      await loadWASM(ONIGASM_WASM_PATH);
      wasmInitialized = true;
      console.log("WASM successfully loaded");
    } catch (e) {
      console.warn("Failed to load WASM:", e);
    }
  }

  if (!grammarLoaded) {
    const response = await fetch("https://raw.githubusercontent.com/jaseci-labs/jaseci/main/jac/support/vscode_ext/jac/syntaxes/jac.tmLanguage.json");
    const grammerConfigRes = await fetch(LANGUAGE_CONFIG_PATH);
    const jacGrammar = await response.json();
    cachedGrammarConfig = await grammerConfigRes.json();

    const registry = new Registry({
      getGrammarDefinition: async () => ({
        format: "json",
        content: jacGrammar,
      }),
    });
    const grammars = new Map();
    grammars.set("jac", "source.jac");

    // const uri = monaco.Uri.parse("inmemory://model.jac");
    // const model = monaco.editor.createModel(value, "jac", uri);
    // editor.setModel(model);
    await wireTmGrammars(monaco, registry, grammars, editor);
    grammarLoaded = true;
  }
  return cachedGrammarConfig;
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