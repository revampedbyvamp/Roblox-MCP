export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: 'build' | 'test' | 'deploy' | 'analyze';
  status: 'ready' | 'running' | 'success' | 'error';
  lastRun?: Date;
}

export interface BuildResult {
  id: string;
  status: 'pending' | 'building' | 'success' | 'error';
  logs: string[];
  startTime: Date;
  endTime?: Date;
  errors?: string[];
}

export interface RobloxScript {
  id: string;
  name: string;
  type: 'LocalScript' | 'Script' | 'ModuleScript';
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  connected: boolean;
}
