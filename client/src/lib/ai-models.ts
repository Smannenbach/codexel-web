import { AIModel, AIModelConfig } from '@/types/workspace';

export const AI_MODELS: Record<AIModel, AIModelConfig> = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    cost: 5,
    quality: 10,
    speed: 7,
    capabilities: ['reasoning', 'code', 'analysis', 'planning']
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo (Premium)',
    provider: 'OpenAI',
    cost: 7,
    quality: 10,
    speed: 9,
    capabilities: ['reasoning', 'code', 'analysis', 'planning', 'multimodal']
  },
  'gemini-ultra': {
    id: 'gemini-ultra',
    name: 'Gemini Ultra',
    provider: 'Google',
    cost: 6,
    quality: 9,
    speed: 8,
    capabilities: ['multimodal', 'reasoning', 'code', 'analysis']
  },
  'claude-3.5-sonnet': {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    cost: 4,
    quality: 9,
    speed: 8,
    capabilities: ['code', 'reasoning', 'analysis', 'writing']
  },
  'moonshot-kimi': {
    id: 'moonshot-kimi',
    name: 'Moonshot Kimi K2',
    provider: 'Moonshot',
    cost: 2,
    quality: 8,
    speed: 9,
    capabilities: ['code', 'reasoning', 'cost-effective']
  },
  'qwen-2.5-max': {
    id: 'qwen-2.5-max',
    name: 'Alibaba Qwen 2.5-Max',
    provider: 'Alibaba',
    cost: 1,
    quality: 8,
    speed: 9,
    capabilities: ['code', 'reasoning', 'open-source']
  }
};

export const getOptimalModelForTask = (taskType: string): AIModel => {
  switch (taskType) {
    case 'planning':
    case 'architecture':
      return 'gpt-4-turbo';
    case 'coding':
    case 'frontend':
      return 'moonshot-kimi';
    case 'backend':
      return 'claude-3.5-sonnet';
    case 'design':
    case 'ui':
      return 'gemini-ultra';
    case 'testing':
      return 'qwen-2.5-max';
    default:
      return 'gpt-4';
  }
};
