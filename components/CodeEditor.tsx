import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { CodeLanguage } from '../types';

interface CodeEditorProps {
  language: CodeLanguage;
  value: string;
  onChange: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, value, onChange }) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Configure editor settings for better experience
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', monospace",
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: true,
    });
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          padding: { top: 16, bottom: 16 },
          cursorBlinking: 'smooth',
          smoothScrolling: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;