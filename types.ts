export enum Tab {
  EDITOR = 'EDITOR',
  PREVIEW = 'PREVIEW',
  AI_CHAT = 'AI_CHAT'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum CodeLanguage {
  HTML = 'html',
  CSS = 'css',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  JSON = 'json',
  MARKDOWN = 'markdown',
  PLAINTEXT = 'plaintext'
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean; // For folders
  language?: CodeLanguage;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  directory?: string;
}