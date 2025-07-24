// Resource Allocation Manager - Phase 10
// Intelligent resource management, auto-scaling, and performance optimization

export interface ResourceMetrics {
  cpu: {
    usage: number; // 0-100
    cores: number;
    frequency: number;
  };
  memory: {
    used: number; // bytes
    total: number; // bytes
    usage: number; // 0-100
  };
  network: {
    bandwidth: number; // bytes/sec
    latency: number; // ms
    throughput: number; // requests/sec
  };
  storage: {
    used: number; // bytes
    total: number; // bytes
    iops: number;
  };
}

export interface AutoScalingRule {
  id: string;
  name: string;
  metric: 'cpu' | 'memory' | 'network' | 'requests' | 'custom';
  threshold: {
    scaleUp: number;
    scaleDown: number;
  };
  action: {
    type: 'scale-instances' | 'allocate-resources' | 'redistribute-load';
    magnitude: number;
    maxInstances?: number;
    minInstances?: number;
  };
  cooldown: number; // seconds
  enabled: boolean;
}

export interface ResourceAllocation {
  serviceId: string;
  serviceName: string;
  allocatedResources: {
    cpu: number; // cores
    memory: number; // bytes
    bandwidth: number; // bytes/sec
    storage: number; // bytes
  };
  priority: 'critical' | 'high' | 'medium' | 'low';
  scalingPolicy: 'aggressive' | 'moderate' | 'conservative' | 'manual';
  constraints: {
    maxCpu?: number;
    maxMemory?: number;
    maxBandwidth?: number;
    maxInstances?: number;
  };
}

export interface LoadBalancingStrategy {
  algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'ai-optimized';
  healthCheckInterval: number;
  failoverThreshold: number;
  stickySession: boolean;
  aiParameters?: {
    latencyWeight: number;
    throughputWeight: number;
    errorRateWeight: number;
  };
}

export interface PerformanceOptimization {
  id: string;
  type: 'caching' | 'compression' | 'cdn' | 'database' | 'code' | 'infrastructure';
  description: string;
  impact: {
    performance: number; // % improvement
    cost: number; // % change
    complexity: number; // 1-10
  };
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeframe: string;
    dependencies: string[];
  };
  enabled: boolean;
  metrics: {
    beforeImplementation?: ResourceMetrics;
    afterImplementation?: ResourceMetrics;
    improvement?: number;
  };
}

class ResourceAllocationManager {
  private currentMetrics: ResourceMetrics;
  private allocations: Map<string, ResourceAllocation> = new Map();
  private scalingRules: Map<string, AutoScalingRule> = new Map();
  private optimizations: Map<string, PerformanceOptimization> = new Map();
  private loadBalancer: LoadBalancingStrategy;
  private metricsHistory: ResourceMetrics[] = [];
  private scalingHistory: ScalingEvent[] = [];

  constructor() {
    this.initializeDefaultConfiguration();
    this.startMetricsCollection();
  }

  private initializeDefaultConfiguration(): void {
    // Initialize default load balancing strategy
    this.loadBalancer = {
      algorithm: 'ai-optimized',
      healthCheckInterval: 30000,
      failoverThreshold: 3,
      stickySession: false,
      aiParameters: {
        latencyWeight: 0.4,
        throughputWeight: 0.3,
        errorRateWeight: 0.3
      }
    };

    // Initialize default scaling rules
    const defaultRules: AutoScalingRule[] = [
      {
        id: 'cpu-scale-up',
        name: 'CPU Scale Up',
        metric: 'cpu',
        threshold: { scaleUp: 80, scaleDown: 30 },
        action: {
          type: 'scale-instances',
          magnitude: 1,
          maxInstances: 10,
          minInstances: 1
        },
        cooldown: 300,
        enabled: true
      },
      {
        id: 'memory-scale-up',
        name: 'Memory Scale Up',
        metric: 'memory',
        threshold: { scaleUp: 85, scaleDown: 40 },
        action: {
          type: 'allocate-resources',
          magnitude: 0.5,
          maxInstances: 8,
          minInstances: 1
        },
        cooldown: 180,
        enabled: true
      },
      {
        id: 'requests-scale',
        name: 'Request-based Scaling',
        metric: 'requests',
        threshold: { scaleUp: 1000, scaleDown: 200 },
        action: {
          type: 'scale-instances',
          magnitude: 2,
          maxInstances: 15,
          minInstances: 2
        },
        cooldown: 120,
        enabled: true
      }
    ];

    defaultRules.forEach(rule => this.scalingRules.set(rule.id, rule));

    // Initialize default optimizations
    const defaultOptimizations: PerformanceOptimization[] = [
      {
        id: 'enable-gzip',
        type: 'compression',
        description: 'Enable GZIP compression for text responses',
        impact: { performance: 40, cost: -5, complexity: 2 },
        implementation: { effort: 'low', timeframe: '1 day', dependencies: [] },
        enabled: true,
        metrics: {}
      },
      {
        id: 'redis-caching',
        type: 'caching',
        description: 'Implement Redis caching for frequent queries',
        impact: { performance: 60, cost: 15, complexity: 4 },
        implementation: { effort: 'medium', timeframe: '3 days', dependencies: ['redis'] },
        enabled: false,
        metrics: {}
      },
      {
        id: 'cdn-static-assets',
        type: 'cdn',
        description: 'Use CDN for static asset delivery',
        impact: { performance: 50, cost: 10, complexity: 3 },
        implementation: { effort: 'medium', timeframe: '2 days', dependencies: ['cloudflare'] },
        enabled: true,
        metrics: {}
      },
      {
        id: 'database-indexing',
        type: 'database',
        description: 'Optimize database queries with proper indexing',
        impact: { performance: 80, cost: 0, complexity: 6 },
        implementation: { effort: 'high', timeframe: '1 week', dependencies: [] },
        enabled: false,
        metrics: {}
      }
    ];

    defaultOptimizations.forEach(opt => this.optimizations.set(opt.id, opt));
  }

  private startMetricsCollection(): void {
    // Simulate metrics collection
    setInterval(() => {
      this.currentMetrics = this.collectSystemMetrics();
      this.metricsHistory.push({ ...this.currentMetrics });
      
      // Keep only last 1000 metrics
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory = this.metricsHistory.slice(-1000);
      }

      // Check scaling rules
      this.evaluateScalingRules();
    }, 10000); // Every 10 seconds
  }

  private collectSystemMetrics(): ResourceMetrics {
    // In a real implementation, this would collect actual system metrics
    const baseMetrics = {
      cpu: {
        usage: 45 + Math.random() * 30, // 45-75%
        cores: 8,
        frequency: 2.4
      },
      memory: {
        used: 2.1e9 + Math.random() * 1e9, // 2.1-3.1 GB
        total: 8e9, // 8 GB
        usage: 0
      },
      network: {
        bandwidth: 1e8, // 100 Mbps
        latency: 20 + Math.random() * 30, // 20-50ms
        throughput: 500 + Math.random() * 200 // 500-700 req/s
      },
      storage: {
        used: 10e9 + Math.random() * 5e9, // 10-15 GB
        total: 100e9, // 100 GB
        iops: 1000 + Math.random() * 500 // 1000-1500
      }
    };

    baseMetrics.memory.usage = (baseMetrics.memory.used / baseMetrics.memory.total) * 100;
    return baseMetrics;
  }

  private async evaluateScalingRules(): Promise<void> {
    for (const rule of this.scalingRules.values()) {
      if (!rule.enabled) continue;

      const currentValue = this.getMetricValue(rule.metric);
      const shouldScale = this.shouldTriggerScaling(rule, currentValue);

      if (shouldScale) {
        await this.executeScalingAction(rule, currentValue);
      }
    }
  }

  private getMetricValue(metric: string): number {
    switch (metric) {
      case 'cpu': return this.currentMetrics.cpu.usage;
      case 'memory': return this.currentMetrics.memory.usage;
      case 'network': return this.currentMetrics.network.throughput;
      case 'requests': return this.currentMetrics.network.throughput;
      default: return 0;
    }
  }

  private shouldTriggerScaling(rule: AutoScalingRule, currentValue: number): boolean {
    const lastScaling = this.getLastScalingEvent(rule.id);
    
    // Check cooldown period
    if (lastScaling && Date.now() - lastScaling.timestamp.getTime() < rule.cooldown * 1000) {
      return false;
    }

    // Check thresholds
    return currentValue >= rule.threshold.scaleUp || currentValue <= rule.threshold.scaleDown;
  }

  private getLastScalingEvent(ruleId: string): ScalingEvent | undefined {
    return this.scalingHistory
      .filter(event => event.ruleId === ruleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  private async executeScalingAction(rule: AutoScalingRule, currentValue: number): Promise<void> {
    const direction = currentValue >= rule.threshold.scaleUp ? 'up' : 'down';
    
    const event: ScalingEvent = {
      id: `scaling-${Date.now()}`,
      ruleId: rule.id,
      direction,
      magnitude: rule.action.magnitude,
      reason: `${rule.metric} at ${currentValue}% triggered ${direction} scaling`,
      timestamp: new Date(),
      success: true,
      resourcesBefore: { ...this.currentMetrics },
      resourcesAfter: null
    };

    try {
      switch (rule.action.type) {
        case 'scale-instances':
          await this.scaleInstances(direction, rule.action.magnitude);
          break;
        case 'allocate-resources':
          await this.allocateResources(direction, rule.action.magnitude);
          break;
        case 'redistribute-load':
          await this.redistributeLoad();
          break;
      }

      event.resourcesAfter = { ...this.currentMetrics };
      event.success = true;
    } catch (error) {
      event.success = false;
      event.error = error instanceof Error ? error.message : String(error);
    }

    this.scalingHistory.push(event);
  }

  private async scaleInstances(direction: 'up' | 'down', magnitude: number): Promise<void> {
    // Simulate instance scaling
    console.log(`Scaling instances ${direction} by ${magnitude}`);
    
    // Update metrics to reflect scaling
    if (direction === 'up') {
      this.currentMetrics.cpu.usage *= 0.8; // Reduce CPU usage
      this.currentMetrics.memory.usage *= 0.85; // Reduce memory usage
    } else {
      this.currentMetrics.cpu.usage *= 1.1; // Increase CPU usage
      this.currentMetrics.memory.usage *= 1.05; // Increase memory usage
    }
  }

  private async allocateResources(direction: 'up' | 'down', magnitude: number): Promise<void> {
    // Simulate resource allocation
    console.log(`Allocating resources ${direction} by ${magnitude}`);
    
    if (direction === 'up') {
      this.currentMetrics.memory.total *= (1 + magnitude);
      this.currentMetrics.cpu.cores += Math.ceil(magnitude);
    } else {
      this.currentMetrics.memory.total *= Math.max(0.5, 1 - magnitude);
      this.currentMetrics.cpu.cores = Math.max(1, this.currentMetrics.cpu.cores - Math.ceil(magnitude));
    }
  }

  private async redistributeLoad(): Promise<void> {
    // Simulate load redistribution
    console.log('Redistributing load across instances');
    
    // Normalize metrics
    this.currentMetrics.network.latency *= 0.9;
    this.currentMetrics.network.throughput *= 1.1;
  }

  // Public API methods
  async allocateResourcesForService(serviceId: string, allocation: ResourceAllocation): Promise<void> {
    this.allocations.set(serviceId, allocation);
    
    // Apply allocation logic
    await this.applyResourceAllocation(allocation);
  }

  private async applyResourceAllocation(allocation: ResourceAllocation): Promise<void> {
    // Implement actual resource allocation logic
    console.log(`Applying resource allocation for ${allocation.serviceName}`);
  }

  async getResourceMetrics(): Promise<ResourceMetrics> {
    return { ...this.currentMetrics };
  }

  async getResourceAnalytics(): Promise<ResourceAnalytics> {
    const history = this.metricsHistory.slice(-100); // Last 100 measurements
    
    return {
      current: this.currentMetrics,
      trends: this.calculateTrends(history),
      predictions: this.predictResourceNeeds(history),
      recommendations: this.generateResourceRecommendations(history),
      scalingEvents: this.scalingHistory.slice(-20),
      efficiency: this.calculateResourceEfficiency()
    };
  }

  private calculateTrends(history: ResourceMetrics[]): ResourceTrends {
    if (history.length < 10) {
      return {
        cpu: { direction: 'stable', magnitude: 0 },
        memory: { direction: 'stable', magnitude: 0 },
        network: { direction: 'stable', magnitude: 0 },
        storage: { direction: 'stable', magnitude: 0 }
      };
    }

    const calculateTrend = (values: number[]) => {
      const recent = values.slice(-5).reduce((a, b) => a + b, 0) / 5;
      const older = values.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
      const change = (recent - older) / older;
      
      return {
        direction: change > 0.05 ? 'increasing' : change < -0.05 ? 'decreasing' : 'stable' as const,
        magnitude: Math.abs(change)
      };
    };

    return {
      cpu: calculateTrend(history.map(h => h.cpu.usage)),
      memory: calculateTrend(history.map(h => h.memory.usage)),
      network: calculateTrend(history.map(h => h.network.throughput)),
      storage: calculateTrend(history.map(h => h.storage.iops))
    };
  }

  private predictResourceNeeds(history: ResourceMetrics[]): ResourcePredictions {
    // Simple linear prediction - would be more sophisticated in production
    const nextHour = this.extrapolateMetric(history.map(h => h.cpu.usage));
    const nextDay = this.extrapolateMetric(history.map(h => h.memory.usage), 24);
    
    return {
      nextHour: {
        cpu: Math.max(0, Math.min(100, nextHour)),
        memory: Math.max(0, Math.min(100, this.extrapolateMetric(history.map(h => h.memory.usage)))),
        confidence: 0.75
      },
      nextDay: {
        cpu: Math.max(0, Math.min(100, nextDay)),
        memory: Math.max(0, Math.min(100, this.extrapolateMetric(history.map(h => h.memory.usage), 24))),
        confidence: 0.60
      },
      nextWeek: {
        cpu: Math.max(0, Math.min(100, this.extrapolateMetric(history.map(h => h.cpu.usage), 168))),
        memory: Math.max(0, Math.min(100, this.extrapolateMetric(history.map(h => h.memory.usage), 168))),
        confidence: 0.40
      }
    };
  }

  private extrapolateMetric(values: number[], periods: number = 1): number {
    if (values.length < 2) return values[values.length - 1] || 0;
    
    const recentTrend = values.slice(-5);
    const slope = (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length;
    
    return values[values.length - 1] + (slope * periods);
  }

  private generateResourceRecommendations(history: ResourceMetrics[]): ResourceRecommendation[] {
    const recommendations: ResourceRecommendation[] = [];
    const current = this.currentMetrics;
    
    // CPU recommendations
    if (current.cpu.usage > 85) {
      recommendations.push({
        type: 'scale-up',
        resource: 'cpu',
        urgency: 'high',
        description: 'CPU usage is critically high - consider adding more CPU cores or instances',
        estimatedImpact: { performance: 40, cost: 20 }
      });
    } else if (current.cpu.usage < 20) {
      recommendations.push({
        type: 'scale-down',
        resource: 'cpu',
        urgency: 'low',
        description: 'CPU usage is low - consider reducing instances to save costs',
        estimatedImpact: { performance: -5, cost: -30 }
      });
    }

    // Memory recommendations
    if (current.memory.usage > 90) {
      recommendations.push({
        type: 'scale-up',
        resource: 'memory',
        urgency: 'critical',
        description: 'Memory usage is critically high - immediate scaling required',
        estimatedImpact: { performance: 50, cost: 25 }
      });
    }

    // Network recommendations
    if (current.network.latency > 100) {
      recommendations.push({
        type: 'optimize',
        resource: 'network',
        urgency: 'medium',
        description: 'Network latency is high - consider CDN or load balancer optimization',
        estimatedImpact: { performance: 30, cost: 10 }
      });
    }

    return recommendations;
  }

  private calculateResourceEfficiency(): ResourceEfficiency {
    const cpu = Math.max(0, Math.min(100, 100 - Math.abs(this.currentMetrics.cpu.usage - 70))); // Optimal ~70%
    const memory = Math.max(0, Math.min(100, 100 - Math.abs(this.currentMetrics.memory.usage - 75))); // Optimal ~75%
    const network = Math.max(0, Math.min(100, 100 - (this.currentMetrics.network.latency / 2))); // Lower latency = better
    
    const overall = (cpu + memory + network) / 3;
    
    return {
      cpu: Math.round(cpu),
      memory: Math.round(memory),
      network: Math.round(network),
      overall: Math.round(overall),
      grade: overall > 85 ? 'excellent' : overall > 70 ? 'good' : overall > 50 ? 'fair' : 'poor'
    };
  }

  async enableOptimization(optimizationId: string): Promise<void> {
    const optimization = this.optimizations.get(optimizationId);
    if (!optimization) {
      throw new Error(`Optimization ${optimizationId} not found`);
    }

    optimization.enabled = true;
    optimization.metrics.beforeImplementation = { ...this.currentMetrics };
    
    // Simulate optimization impact
    await this.applyOptimization(optimization);
    
    optimization.metrics.afterImplementation = { ...this.currentMetrics };
    optimization.metrics.improvement = this.calculateOptimizationImprovement(optimization);
  }

  private async applyOptimization(optimization: PerformanceOptimization): Promise<void> {
    // Simulate optimization effects
    const impact = optimization.impact.performance / 100;
    
    switch (optimization.type) {
      case 'caching':
        this.currentMetrics.network.latency *= (1 - impact * 0.5);
        this.currentMetrics.memory.usage *= (1 + impact * 0.1);
        break;
      case 'compression':
        this.currentMetrics.network.bandwidth *= (1 + impact);
        this.currentMetrics.cpu.usage *= (1 + impact * 0.1);
        break;
      case 'cdn':
        this.currentMetrics.network.latency *= (1 - impact * 0.6);
        break;
      case 'database':
        this.currentMetrics.storage.iops *= (1 + impact);
        this.currentMetrics.cpu.usage *= (1 - impact * 0.2);
        break;
    }
  }

  private calculateOptimizationImprovement(optimization: PerformanceOptimization): number {
    const before = optimization.metrics.beforeImplementation;
    const after = optimization.metrics.afterImplementation;
    
    if (!before || !after) return 0;
    
    // Calculate overall performance improvement
    const latencyImprovement = (before.network.latency - after.network.latency) / before.network.latency;
    const throughputImprovement = (after.network.throughput - before.network.throughput) / before.network.throughput;
    const cpuImprovement = (before.cpu.usage - after.cpu.usage) / before.cpu.usage;
    
    return Math.round(((latencyImprovement + throughputImprovement + cpuImprovement) / 3) * 100);
  }

  async getOptimizations(): Promise<PerformanceOptimization[]> {
    return Array.from(this.optimizations.values())
      .sort((a, b) => b.impact.performance - a.impact.performance);
  }

  async updateLoadBalancingStrategy(strategy: Partial<LoadBalancingStrategy>): Promise<void> {
    this.loadBalancer = { ...this.loadBalancer, ...strategy };
  }

  async getLoadBalancingStatus(): Promise<LoadBalancingStatus> {
    return {
      strategy: this.loadBalancer,
      activeConnections: Math.floor(Math.random() * 1000) + 100,
      healthyInstances: Math.floor(Math.random() * 8) + 2,
      totalInstances: 10,
      averageResponseTime: this.currentMetrics.network.latency,
      requestsPerSecond: this.currentMetrics.network.throughput
    };
  }
}

// Supporting interfaces
interface ScalingEvent {
  id: string;
  ruleId: string;
  direction: 'up' | 'down';
  magnitude: number;
  reason: string;
  timestamp: Date;
  success: boolean;
  error?: string;
  resourcesBefore: ResourceMetrics;
  resourcesAfter: ResourceMetrics | null;
}

interface ResourceAnalytics {
  current: ResourceMetrics;
  trends: ResourceTrends;
  predictions: ResourcePredictions;
  recommendations: ResourceRecommendation[];
  scalingEvents: ScalingEvent[];
  efficiency: ResourceEfficiency;
}

interface ResourceTrends {
  cpu: { direction: 'increasing' | 'decreasing' | 'stable'; magnitude: number };
  memory: { direction: 'increasing' | 'decreasing' | 'stable'; magnitude: number };
  network: { direction: 'increasing' | 'decreasing' | 'stable'; magnitude: number };
  storage: { direction: 'increasing' | 'decreasing' | 'stable'; magnitude: number };
}

interface ResourcePredictions {
  nextHour: { cpu: number; memory: number; confidence: number };
  nextDay: { cpu: number; memory: number; confidence: number };
  nextWeek: { cpu: number; memory: number; confidence: number };
}

interface ResourceRecommendation {
  type: 'scale-up' | 'scale-down' | 'optimize';
  resource: 'cpu' | 'memory' | 'network' | 'storage';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedImpact: { performance: number; cost: number };
}

interface ResourceEfficiency {
  cpu: number;
  memory: number;
  network: number;
  overall: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor';
}

interface LoadBalancingStatus {
  strategy: LoadBalancingStrategy;
  activeConnections: number;
  healthyInstances: number;
  totalInstances: number;
  averageResponseTime: number;
  requestsPerSecond: number;
}

export const resourceAllocationManager = new ResourceAllocationManager();