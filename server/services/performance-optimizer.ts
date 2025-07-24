import { performance } from 'perf_hooks';
import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  route: string;
  method: string;
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: Date;
  statusCode: number;
  errorRate?: number;
}

interface OptimizationRecommendation {
  type: 'memory' | 'response_time' | 'database' | 'caching' | 'rate_limiting';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
  impact: string;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private slowRoutes = new Map<string, number[]>();
  private errorCounts = new Map<string, number>();
  private totalRequests = new Map<string, number>();

  // Performance monitoring middleware
  middleware() {
    const self = this;
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = performance.now();
      const startMemory = process.memoryUsage();
      
      // Override res.end to capture metrics
      const originalEnd = res.end.bind(res);
      
      res.end = function(chunk?: any, encoding?: any, cb?: () => void): Response {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        const endMemory = process.memoryUsage();
        
        const route = `${req.method} ${req.route?.path || req.path}`;
        
        // Store metrics
        const metric: PerformanceMetrics = {
          route,
          method: req.method,
          responseTime,
          memoryUsage: {
            rss: endMemory.rss - startMemory.rss,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external,
            arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
          },
          timestamp: new Date(),
          statusCode: res.statusCode
        };

        // Track slow routes
        if (!self.slowRoutes.has(route)) {
          self.slowRoutes.set(route, []);
        }
        self.slowRoutes.get(route)!.push(responseTime);

        // Track error rates
        const isError = res.statusCode >= 400;
        if (isError) {
          self.errorCounts.set(route, (self.errorCounts.get(route) || 0) + 1);
        }
        self.totalRequests.set(route, (self.totalRequests.get(route) || 0) + 1);

        // Log slow requests
        if (responseTime > 1000) {
          console.log(`🚨 WARNING ALERT: Slow response time: ${responseTime.toFixed(2)}ms`);
        }

        // Store metric
        self.metrics.push(metric);
        
        // Keep only last 1000 metrics to prevent memory issues
        if (self.metrics.length > 1000) {
          self.metrics = self.metrics.slice(-1000);
        }

        return originalEnd(chunk, encoding, cb);
      };

      next();
    };
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics[] {
    return this.metrics.slice(-100); // Return last 100 metrics
  }

  // Get performance summary
  getSummary() {
    const recentMetrics = this.metrics.slice(-100);
    
    if (recentMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        memoryUsage: process.memoryUsage(),
        slowestRoutes: []
      };
    }

    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / recentMetrics.length) * 100;

    // Find slowest routes
    const routeAvgTimes = new Map<string, number>();
    const slowRoutesArray = Array.from(this.slowRoutes.entries());
    for (const [route, times] of slowRoutesArray) {
      const avg = times.reduce((a: number, b: number) => a + b, 0) / times.length;
      routeAvgTimes.set(route, avg);
    }

    const slowestRoutes = Array.from(routeAvgTimes.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([route, avgTime]) => ({ route, avgTime: Math.round(avgTime) }));

    return {
      averageResponseTime: Math.round(avgResponseTime),
      totalRequests: recentMetrics.length,
      errorRate: Math.round(errorRate * 100) / 100,
      memoryUsage: process.memoryUsage(),
      slowestRoutes
    };
  }

  // Get optimization recommendations
  getRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const summary = this.getSummary();
    const memUsage = process.memoryUsage();

    // Memory usage recommendations
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (heapUsagePercent > 80) {
      recommendations.push({
        type: 'memory',
        severity: 'critical',
        message: `High memory usage: ${heapUsagePercent.toFixed(1)}%`,
        suggestion: 'Implement garbage collection optimization and reduce memory leaks',
        impact: 'May cause application crashes and poor performance'
      });
    } else if (heapUsagePercent > 60) {
      recommendations.push({
        type: 'memory',
        severity: 'medium',
        message: `Elevated memory usage: ${heapUsagePercent.toFixed(1)}%`,
        suggestion: 'Monitor memory usage patterns and optimize data structures',
        impact: 'May lead to slower response times'
      });
    }

    // Response time recommendations
    if (summary.averageResponseTime > 1000) {
      recommendations.push({
        type: 'response_time',
        severity: 'high',
        message: `Slow average response time: ${summary.averageResponseTime}ms`,
        suggestion: 'Implement caching, optimize database queries, and consider CDN',
        impact: 'Poor user experience and potential customer loss'
      });
    } else if (summary.averageResponseTime > 500) {
      recommendations.push({
        type: 'response_time',
        severity: 'medium',
        message: `Above-optimal response time: ${summary.averageResponseTime}ms`,
        suggestion: 'Optimize critical code paths and implement response caching',
        impact: 'Reduced user satisfaction'
      });
    }

    // Error rate recommendations
    if (summary.errorRate > 5) {
      recommendations.push({
        type: 'rate_limiting',
        severity: 'high',
        message: `High error rate: ${summary.errorRate}%`,
        suggestion: 'Implement better error handling and rate limiting',
        impact: 'Application reliability issues'
      });
    }

    // Database optimization recommendations
    if (summary.slowestRoutes.some(route => route.avgTime > 2000)) {
      recommendations.push({
        type: 'database',
        severity: 'high',
        message: 'Database queries are very slow',
        suggestion: 'Add database indexes, optimize queries, implement connection pooling',
        impact: 'Significant performance degradation'
      });
    }

    // Caching recommendations
    if (summary.averageResponseTime > 300 && summary.totalRequests > 50) {
      recommendations.push({
        type: 'caching',
        severity: 'medium',
        message: 'No caching detected for high-traffic routes',
        suggestion: 'Implement Redis caching for frequently accessed data',
        impact: 'Improved response times and reduced server load'
      });
    }

    return recommendations;
  }

  // Get real-time system health
  getSystemHealth() {
    const memUsage = process.memoryUsage();
    const summary = this.getSummary();
    const uptime = process.uptime();

    // Calculate health score (0-100)
    let healthScore = 100;
    
    // Memory health (30% weight)
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (heapUsagePercent > 80) healthScore -= 30;
    else if (heapUsagePercent > 60) healthScore -= 15;
    else if (heapUsagePercent > 40) healthScore -= 5;

    // Response time health (40% weight)
    if (summary.averageResponseTime > 1000) healthScore -= 40;
    else if (summary.averageResponseTime > 500) healthScore -= 20;
    else if (summary.averageResponseTime > 300) healthScore -= 10;

    // Error rate health (30% weight)
    if (summary.errorRate > 5) healthScore -= 30;
    else if (summary.errorRate > 2) healthScore -= 15;
    else if (summary.errorRate > 1) healthScore -= 5;

    let status: 'healthy' | 'warning' | 'critical';
    if (healthScore >= 80) status = 'healthy';
    else if (healthScore >= 60) status = 'warning';
    else status = 'critical';

    return {
      status,
      score: Math.max(0, healthScore),
      uptime: Math.round(uptime),
      memoryUsage: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        percentage: Math.round(heapUsagePercent)
      },
      performance: {
        averageResponseTime: summary.averageResponseTime,
        errorRate: summary.errorRate,
        requestsPerMinute: this.getRequestsPerMinute()
      },
      timestamp: new Date()
    };
  }

  // Calculate requests per minute
  private getRequestsPerMinute(): number {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentRequests = this.metrics.filter(m => m.timestamp > oneMinuteAgo);
    return recentRequests.length;
  }

  // Clear old metrics (cleanup)
  cleanup() {
    const oneHourAgo = new Date(Date.now() - 3600000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    
    // Clear old route data
    const slowRoutesArray = Array.from(this.slowRoutes.entries());
    for (const [route, times] of slowRoutesArray) {
      if (times.length > 100) {
        this.slowRoutes.set(route, times.slice(-100));
      }
    }
  }

  // Auto-optimize based on metrics
  autoOptimize(): string[] {
    const recommendations = this.getRecommendations();
    const optimizations: string[] = [];

    for (const rec of recommendations) {
      if (rec.severity === 'critical') {
        // Force garbage collection for memory issues
        if (rec.type === 'memory') {
          if (global.gc) {
            global.gc();
            optimizations.push('Forced garbage collection');
          }
        }
        
        // Log critical issues
        console.error(`CRITICAL: ${rec.message} - ${rec.suggestion}`);
        optimizations.push(`Logged critical issue: ${rec.type}`);
      }
    }

    return optimizations;
  }
}

export const performanceOptimizer = new PerformanceOptimizer();

// Cleanup interval - run every 10 minutes
setInterval(() => {
  performanceOptimizer.cleanup();
}, 10 * 60 * 1000);

// Auto-optimize interval - run every 5 minutes
setInterval(() => {
  const optimizations = performanceOptimizer.autoOptimize();
  if (optimizations.length > 0) {
    console.log('Auto-optimizations applied:', optimizations);
  }
}, 5 * 60 * 1000);