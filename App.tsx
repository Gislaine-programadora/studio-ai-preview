import React, { useState, useEffect, useCallback } from 'react';
import { Code, Play, MessageSquare, Layout, FileCode, Settings, Share2, Search, GitBranch, Command } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import Preview from './components/Preview';
import AIChat from './components/AIChat';
import FileExplorer from './components/FileExplorer';
import Terminal from './components/Terminal';
import { CodeLanguage, FileNode, TerminalLine } from './types';
import { v4 as uuidv4 } from 'uuid';

// Utility to determine language from filename
const getLanguageFromFilename = (filename: string): CodeLanguage => {
  if (filename.endsWith('.html')) return CodeLanguage.HTML;
  if (filename.endsWith('.css')) return CodeLanguage.CSS;
  if (filename.endsWith('.js')) return CodeLanguage.JAVASCRIPT;
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return CodeLanguage.TYPESCRIPT;
  if (filename.endsWith('.json')) return CodeLanguage.JSON;
  return CodeLanguage.PLAINTEXT;
};

// Initial File System
const INITIAL_FILES: FileNode[] = [
  {
    id: 'root',
    name: 'root',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: '1',
        name: 'index.html',
        type: 'file',
        language: CodeLanguage.HTML,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Studio Code Editor</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Studio</h1>
        <p>Edit files in the explorer on the left.</p>
        <div id="output"></div>
        <button id="btn">Click Me</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: '2',
        name: 'style.css',
        type: 'file',
        language: CodeLanguage.CSS,
        content: `body {
    background-color: #1e1e1e;
    color: #d4d4d4;
    font-family: 'Segoe UI', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}
.container {
    text-align: center;
    background: #252526;
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid #3e3e42;
}
button {
    background: #007fd4;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
}
button:hover {
    background: #0060a0;
}`
      },
      {
        id: '3',
        name: 'script.js',
        type: 'file',
        language: CodeLanguage.JAVASCRIPT,
        content: `document.getElementById('btn').addEventListener('click', () => {
    const output = document.getElementById('output');
    output.innerHTML = '<p style="color: #4ec9b0">Hello from JavaScript!</p>';
    console.log("Button clicked!");
});`
      }
    ]
  }
];

function App() {
  // --- State ---
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(true);
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    { id: 'init', type: 'system', content: 'Welcome to Studio Editor Terminal v1.0.0' }
  ]);

  // --- Computed ---
  // Helper to find a file by ID in the tree
  const findFileById = useCallback((nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Helper to update a file's content
  const updateFileContent = (nodes: FileNode[], id: string, newContent: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, content: newContent };
      }
      if (node.children) {
        return { ...node, children: updateFileContent(node.children, id, newContent) };
      }
      return node;
    });
  };

  const activeFile = findFileById(files, activeFileId);

  // --- Handlers ---

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      setFiles(prev => updateFileContent(prev, activeFileId, value));
    }
  };

  const handleFileSelect = (file: FileNode) => {
    setActiveFileId(file.id);
    // Auto-detect language if not set (though we set it on creation)
    if (!file.language) {
        // logic could go here to update state, but we calculate it mostly
    }
  };

  const handleToggleFolder = (folderId: string) => {
    const toggleNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === folderId) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });
    };
    setFiles(prev => toggleNode(prev));
  };

  const toggleView = (view: 'preview' | 'chat') => {
    if (view === 'preview') {
      setShowPreview(true);
      setShowChat(false);
    } else {
      setShowChat(true);
      setShowPreview(false);
    }
  };

  // --- Terminal Logic ---

  const addTerminalLine = (type: TerminalLine['type'], content: string) => {
    setTerminalHistory(prev => [...prev, { id: Date.now().toString() + Math.random(), type, content }]);
  };

  const handleTerminalCommand = (cmdStr: string) => {
    addTerminalLine('input', cmdStr);
    const parts = cmdStr.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        addTerminalLine('output', 'Available commands: ls, cat <file>, touch <file>, mkdir <folder>, clear, whoami');
        break;
      case 'clear':
        setTerminalHistory([]);
        break;
      case 'whoami':
        addTerminalLine('output', 'frontend-dev-guru');
        break;
      case 'ls':
        // Simplify: just list root children for now or flatten logic.
        // For this demo, we list the children of the root folder.
        if (files[0].children) {
          const names = files[0].children.map(c => (c.type === 'folder' ? c.name + '/' : c.name)).join('  ');
          addTerminalLine('output', names);
        }
        break;
      case 'touch':
        if (!args[0]) {
          addTerminalLine('error', 'usage: touch <filename>');
          return;
        }
        const fileName = args[0];
        const newFile: FileNode = {
          id: Date.now().toString(),
          name: fileName,
          type: 'file',
          language: getLanguageFromFilename(fileName),
          content: ''
        };
        // Add to root for simplicity
        setFiles(prev => {
            const newRoot = { ...prev[0], children: [...(prev[0].children || []), newFile] };
            return [newRoot];
        });
        addTerminalLine('output', `Created file: ${fileName}`);
        break;
      case 'mkdir':
          if (!args[0]) {
            addTerminalLine('error', 'usage: mkdir <foldername>');
            return;
          }
          const dirName = args[0];
          const newDir: FileNode = {
            id: Date.now().toString(),
            name: dirName,
            type: 'folder',
            isOpen: true,
            children: []
          };
          setFiles(prev => {
            const newRoot = { ...prev[0], children: [...(prev[0].children || []), newDir] };
            return [newRoot];
        });
        addTerminalLine('output', `Created directory: ${dirName}`);
        break;
      case 'cat':
        if (!args[0]) {
            addTerminalLine('error', 'usage: cat <filename>');
            return;
        }
        const targetFile = files[0].children?.find(c => c.name === args[0] && c.type === 'file');
        if (targetFile) {
            addTerminalLine('output', targetFile.content || '(empty)');
        } else {
            addTerminalLine('error', `File not found: ${args[0]}`);
        }
        break;
      default:
        if (command.trim() !== '') {
            addTerminalLine('error', `Command not found: ${command}`);
        }
    }
  };

  // --- Preview Generation ---
  // Combine HTML, CSS, JS into one string for the preview
  const getFullCodeForPreview = () => {
    const htmlNode = files[0].children?.find(f => f.name === 'index.html');
    const cssNode = files[0].children?.find(f => f.name === 'style.css');
    const jsNode = files[0].children?.find(f => f.name === 'script.js');

    let html = htmlNode?.content || '';
    const css = cssNode?.content || '';
    const js = jsNode?.content || '';

    // Inject CSS
    if (css) {
        html = html.replace('</head>', `<style>${css}</style></head>`);
    }
    // Inject JS (rudimentary injection at end of body if body exists, else append)
    if (js) {
        if (html.includes('</body>')) {
            html = html.replace('</body>', `<script>${js}</script></body>`);
        } else {
            html += `<script>${js}</script>`;
        }
    }
    return html;
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-editor-bg text-editor-text overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="h-10 bg-[#1e1e1e] border-b border-[#1e1e1e] flex items-center justify-between px-3 select-none z-10">
        <div className="flex items-center gap-3">
           {/* Simulated Menu Bar */}
           <div className="flex items-center gap-2 mr-4">
             <div className="bg-blue-600 p-1 rounded">
                <Code className="w-4 h-4 text-white" />
             </div>
           </div>
           <div className="flex gap-4 text-sm text-gray-400">
             <span className="hover:text-white cursor-pointer">File</span>
             <span className="hover:text-white cursor-pointer">Edit</span>
             <span className="hover:text-white cursor-pointer">Selection</span>
             <span className="hover:text-white cursor-pointer">View</span>
             <span className="hover:text-white cursor-pointer">Go</span>
             <span className="hover:text-white cursor-pointer">Run</span>
             <span className="hover:text-white cursor-pointer">Terminal</span>
             <span className="hover:text-white cursor-pointer">Help</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-black/30 rounded-md p-0.5 gap-0.5">
            <button
              onClick={() => toggleView('preview')}
              className={`flex items-center gap-2 px-3 py-1 rounded-sm text-xs transition-colors ${
                showPreview ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Play className="w-3 h-3" /> Preview
            </button>
            <button
              onClick={() => toggleView('chat')}
              className={`flex items-center gap-2 px-3 py-1 rounded-sm text-xs transition-colors ${
                showChat ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" /> Assistant
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace - Flex Row */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. Activity Bar (Far Left Icons) */}
        <div className="w-12 flex flex-col items-center py-2 bg-[#333333] border-r border-black/20 gap-2 z-20">
           <div className="p-2 border-l-2 border-white cursor-pointer" title="Explorer">
             <FileCode className="w-6 h-6 text-white" />
           </div>
           <div className="p-2 opacity-50 hover:opacity-100 cursor-pointer" title="Search">
             <Search className="w-6 h-6 text-gray-300" />
           </div>
           <div className="p-2 opacity-50 hover:opacity-100 cursor-pointer" title="Source Control">
             <GitBranch className="w-6 h-6 text-gray-300" />
           </div>
           <div className="p-2 opacity-50 hover:opacity-100 cursor-pointer" title="Extensions">
             <Layout className="w-6 h-6 text-gray-300" />
           </div>
           <div className="flex-1" />
           <div className="p-2 opacity-50 hover:opacity-100 cursor-pointer" title="Settings">
             <Settings className="w-6 h-6 text-gray-300" />
           </div>
        </div>

        {/* 2. Sidebar (File Explorer) */}
        <div className="w-60 flex flex-col bg-[#252526] border-r border-black/20">
          <div className="h-9 px-4 flex items-center text-xs text-gray-400 font-semibold uppercase tracking-wide">
            Explorer
          </div>
          <FileExplorer 
            files={files[0].children || []} // Show content of root
            activeFileId={activeFileId} 
            onFileSelect={handleFileSelect}
            onToggleFolder={handleToggleFolder}
          />
        </div>

        {/* 3. Main Editor Area & Terminal (Vertical Column) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
           {/* Tab Bar */}
           <div className="flex h-9 bg-[#2d2d2d] overflow-x-auto no-scrollbar">
              {files[0].children?.filter(f => f.type === 'file').map(file => (
                <div 
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`
                        flex items-center px-3 min-w-[120px] max-w-[200px] border-r border-[#1e1e1e] cursor-pointer select-none text-sm
                        ${activeFileId === file.id ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2d2e]'}
                    `}
                >
                    <span className="mr-2">
                        <FileCode className={`w-3 h-3 ${activeFileId === file.id ? 'text-yellow-400' : 'text-gray-500'}`} />
                    </span>
                    <span className="truncate flex-1">{file.name}</span>
                    {activeFileId === file.id && (
                        <span className="hover:bg-gray-700 rounded p-0.5 ml-1">
                            <Settings className="w-3 h-3" />
                        </span>
                    )}
                </div>
              ))}
           </div>

           {/* Editor Content */}
           <div className="flex-1 relative">
              {activeFile ? (
                  <CodeEditor 
                    language={activeFile.language || CodeLanguage.PLAINTEXT} 
                    value={activeFile.content || ''} 
                    onChange={handleCodeChange} 
                  />
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                      Select a file to edit
                  </div>
              )}
           </div>

           {/* Terminal Panel */}
           <Terminal 
             history={terminalHistory} 
             onCommand={handleTerminalCommand}
             isOpen={isTerminalOpen}
             onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
           />
        </div>

        {/* 4. Right Pane (Preview or AI) */}
        {(showPreview || showChat) && (
          <div className="w-[40%] h-full border-l border-black/20 flex flex-col bg-white relative z-0">
            {/* Drag Handle (Visual Only for now) */}
            <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500/50 z-10" />
            
            {showPreview && <Preview code={getFullCodeForPreview()} />}
            {showChat && <AIChat currentCode={activeFile?.content || ''} />}
          </div>
        )}
      </div>
      
      {/* Bottom Status Bar */}
      <div className="h-6 bg-[#007fd4] text-white text-xs flex items-center px-3 justify-between select-none z-20">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
             <GitBranch className="w-3 h-3" />
             <span>main*</span>
          </div>
          <div className="hover:bg-white/20 px-1 rounded cursor-pointer">
             0 errors, 0 warnings
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hover:bg-white/20 px-1 rounded cursor-pointer flex items-center gap-1">
             <span>{activeFile?.language ? activeFile.language.toUpperCase() : 'TXT'}</span>
          </div>
          <div className="hover:bg-white/20 px-1 rounded cursor-pointer">
             <span>UTF-8</span>
          </div>
          <div className="hover:bg-white/20 px-1 rounded cursor-pointer">
             <span>Prettier</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;