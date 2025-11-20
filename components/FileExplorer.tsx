import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, FileJson, FileType, File } from 'lucide-react';
import { FileNode, CodeLanguage } from '../types';

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onFileSelect: (file: FileNode) => void;
  onToggleFolder: (folderId: string) => void;
}

const FileIcon = ({ name, language }: { name: string; language?: CodeLanguage }) => {
  if (name.endsWith('.html')) return <FileCode className="w-4 h-4 text-orange-500" />;
  if (name.endsWith('.css')) return <FileCode className="w-4 h-4 text-blue-400" />;
  if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.tsx')) return <FileCode className="w-4 h-4 text-yellow-400" />;
  if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-200" />;
  return <File className="w-4 h-4 text-gray-400" />;
};

const FileTreeItem: React.FC<{
  node: FileNode;
  depth: number;
  activeFileId: string | null;
  onFileSelect: (file: FileNode) => void;
  onToggleFolder: (id: string) => void;
}> = ({ node, depth, activeFileId, onFileSelect, onToggleFolder }) => {
  const isFolder = node.type === 'folder';
  const isActive = node.id === activeFileId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggleFolder(node.id);
    } else {
      onFileSelect(node);
    }
  };

  return (
    <div>
      <div
        className={`
          flex items-center py-1 px-2 cursor-pointer select-none text-sm
          transition-colors duration-150
          ${isActive ? 'bg-editor-active text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="mr-1.5 flex-shrink-0">
          {isFolder && (
            node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
          {!isFolder && <span className="w-[14px] inline-block" />}
        </span>
        
        <span className="mr-2 flex-shrink-0">
           {isFolder ? (
             node.isOpen ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-blue-400" />
           ) : (
             <FileIcon name={node.name} language={node.language} />
           )}
        </span>

        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeFileId={activeFileId}
              onFileSelect={onFileSelect}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFileId, onFileSelect, onToggleFolder }) => {
  return (
    <div className="w-full h-full overflow-y-auto bg-editor-sidebar py-2">
      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        Explorer
      </div>
      {files.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          depth={0}
          activeFileId={activeFileId}
          onFileSelect={onFileSelect}
          onToggleFolder={onToggleFolder}
        />
      ))}
    </div>
  );
};

export default FileExplorer;