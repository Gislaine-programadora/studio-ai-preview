import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minus } from 'lucide-react';
import { TerminalLine } from '../types';

interface TerminalProps {
  history: TerminalLine[];
  onCommand: (command: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ history, onCommand, isOpen, onToggle }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommand(input);
      setInput('');
    }
  };

  // Focus input when clicking anywhere in the terminal body
  const handleContainerClick = () => {
    // Don't steal focus if selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
        <div 
          onClick={onToggle}
          className="h-6 bg-blue-600 text-white text-xs flex items-center px-4 border-t border-black/20 cursor-pointer hover:bg-blue-700 transition-colors"
        >
           <TerminalIcon className="w-3 h-3 mr-2" />
           <span>Terminal (Closed) - Click to open</span>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-48 border-t border-gray-700 bg-[#1e1e1e] text-white font-mono text-sm">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-1 bg-[#252526] border-b border-gray-700 select-none">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
          <TerminalIcon className="w-3 h-3" />
          <span>Terminal</span>
        </div>
        <div className="flex gap-2">
            <button onClick={onToggle} className="hover:text-white text-gray-500">
                <Minus className="w-3 h-3" />
            </button>
            <button onClick={onToggle} className="hover:text-white text-gray-500">
                <X className="w-3 h-3" />
            </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        className="flex-1 overflow-y-auto p-2 cursor-text" 
        ref={scrollRef}
        onClick={handleContainerClick}
      >
        {history.map((line) => (
          <div key={line.id} className={`${
            line.type === 'error' ? 'text-red-400' : 
            line.type === 'system' ? 'text-yellow-400' : 
            line.type === 'output' ? 'text-gray-300' : 'text-white'
          } mb-1 break-all whitespace-pre-wrap`}>
            {line.type === 'input' && <span className="text-green-400 mr-2">user@studio:~$</span>}
            {line.content}
          </div>
        ))}
        
        <div className="flex items-center">
          <span className="text-green-400 mr-2 flex-shrink-0">user@studio:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-white placeholder-gray-600"
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;