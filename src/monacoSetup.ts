import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

import 'monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution';

self.MonacoEnvironment = {
  getWorker(_moduleId?: string, label?: string) {
    if (label === 'json') return new jsonWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });
