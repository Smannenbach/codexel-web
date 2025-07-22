import { generateWithGPT4, analyzeRequirements, generateCodeWithGPT4 } from './openai';
import { generateWithClaude, planArchitecture, designUIComponents, generateCodeWithClaude } from './anthropic';
import { generateWithGemini, designUserInterface, generateCodeWithGemini } from './gemini';
import { InsertMessage, InsertAiUsage } from '@shared/schema';

export type AIModel = 'gpt-4' | 'gpt-4-turbo' | 'claude-3.5-sonnet' | 'gemini-2.5-pro' | 'moonshot-kimi' | 'qwen-2.5-max';

export interface AIResponse {
  content: string;
  model: AIModel;
  tokensUsed: number;
  cost: number;
}

export interface AgentTask {
  id: string;
  type: 'planning' | 'architecture' | 'design' | 'frontend' | 'backend' | 'testing';
  description: string;
  prompt: string;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
}

class AIOrchestrator {
  private modelCosts: Record<AIModel, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
    'gemini-2.5-pro': { input: 0.00125, output: 0.005 },
    'moonshot-kimi': { input: 0.0015, output: 0.002 },
    'qwen-2.5-max': { input: 0.0002, output: 0.0002 }
  };

  async processMessage(content: string, model: AIModel): Promise<AIResponse> {
    let response: string;
    let tokensUsed = 0;

    try {
      switch (model) {
        case 'gpt-4':
        case 'gpt-4-turbo':
          response = await generateWithGPT4(content);
          tokensUsed = this.estimateTokens(content + response);
          break;
        
        case 'claude-3.5-sonnet':
          response = await generateWithClaude(content);
          tokensUsed = this.estimateTokens(content + response);
          break;
        
        case 'gemini-2.5-pro':
          response = await generateWithGemini(content);
          tokensUsed = this.estimateTokens(content + response);
          break;
        
        default:
          throw new Error(`Model ${model} not implemented yet`);
      }

      const cost = this.calculateCost(model, tokensUsed);

      return {
        content: response,
        model,
        tokensUsed,
        cost
      };
    } catch (error) {
      throw new Error(`AI processing failed: ${(error as Error).message}`);
    }
  }

  async orchestrateProject(userInput: string): Promise<{
    requirements: any;
    architecture: any;
    uiDesign: any;
    tasks: AgentTask[];
  }> {
    try {
      // Step 1: Analyze requirements with GPT-4 (best for planning)
      const requirements = await analyzeRequirements(userInput);
      
      // Step 2: Plan architecture with Claude (excellent for technical planning)
      const architecture = await planArchitecture(userInput);
      
      // Step 3: Design UI with Gemini (great for multimodal design)
      const uiDesign = await designUserInterface(userInput);
      
      // Step 4: Generate task queue
      const tasks = this.generateTaskQueue(requirements, architecture, uiDesign);
      
      return {
        requirements,
        architecture,
        uiDesign,
        tasks
      };
    } catch (error) {
      throw new Error(`Project orchestration failed: ${(error as Error).message}`);
    }
  }

  private generateTaskQueue(requirements: any, architecture: any, uiDesign: any): AgentTask[] {
    const tasks: AgentTask[] = [
      {
        id: 'planning-1',
        type: 'planning',
        description: 'Create project roadmap and timeline',
        prompt: `Based on these requirements: ${JSON.stringify(requirements)}, create a detailed project plan.`,
        priority: 'high',
        dependencies: []
      },
      {
        id: 'architecture-1',
        type: 'architecture',
        description: 'Set up project structure and database schema',
        prompt: `Implement this architecture: ${JSON.stringify(architecture)}`,
        priority: 'high',
        dependencies: ['planning-1']
      },
      {
        id: 'design-1',
        type: 'design',
        description: 'Create component library and design system',
        prompt: `Implement this UI design: ${JSON.stringify(uiDesign)}`,
        priority: 'medium',
        dependencies: ['planning-1']
      },
      {
        id: 'frontend-1',
        type: 'frontend',
        description: 'Build core frontend components',
        prompt: `Build React components based on the design system`,
        priority: 'medium',
        dependencies: ['design-1', 'architecture-1']
      },
      {
        id: 'backend-1',
        type: 'backend',
        description: 'Implement API endpoints and business logic',
        prompt: `Create backend APIs for ${requirements.projectType}`,
        priority: 'medium',
        dependencies: ['architecture-1']
      }
    ];

    return tasks;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private calculateCost(model: AIModel, tokens: number): number {
    const inputTokens = tokens * 0.3; // Assume 30% input, 70% output
    const outputTokens = tokens * 0.7;
    
    const costs = this.modelCosts[model];
    return (inputTokens * costs.input + outputTokens * costs.output) / 1000;
  }

  getOptimalModel(taskType: AgentTask['type']): AIModel {
    const modelMapping: Record<AgentTask['type'], AIModel> = {
      'planning': 'gpt-4-turbo',
      'architecture': 'claude-3.5-sonnet',
      'design': 'gemini-2.5-pro',
      'frontend': 'moonshot-kimi',
      'backend': 'claude-3.5-sonnet',
      'testing': 'qwen-2.5-max'
    };

    return modelMapping[taskType] || 'gpt-4';
  }
}

export const aiOrchestrator = new AIOrchestrator();
