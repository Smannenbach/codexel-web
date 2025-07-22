export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'active' | 'idle' | 'working' | 'completed';
  model: string;
  color: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agentId?: string;
  model?: string;
}

export interface WorkspaceLayout {
  sidebarWidth: number;
  conversationWidth: number;
  previewWidth: number;
  preset: 'balanced' | 'focus' | 'preview' | 'conversation' | 'development';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'development' | 'testing' | 'completed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  agentId: string;
  priority: 'low' | 'medium' | 'high';
}

export type AIModel = 'gpt-4' | 'gpt-4-turbo' | 'gemini-ultra' | 'claude-3.5-sonnet' | 'moonshot-kimi' | 'qwen-2.5-max';

export interface AIModelConfig {
  id: AIModel;
  name: string;
  provider: string;
  cost: number;
  quality: number;
  speed: number;
  capabilities: string[];
}
