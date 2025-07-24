import { aiService } from "./ai-service";

// Enhanced AI model selection with cost optimization and capability matching
interface AIModelCapability {
  model: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai';
  strengths: string[];
  costPerToken: number;
  contextWindow: number;
  responseSpeed: 'fast' | 'medium' | 'slow';
  multimodal: boolean;
  codeGeneration: number; // 1-10 rating
  reasoning: number; // 1-10 rating
  analysis: number; // 1-10 rating
}

interface TaskRequirements {
  type: 'code_generation' | 'code_analysis' | 'debugging' | 'architecture' | 'documentation' | 'general';
  complexity: 'low' | 'medium' | 'high';
  budget: 'low' | 'medium' | 'high';
  speed: 'fast' | 'balanced' | 'quality';
  contextSize: number;
  multimodalNeeded: boolean;
}

interface ModelRecommendation {
  model: string;
  provider: string;
  score: number;
  reasoning: string;
  estimatedCost: number;
  alternatives: Array<{
    model: string;
    provider: string;
    score: number;
    reason: string;
  }>;
}

class IntelligentAIOrchestrator {
  private models: AIModelCapability[] = [
    {
      model: "claude-sonnet-4-20250514",
      provider: "anthropic",
      strengths: ["code_analysis", "architecture", "reasoning"],
      costPerToken: 0.003,
      contextWindow: 200000,
      responseSpeed: "medium",
      multimodal: true,
      codeGeneration: 9,
      reasoning: 10,
      analysis: 10
    },
    {
      model: "gpt-4o",
      provider: "openai", 
      strengths: ["code_generation", "general", "multimodal"],
      costPerToken: 0.005,
      contextWindow: 128000,
      responseSpeed: "fast",
      multimodal: true,
      codeGeneration: 8,
      reasoning: 8,
      analysis: 7
    },
    {
      model: "gemini-2.5-pro",
      provider: "google",
      strengths: ["cost_effective", "multimodal", "large_context"],
      costPerToken: 0.001,
      contextWindow: 1000000,
      responseSpeed: "medium",
      multimodal: true,
      codeGeneration: 7,
      reasoning: 7,
      analysis: 8
    },
    {
      model: "grok-2-1212",
      provider: "xai",
      strengths: ["reasoning", "analysis", "large_context"],
      costPerToken: 0.002,
      contextWindow: 131072,
      responseSpeed: "fast",
      multimodal: false,
      codeGeneration: 6,
      reasoning: 8,
      analysis: 7
    }
  ];

  private usageStats = new Map<string, {
    totalRequests: number;
    totalCost: number;
    avgResponseTime: number;
    successRate: number;
    lastUsed: Date;
  }>();

  // Intelligently select the best AI model for a given task
  async selectOptimalModel(requirements: TaskRequirements): Promise<ModelRecommendation> {
    const scores = this.models.map(model => {
      let score = 0;
      
      // Capability scoring based on task type
      switch (requirements.type) {
        case 'code_generation':
          score += model.codeGeneration * 20;
          break;
        case 'code_analysis':
        case 'debugging':
          score += model.analysis * 20;
          break;
        case 'architecture':
          score += model.reasoning * 20;
          break;
        case 'documentation':
        case 'general':
          score += (model.codeGeneration + model.reasoning) * 10;
          break;
      }

      // Speed preference scoring
      const speedScores = { fast: 10, balanced: 5, quality: 0 };
      const modelSpeedScores = { fast: 10, medium: 5, slow: 0 };
      score += speedScores[requirements.speed] === modelSpeedScores[model.responseSpeed] ? 15 : 0;

      // Budget optimization
      const costScore = requirements.budget === 'low' ? (1 / model.costPerToken) * 10 :
                       requirements.budget === 'medium' ? 10 :
                       15; // High budget prioritizes quality
      score += costScore;

      // Context window compatibility
      if (requirements.contextSize > model.contextWindow) {
        score -= 50; // Heavy penalty for insufficient context
      }

      // Multimodal requirement
      if (requirements.multimodalNeeded && !model.multimodal) {
        score -= 30;
      }

      // Historical performance boost
      const stats = this.usageStats.get(`${model.provider}:${model.model}`);
      if (stats) {
        score += stats.successRate * 10;
        score += Math.min(stats.totalRequests / 100, 10); // Experience bonus
      }

      return {
        model: model.model,
        provider: model.provider,
        score: Math.max(0, score),
        capability: model,
        estimatedCost: requirements.contextSize * model.costPerToken
      };
    }).sort((a, b) => b.score - a.score);

    const best = scores[0];
    const alternatives = scores.slice(1, 4).map(s => ({
      model: s.model,
      provider: s.provider,
      score: s.score,
      reason: this.generateAlternativeReason(s.capability, requirements)
    }));

    return {
      model: best.model,
      provider: best.provider,
      score: best.score,
      reasoning: this.generateRecommendationReason(best.capability, requirements),
      estimatedCost: best.estimatedCost,
      alternatives
    };
  }

  // Generate intelligent reasoning for model selection
  private generateRecommendationReason(model: AIModelCapability, req: TaskRequirements): string {
    const reasons = [];
    
    if (req.type === 'code_generation' && model.codeGeneration >= 8) {
      reasons.push("excellent code generation capabilities");
    }
    if (req.type === 'architecture' && model.reasoning >= 9) {
      reasons.push("superior architectural reasoning");
    }
    if (req.budget === 'low' && model.costPerToken <= 0.002) {
      reasons.push("cost-effective solution");
    }
    if (req.speed === 'fast' && model.responseSpeed === 'fast') {
      reasons.push("fast response time");
    }
    if (req.multimodalNeeded && model.multimodal) {
      reasons.push("multimodal capabilities");
    }

    return `Selected for ${reasons.join(', ')} best suited for ${req.type} tasks`;
  }

  private generateAlternativeReason(model: AIModelCapability, req: TaskRequirements): string {
    if (model.costPerToken < 0.002) return "Lower cost alternative";
    if (model.reasoning >= 9) return "Better reasoning capabilities";
    if (model.responseSpeed === 'fast') return "Faster response time";
    if (model.contextWindow > 200000) return "Larger context window";
    return "Alternative option";
  }

  // Enhanced AI request with automatic model selection
  async intelligentRequest(
    prompt: string, 
    requirements: Partial<TaskRequirements> = {},
    options: any = {}
  ) {
    const taskReq: TaskRequirements = {
      type: 'general',
      complexity: 'medium',
      budget: 'medium',
      speed: 'balanced',
      contextSize: prompt.length,
      multimodalNeeded: false,
      ...requirements
    };

    const recommendation = await this.selectOptimalModel(taskReq);
    
    // Track request start time
    const startTime = Date.now();
    
    try {
      // Use the selected model through our existing AI service
      const result = await aiService.generateResponse(prompt, {
        model: recommendation.model,
        provider: recommendation.provider,
        ...options
      });

      // Update success stats
      this.updateModelStats(recommendation.provider, recommendation.model, true, Date.now() - startTime);

      return {
        response: result,
        modelUsed: recommendation.model,
        provider: recommendation.provider,
        reasoning: recommendation.reasoning,
        estimatedCost: recommendation.estimatedCost,
        alternatives: recommendation.alternatives
      };

    } catch (error) {
      // Update failure stats
      this.updateModelStats(recommendation.provider, recommendation.model, false, Date.now() - startTime);
      
      // Try first alternative on failure
      if (recommendation.alternatives.length > 0) {
        const fallback = recommendation.alternatives[0];
        try {
          const result = await aiService.generateResponse(prompt, {
            model: fallback.model,
            provider: fallback.provider,
            ...options
          });

          return {
            response: result,
            modelUsed: fallback.model,
            provider: fallback.provider,
            reasoning: `Fallback to ${fallback.reason}`,
            estimatedCost: recommendation.estimatedCost,
            alternatives: recommendation.alternatives.slice(1)
          };
        } catch (fallbackError) {
          throw new Error(`Primary model failed: ${error.message}, Fallback failed: ${fallbackError.message}`);
        }
      }
      
      throw error;
    }
  }

  // Update model performance statistics
  private updateModelStats(provider: string, model: string, success: boolean, responseTime: number): void {
    const key = `${provider}:${model}`;
    const existing = this.usageStats.get(key) || {
      totalRequests: 0,
      totalCost: 0,
      avgResponseTime: 0,
      successRate: 100,
      lastUsed: new Date()
    };

    existing.totalRequests++;
    existing.avgResponseTime = (existing.avgResponseTime + responseTime) / 2;
    existing.successRate = ((existing.successRate * (existing.totalRequests - 1)) + (success ? 100 : 0)) / existing.totalRequests;
    existing.lastUsed = new Date();

    this.usageStats.set(key, existing);
  }

  // Get model usage analytics
  getModelAnalytics() {
    const analytics = Array.from(this.usageStats.entries()).map(([key, stats]) => {
      const [provider, model] = key.split(':');
      return {
        provider,
        model,
        ...stats,
        efficiency: stats.successRate * (1 / (stats.avgResponseTime / 1000)) // Success per second
      };
    }).sort((a, b) => b.efficiency - a.efficiency);

    return {
      modelPerformance: analytics,
      totalRequests: analytics.reduce((sum, m) => sum + m.totalRequests, 0),
      averageSuccessRate: analytics.reduce((sum, m) => sum + m.successRate, 0) / analytics.length || 0,
      recommendations: this.generateUsageRecommendations(analytics)
    };
  }

  private generateUsageRecommendations(analytics: any[]): string[] {
    const recommendations = [];
    
    if (analytics.length === 0) {
      recommendations.push("Start using the intelligent AI orchestrator for optimized model selection");
      return recommendations;
    }

    const bestModel = analytics[0];
    const worstModel = analytics[analytics.length - 1];

    if (bestModel.efficiency > worstModel.efficiency * 2) {
      recommendations.push(`Consider using ${bestModel.provider}:${bestModel.model} more frequently (${bestModel.efficiency.toFixed(2)} efficiency)`);
    }

    const lowSuccessRate = analytics.filter(m => m.successRate < 80);
    if (lowSuccessRate.length > 0) {
      recommendations.push(`Review models with low success rates: ${lowSuccessRate.map(m => `${m.provider}:${m.model}`).join(', ')}`);
    }

    const underutilized = analytics.filter(m => m.totalRequests < 10);
    if (underutilized.length > 0) {
      recommendations.push("Some models are underutilized - consider expanding use cases for cost optimization");
    }

    return recommendations;
  }

  // Cost optimization analysis
  getCostOptimization() {
    const models = this.models.map(model => {
      const stats = this.usageStats.get(`${model.provider}:${model.model}`);
      return {
        ...model,
        actualUsage: stats?.totalRequests || 0,
        estimatedMonthlyCost: (stats?.totalCost || 0) * 30,
        efficiency: stats ? stats.successRate / model.costPerToken : 0
      };
    }).sort((a, b) => b.efficiency - a.efficiency);

    return {
      models,
      totalMonthlyCost: models.reduce((sum, m) => sum + m.estimatedMonthlyCost, 0),
      mostCostEffective: models[0],
      leastCostEffective: models[models.length - 1],
      optimizationTips: [
        "Use Gemini for large context, cost-sensitive tasks",
        "Use Claude for complex reasoning and architecture",
        "Use GPT-4o for fast, general-purpose tasks",
        "Use Grok for analysis-heavy workloads"
      ]
    };
  }
}

export const intelligentAIOrchestrator = new IntelligentAIOrchestrator();
export default intelligentAIOrchestrator;