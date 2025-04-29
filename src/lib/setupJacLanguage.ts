import * as monaco from 'monaco-editor';
import { Registry } from 'monaco-textmate';
import { loadWASM } from 'vscode-oniguruma';
import { wireTmGrammars } from 'monaco-editor-textmate';

export async function setupJacHighlighter(editor: monaco.editor.IStandaloneCodeEditor) {

    const wasmArrayBuffer = await fetch('onig.wasm').then(r => r.arrayBuffer());
    await loadWASM(wasmArrayBuffer);

    const registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
            if (scopeName === 'source.jac') {
                const grammar = await fetch('jac.tmLanguage.json').then(r => r.json());
                return {
                    format: 'json',
                    content: grammar,
                };
            }
            return null;
        },
    });

    // Register Jac language
    monaco.languages.register({ id: 'jac' });

    // Basic tokenizer fallback (required by Monaco, even if using TextMate later)
    monaco.languages.setMonarchTokensProvider('jac', {
        tokenizer: { root: [[/.*/, '']] }
    });

    const grammars = new Map()
    grammars.set('jac', 'source.jac');

    await wireTmGrammars(monaco, registry, grammars, editor);
}
