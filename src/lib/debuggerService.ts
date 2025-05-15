export async function lineHighlighter(
    editorRef: any,
    monacoRef: any,
    executionLineRef: any,
    executionLineDecorationsRef: any,
    lineNumber: number) {

    if (!editorRef.current || !monacoRef.current) return;

    const monaco = monacoRef.current;
    const editor = editorRef.current;
    executionLineRef.current = lineNumber;

    const decoration = {
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
            isWholeLine: true,
            className: "current-line-highlight",
        },
    };

    executionLineDecorationsRef.current = editor.deltaDecorations(
        executionLineDecorationsRef.current,
        [decoration]
    );
}

export async function clearLineHighlighter(
    editorRef: any,
    executionLineDecorationsRef: any,
    executionLineRef: any
) {
    if (!editorRef.current) return;

    executionLineDecorationsRef.current = editorRef.current.deltaDecorations(
        executionLineDecorationsRef.current,
        []
    );
    executionLineRef.current = null;
}