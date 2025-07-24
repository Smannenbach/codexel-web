// Intelligent AI Router Service - Phase 10
// Advanced AI model orchestration with intelligent routing and optimization

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai';
  capabilities: ModelCapability[];
  costPerToken: {
    input: number;
    output: number;
  };
  performanceMetrics: {
    averageLatency: number;
    throughput: number;
    reliability: number;
    qualityScore: number;
  };
  limits: {
    maxTokens: number;
    rateLimit: number;
    concurrency: number;
  };
  specializations: string[];
}

export interface ModelCapability {
  type: 'text' | 'code' | 'image' | 'audio' | 'multimodal';
  proficiency: number; // 0-100
  costEfficiency: number; // 0-100
}

export interface RoutingRequest {
  taskType: 'code-generation' | 'analysis' | 'conversation' | 'planning' | 'debugging' | 'optimization';
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget: 'unlimited' | 'high' | 'medium' | 'low';
  latencyRequirement: 'realtime' | 'fast' | 'standard' | 'batch';
  qualityRequirement: 'draft' | 'production' | 'enterprise' | 'research';
  contextSize: number;
  userPreferences?: {
    preferredProviders?: string[];
    avoidProviders?: string[];
    maxCostPerRequest?: number;
  };
}

export interface RoutingDecision {
  selectedModel: AIModel;
  confidence: number;
  reasoning: string;
  fallbackModels: AIModel[];
  estimatedCost: number;
  estimatedLatency: number;
  qualityPrediction: number;
  optimizationSuggestions: string[];
}

export interface ModelPerformanceMetrics {
  modelId: string;
  requests: number;
  successRate: number;
  averageLatency: number;
  averageCost: number;
  userSatisfaction: number;
  qualityScore: number;
  lastUpdated: Date;
}

class IntelligentAIRouter {
  private models: Map<string, AIModel> = new Map();
  private performanceHistory: Map<string, ModelPerformanceMetrics[]> = new Map();
  private routingRules: RoutingRule[] = [];
  private learningData: RoutingDecision[] = [];

  constructor() {
    this.initializeModels();
    this.initializeRoutingRules();
  }

  private initializeModels(): void {
    const models: AIModel[] = [
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        capabilities: [
          { type: 'text', proficiency: 95, costEfficiency: 70 },
          { type: 'code', proficiency: 90, costEfficiency: 75 },
          { type: 'image', proficiency: 85, costEfficiency: 60 }
        ],
        costPerToken: { input: 0.01, output: 0.03 },
        performanceMetrics: {
          averageLatency: 2500,
          throughput: 100,
          reliability: 99.5,
          qualityScore: 92
        },
        limits: {
          maxTokens: 128000,
          rateLimit: 10000,
          concurrency: 100
        },
        specializations: ['complex-reasoning', 'code-generation', 'analysis']
      },
      {
        id: 'claude-sonnet-4',
        name: 'Claude Sonnet 4.0',
        provider: 'anthropic',
        capabilities: [
          { type: 'text', proficiency: 97, costEfficiency: 80 },
          { type: 'code', proficiency: 95, costEfficiency: 85 },
          { type: 'multimodal', proficiency: 90, costEfficiency: 75 }
        ],
        costPerToken: { input: 0.003, output: 0.015 },
        performanceMetrics: {
          averageLatency: 2200,
          throughput: 120,
          reliability: 99.7,
          qualityScore: 95
        },
        limits: {
          maxTokens: 200000,
          rateLimit: 15000,
          concurrency: 150
        },
        specializations: ['code-analysis', 'architecture', 'optimization', 'safety']
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'google',
        capabilities: [
          { type: 'text', proficiency: 88, costEfficiency: 90 },
          { type: 'code', proficiency: 85, costEfficiency: 95 },
          { type: 'multimodal', proficiency: 95, costEfficiency: 85 }
        ],
        costPerToken: { input: 0.00125, output: 0.005 },
        performanceMetrics: {
          averageLatency: 1800,
          throughput: 150,
          reliability: 99.2,
          qualityScore: 88
        },
        limits: {
          maxTokens: 1000000,
          rateLimit: 20000,
          concurrency: 200
        },
        specializations: ['multimodal', 'large-context', 'cost-efficiency']
      },
      {
        id: 'grok-2-1212',
        name: 'Grok 2.0',
        provider: 'xai',
        capabilities: [
          { type: 'text', proficiency: 89, costEfficiency: 85 },
          { type: 'code', proficiency: 87, costEfficiency: 90 }
        ],
        costPerToken: { input: 0.002, output: 0.01 },
        performanceMetrics: {
          averageLatency: 2000,
          throughput: 130,
          reliability: 98.8,
          qualityScore: 89
        },
        limits: {
          maxTokens: 131072,
          rateLimit: 12000,
          concurrency: 120
        },
        specializations: ['real-time', 'efficiency', 'innovation']
      }
    ];

    models.forEach(model => this.models.set(model.id, model));
  }

  private initializeRoutingRules(): void {
    this.routingRules = [
      {
        condition: (req) => req.taskType === 'code-generation' && req.complexity === 'expert',
        preferredModels: ['claude-sonnet-4', 'gpt-4-turbo'],
        weight: 1.0
      },
      {
        condition: (req) => req.budget === 'low' || req.budget === 'medium',
        preferredModels: ['gemini-2.5-pro', 'grok-2-1212'],
        weight: 0.8
      },
      {
        condition: (req) => req.latencyRequirement === 'realtime',
        preferredModels: ['grok-2-1212', 'gemini-2.5-pro'],
        weight: 0.9
      },
      {
        condition: (req) => req.qualityRequirement === 'research' || req.qualityRequirement === 'enterprise',
        preferredModels: ['claude-sonnet-4', 'gpt-4-turbo'],
        weight: 1.0
      },
      {
        condition: (req) => req.contextSize > 100000,
        preferredModels: ['gemini-2.5-pro', 'claude-sonnet-4'],
        weight: 0.9
      }
    ];
  }

  async routeRequest(request: RoutingRequest): Promise<RoutingDecision> {
    const candidates = await this.getCandidateModels(request);
    const scoredModels = await this.scoreModels(candidates, request);
    const selectedModel = this.selectBestModel(scoredModels, request);
    
    const decision: RoutingDecision = {
      selectedModel,
      confidence: this.calculateConfidence(scoredModels, selectedModel),
      reasoning: this.generateReasoning(selectedModel, request),
      fallbackModels: scoredModels.slice(1, 4).map(sm => sm.model),
      estimatedCost: this.estimateCost(selectedModel, request),
      estimatedLatency: this.estimateLatency(selectedModel, request),
      qualityPrediction: this.predictQuality(selectedModel, request),
      optimizationSuggestions: this.generateOptimizationSuggestions(request)
    };

    // Learn from this decision for future improvements
    this.learningData.push(decision);
    
    return decision;
  }

  private async getCandidateModels(request: RoutingRequest): Promise<AIModel[]> {
    const allModels = Array.from(this.models.values());
    
    return allModels.filter(model => {
      // Filter by user preferences
      if (request.userPreferences?.avoidProviders?.includes(model.provider)) {
        return false;
      }
      
      if (request.userPreferences?.preferredProviders?.length &&
          !request.userPreferences.preferredProviders.includes(model.provider)) {
        return false;
      }

      // Filter by context size
      if (request.contextSize > model.limits.maxTokens) {
        return false;
      }

      // Filter by capabilities
      const hasRequiredCapability = model.capabilities.some(cap => {
        switch (request.taskType) {
          case 'code-generation':
          case 'debugging':
          case 'optimization':
            return cap.type === 'code' && cap.proficiency >= 80;
          case 'analysis':
          case 'planning':
            return cap.type === 'text' && cap.proficiency >= 85;
          default:
            return cap.type === 'text' && cap.proficiency >= 70;
        }
      });

      return hasRequiredCapability;
    });
  }

  private async scoreModels(models: AIModel[], request: RoutingRequest): Promise<ScoredModel[]> {
    const scoredModels: ScoredModel[] = [];

    for (const model of models) {
      let score = 0;
      const factors: Record<string, number> = {};

      // Quality score (40% weight)
      factors.quality = model.performanceMetrics.qualityScore / 100;
      score += factors.quality * 0.4;

      // Cost efficiency (25% weight)
      const costScore = this.calculateCostScore(model, request);
      factors.cost = costScore;
      score += costScore * 0.25;

      // Latency score (20% weight)
      const latencyScore = this.calculateLatencyScore(model, request);
      factors.latency = latencyScore;
      score += latencyScore * 0.2;

      // Reliability score (10% weight)
      factors.reliability = model.performanceMetrics.reliability / 100;
      score += factors.reliability * 0.1;

      // Specialization bonus (5% weight)
      const specializationScore = this.calculateSpecializationScore(model, request);
      factors.specialization = specializationScore;
      score += specializationScore * 0.05;

      // Apply routing rules
      const ruleBonus = this.applyRoutingRules(model, request);
      score += ruleBonus;

      scoredModels.push({
        model,
        score,
        factors
      });
    }

    return scoredModels.sort((a, b) => b.score - a.score);
  }

  private calculateCostScore(model: AIModel, request: RoutingRequest): number {
    const estimatedTokens = this.estimateTokenUsage(request);
    const estimatedCost = (estimatedTokens.input * model.costPerToken.input) + 
                         (estimatedTokens.output * model.costPerToken.output);

    // Normalize cost score based on budget preference
    switch (request.budget) {
      case 'unlimited': return 1.0;
      case 'high': return Math.max(0, 1 - (estimatedCost / 1.0));
      case 'medium': return Math.max(0, 1 - (estimatedCost / 0.5));
      case 'low': return Math.max(0, 1 - (estimatedCost / 0.1));
      default: return 0.8;
    }
  }

  private calculateLatencyScore(model: AIModel, request: RoutingRequest): number {
    const targetLatency = this.getTargetLatency(request.latencyRequirement);
    const latencyScore = Math.max(0, 1 - (model.performanceMetrics.averageLatency / targetLatency));
    return Math.min(1, latencyScore);
  }

  private getTargetLatency(requirement: string): number {
    switch (requirement) {
      case 'realtime': return 1000;
      case 'fast': return 2000;
      case 'standard': return 5000;
      case 'batch': return 10000;
      default: return 3000;
    }
  }

  private calculateSpecializationScore(model: AIModel, request: RoutingRequest): number {
    const relevantSpecializations = this.getRelevantSpecializations(request.taskType);
    const matches = model.specializations.filter(spec => 
      relevantSpecializations.includes(spec)
    ).length;
    
    return Math.min(1, matches / relevantSpecializations.length);
  }

  private getRelevantSpecializations(taskType: string): string[] {
    switch (taskType) {
      case 'code-generation': return ['code-generation', 'complex-reasoning'];
      case 'analysis': return ['code-analysis', 'analysis', 'architecture'];
      case 'debugging': return ['debugging', 'code-analysis'];
      case 'optimization': return ['optimization', 'performance'];
      case 'planning': return ['architecture', 'planning', 'complex-reasoning'];
      default: return ['general'];
    }
  }

  private applyRoutingRules(model: AIModel, request: RoutingRequest): number {
    let bonus = 0;
    
    for (const rule of this.routingRules) {
      if (rule.condition(request) && rule.preferredModels.includes(model.id)) {
        bonus += rule.weight * 0.1; // Max 10% bonus per rule
      }
    }
    
    return Math.min(0.3, bonus); // Cap total bonus at 30%
  }

  private selectBestModel(scoredModels: ScoredModel[], request: RoutingRequest): AIModel {
    if (scoredModels.length === 0) {
      throw new Error('No suitable models found for request');
    }

    // Add some randomness for exploration (epsilon-greedy)
    const exploration = 0.1;
    if (Math.random() < exploration && scoredModels.length > 1) {
      return scoredModels[1].model; // Select second best sometimes
    }

    return scoredModels[0].model;
  }

  private calculateConfidence(scoredModels: ScoredModel[], selectedModel: AIModel): number {
    if (scoredModels.length < 2) return 0.9;

    const bestScore = scoredModels[0].score;
    const secondBestScore = scoredModels[1].score;
    const gap = bestScore - secondBestScore;
    
    // Confidence increases with the gap between best and second best
    return Math.min(0.99, 0.7 + (gap * 0.3));
  }

  private generateReasoning(model: AIModel, request: RoutingRequest): string {
    const reasons = [];
    
    if (request.qualityRequirement === 'enterprise' || request.qualityRequirement === 'research') {
      reasons.push(`High quality requirement matched with ${model.name}'s quality score of ${model.performanceMetrics.qualityScore}`);
    }
    
    if (request.budget === 'low' && model.costPerToken.input < 0.005) {
      reasons.push('Cost-optimized selection for budget constraints');
    }
    
    if (request.latencyRequirement === 'realtime' && model.performanceMetrics.averageLatency < 2000) {
      reasons.push('Low latency model selected for real-time requirements');
    }
    
    const relevantSpecs = model.specializations.filter(spec => 
      this.getRelevantSpecializations(request.taskType).includes(spec)
    );
    
    if (relevantSpecs.length > 0) {
      reasons.push(`Specialized in: ${relevantSpecs.join(', ')}`);
    }
    
    return reasons.join('. ') || `Best overall match for ${request.taskType} task`;
  }

  private estimateCost(model: AIModel, request: RoutingRequest): number {
    const tokens = this.estimateTokenUsage(request);
    return (tokens.input * model.costPerToken.input) + (tokens.output * model.costPerToken.output);
  }

  private estimateLatency(model: AIModel, request: RoutingRequest): number {
    let baseLatency = model.performanceMetrics.averageLatency;
    
    // Adjust for complexity
    switch (request.complexity) {
      case 'simple': baseLatency *= 0.7; break;
      case 'medium': baseLatency *= 1.0; break;
      case 'complex': baseLatency *= 1.5; break;
      case 'expert': baseLatency *= 2.0; break;
    }
    
    return Math.round(baseLatency);
  }

  private predictQuality(model: AIModel, request: RoutingRequest): number {
    let baseQuality = model.performanceMetrics.qualityScore;
    
    // Adjust based on task-model fit
    const relevantCap = model.capabilities.find(cap => {
      switch (request.taskType) {
        case 'code-generation':
        case 'debugging':
        case 'optimization':
          return cap.type === 'code';
        default:
          return cap.type === 'text';
      }
    });
    
    if (relevantCap) {
      baseQuality = (baseQuality + relevantCap.proficiency) / 2;
    }
    
    return Math.round(baseQuality);
  }

  private generateOptimizationSuggestions(request: RoutingRequest): string[] {
    const suggestions = [];
    
    if (request.budget === 'unlimited' && request.latencyRequirement !== 'realtime') {
      suggestions.push('Consider using medium budget for cost optimization without quality loss');
    }
    
    if (request.complexity === 'expert' && request.qualityRequirement === 'draft') {
      suggestions.push('Consider reducing task complexity or increasing quality requirement for better results');
    }
    
    if (request.contextSize > 50000 && request.latencyRequirement === 'realtime') {
      suggestions.push('Large context size may impact real-time performance - consider chunking');
    }
    
    return suggestions;
  }

  private estimateTokenUsage(request: RoutingRequest): { input: number; output: number } {
    // Base estimates - would be improved with real usage data
    const baseTokens = {
      'simple': { input: 1000, output: 500 },
      'medium': { input: 2000, output: 1000 },
      'complex': { input: 4000, output: 2000 },
      'expert': { input: 8000, output: 4000 }
    };
    
    const base = baseTokens[request.complexity];
    
    // Adjust for context size
    const contextMultiplier = Math.max(1, request.contextSize / 10000);
    
    return {
      input: Math.round(base.input * contextMultiplier),
      output: Math.round(base.output * contextMultiplier)
    };
  }

  // Performance tracking and learning methods
  async updateModelPerformance(modelId: string, metrics: Partial<ModelPerformanceMetrics>): Promise<void> {
    const history = this.performanceHistory.get(modelId) || [];
    const existing = history[history.length - 1];
    
    const updated: ModelPerformanceMetrics = {
      modelId,
      requests: existing?.requests || 0,
      successRate: existing?.successRate || 0,
      averageLatency: existing?.averageLatency || 0,
      averageCost: existing?.averageCost || 0,
      userSatisfaction: existing?.userSatisfaction || 0,
      qualityScore: existing?.qualityScore || 0,
      lastUpdated: new Date(),
      ...metrics
    };
    
    history.push(updated);
    this.performanceHistory.set(modelId, history.slice(-100)); // Keep last 100 records
    
    // Update model's performance metrics
    const model = this.models.get(modelId);
    if (model && metrics.averageLatency !== undefined) {
      model.performanceMetrics.averageLatency = metrics.averageLatency;
    }
    if (model && metrics.qualityScore !== undefined) {
      model.performanceMetrics.qualityScore = metrics.qualityScore;
    }
  }

  async getModelAnalytics(): Promise<ModelAnalytics[]> {
    const analytics: ModelAnalytics[] = [];
    
    for (const [modelId, history] of Array.from(this.performanceHistory.entries())) {
      const model = this.models.get(modelId);
      if (!model || history.length === 0) continue;
      
      const latest = history[history.length - 1];
      const trend = this.calculateTrend(history);
      
      analytics.push({
        model,
        currentMetrics: latest,
        trend,
        totalRequests: history.reduce((sum: number, h: ModelPerformanceMetrics) => sum + h.requests, 0),
        recommendation: this.generateModelRecommendation(model, latest, trend)
      });
    }
    
    return analytics.sort((a, b) => b.currentMetrics.qualityScore - a.currentMetrics.qualityScore);
  }

  private calculateTrend(history: ModelPerformanceMetrics[]): ModelTrend {
    if (history.length < 2) {
      return { direction: 'stable', magnitude: 0 };
    }
    
    const recent = history.slice(-5); // Last 5 records
    const older = history.slice(-10, -5); // Previous 5 records
    
    if (older.length === 0) {
      return { direction: 'stable', magnitude: 0 };
    }
    
    const recentAvg = recent.reduce((sum, h) => sum + h.qualityScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.qualityScore, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    const magnitude = Math.abs(change) / olderAvg;
    
    return {
      direction: change > 2 ? 'improving' : change < -2 ? 'degrading' : 'stable',
      magnitude
    };
  }

  private generateModelRecommendation(model: AIModel, metrics: ModelPerformanceMetrics, trend: ModelTrend): string {
    if (trend.direction === 'degrading') {
      return 'Performance declining - investigate issues or reduce usage';
    }
    
    if (metrics.qualityScore > 90 && metrics.successRate > 0.95) {
      return 'Excellent performance - suitable for critical tasks';
    }
    
    if (metrics.qualityScore < 80 || metrics.successRate < 0.9) {
      return 'Below average performance - consider alternatives';
    }
    
    return 'Good performance - suitable for general use';
  }
}

interface RoutingRule {
  condition: (request: RoutingRequest) => boolean;
  preferredModels: string[];
  weight: number;
}

interface ScoredModel {
  model: AIModel;
  score: number;
  factors: Record<string, number>;
}

interface ModelAnalytics {
  model: AIModel;
  currentMetrics: ModelPerformanceMetrics;
  trend: ModelTrend;
  totalRequests: number;
  recommendation: string;
}

interface ModelTrend {
  direction: 'improving' | 'stable' | 'degrading';
  magnitude: number;
}

export const intelligentAIRouter = new IntelligentAIRouter();