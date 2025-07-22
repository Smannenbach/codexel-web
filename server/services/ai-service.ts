import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const grok = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export interface AIResponse {
  content: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
}

class AIService {
  async generateResponse(message: string, model: string = 'gpt-4'): Promise<AIResponse> {
    try {
      switch (model) {
        case 'gpt-4':
        case 'gpt-4-turbo':
          return await this.callOpenAI(message, model === 'gpt-4-turbo' ? 'gpt-4-turbo' : 'gpt-4');
        
        case 'claude-3.5-sonnet':
          return await this.callAnthropic(message);
        
        case 'gemini-ultra':
          return await this.callGemini(message);
        
        case 'grok-2':
          return await this.callGrok(message, 'grok-2-1212');
        
        case 'grok-2-vision':
          return await this.callGrok(message, 'grok-2-vision-1212');
        
        case 'moonshot-kimi':
        case 'qwen-2.5-max':
          // For now, use GPT-4 as fallback for these models
          return await this.callOpenAI(message, 'gpt-4');
        
        default:
          return await this.callOpenAI(message, 'gpt-4');
      }
    } catch (error) {
      console.error(`AI Service error for model ${model}:`, error);
      throw new Error(`Failed to generate response with ${model}`);
    }
  }

  private async callOpenAI(message: string, model: string): Promise<AIResponse> {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for Codexel.ai, an AI-powered application development platform. Provide clear, concise, and actionable responses.'
        },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
    });

    const choice = response.choices[0];
    return {
      content: choice.message.content || 'No response generated',
      model: model,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      cost: this.calculateCost(model, response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0)
    };
  }

  private async callAnthropic(message: string): Promise<AIResponse> {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are a helpful AI assistant for Codexel.ai, an AI-powered application development platform. Provide clear, concise, and actionable responses.\n\nUser: ${message}`
        }
      ],
    });

    const content = response.content[0];
    return {
      content: content.type === 'text' ? content.text : 'No response generated',
      model: 'claude-3.5-sonnet',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cost: this.calculateCost('claude-3.5-sonnet', response.usage.input_tokens, response.usage.output_tokens)
    };
  }

  private async callGemini(message: string): Promise<AIResponse> {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a helpful AI assistant for Codexel.ai, an AI-powered application development platform. Provide clear, concise, and actionable responses.\n\nUser: ${message}`,
    });

    return {
      content: response.text || 'No response generated',
      model: 'gemini-ultra',
      inputTokens: 0, // Gemini doesn't provide token counts in this format
      outputTokens: 0,
      cost: 0.01 // Estimated cost
    };
  }

  private async callGrok(message: string, model: string): Promise<AIResponse> {
    const response = await grok.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for Codexel.ai, an AI-powered application development platform. Provide clear, concise, and actionable responses.'
        },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
    });

    const choice = response.choices[0];
    return {
      content: choice.message.content || 'No response generated',
      model: model === 'grok-2-1212' ? 'grok-2' : 'grok-2-vision',
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      cost: this.calculateCost(model, response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0)
    };
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Simplified cost calculation - in production you'd use actual pricing
    const rates = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
      'grok-2-1212': { input: 0.002, output: 0.010 },
      'grok-2-vision-1212': { input: 0.003, output: 0.015 },
    };

    const rate = rates[model as keyof typeof rates] || { input: 0.001, output: 0.002 };
    return (inputTokens * rate.input + outputTokens * rate.output) / 1000;
  }

  async sendMessage(systemPrompt: string, userMessage: string, model: string = 'gpt-4'): Promise<string> {
    const response = await this.generateResponse(`${systemPrompt}\n\nUser: ${userMessage}`, model);
    return response.content;
  }
}

export const aiService = new AIService();