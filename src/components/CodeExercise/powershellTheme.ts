import type { editor } from 'monaco-editor';

export const powershellEditorTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'variable', foreground: '9CDCFE' },
    { token: 'operator', foreground: 'C586C0' },
  ],
  colors: {
    'editor.background': '#0c1e3a',
    'editor.foreground': '#f0f0f0',
    'editor.lineHighlightBackground': '#012456',
    'editor.selectionBackground': '#264f78',
    'editor.inactiveSelectionBackground': '#264f7855',
    'editorCursor.foreground': '#ffff00',
    'editorLineNumber.foreground': '#5a6d85',
    'editorLineNumber.activeForeground': '#a0b4cc',
    'editorWidget.background': '#02386e',
    'editorWidget.border': '#5ea8ff44',
    'input.background': '#001b36',
    'focusBorder': '#5ea8ff',
  },
};

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  language: 'powershell',
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "'Cascadia Code', 'Cascadia Mono', Consolas, 'Courier New', monospace",
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  automaticLayout: true,
  padding: { top: 8, bottom: 8 },
  renderLineHighlight: 'line',
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
  },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  folding: false,
  glyphMargin: false,
};
